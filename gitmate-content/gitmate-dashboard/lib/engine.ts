// The auto-post engine. /api/cron calls tick() every 5 minutes.
// Each day in the audience timezone gets a plan of random post times inside the
// configured windows. A post is done in small steps across ticks (create container -> Instagram
// processes it -> publish), so no call runs long. Views 12h after a post score its window, and
// later plans favour the winning windows while still exploring others.
import { del } from "@vercel/blob";
import * as ig from "./ig";
import { getConfig, saveConfig, getQueue, saveQueue, getPlans, savePlans, log } from "./data";
import { lock, unlock } from "./store";
import { tzParts, hhmm } from "./time";
import { Config, Item, PlanSlot } from "./types";

const SNAPSHOT_HOURS = 12;
const STATS_AT_HOURS = [12, 24, 72, 168];
const POST_WINDOW_MIN = 120;     // a missed time still posts within 2h
const MAX_TRIES = 3;
const PROCESS_TIMEOUT_MIN = 40;  // give Instagram this long to process a video

export function windowScores(cfg: Config, q: Item[]) {
  const w = cfg.windows.map(() => ({ n: 0, views: 0 }));
  for (const it of q) if (it.snapshot && it.window != null && w[it.window]) { w[it.window].n++; w[it.window].views += it.snapshot.views || 0; }
  const measured = w.filter((x) => x.n).map((x) => x.views / x.n);
  const best = measured.length ? Math.max(...measured) : 1;
  return w.map((x) => ({ ...x, avg: x.n ? Math.round(x.views / x.n) : null, score: (x.n >= 2 ? x.views / x.n : best * 0.8 + 1) ** 2 }));
}

export function makePlan(cfg: Config, q: Item[], nowMin: number, count: number): PlanSlot[] {
  const scores = windowScores(cfg, q);
  const open = cfg.windows.map((_, i) => i).filter((i) => cfg.windows[i][1] * 60 - 20 > nowMin);
  for (let attempt = 0; attempt < 200; attempt++) {
    const pool = [...open];
    const picks: number[] = [];
    while (picks.length < count && pool.length) {
      let idx: number;
      if (Math.random() < cfg.explore) idx = Math.floor(Math.random() * pool.length);
      else {
        const total = pool.reduce((s, i) => s + scores[i].score, 0);
        let r = Math.random() * total;
        idx = pool.findIndex((i) => (r -= scores[i].score) <= 0);
        if (idx < 0) idx = pool.length - 1;
      }
      picks.push(pool.splice(idx, 1)[0]);
    }
    const times = picks.map((w) => {
      const lo = Math.max(cfg.windows[w][0] * 60, nowMin + 5);
      const hi = cfg.windows[w][1] * 60 - 20;
      return { window: w, min: lo + Math.floor(Math.random() * Math.max(1, hi - lo)) };
    }).sort((a, b) => a.min - b.min);
    if (times.every((t, i) => i === 0 || t.min - times[i - 1].min >= cfg.min_gap_min) || attempt === 199) return times;
  }
  return [];
}

const nextItem = (q: Item[]) =>
  q.find((it) => it.status === "queued" && it.force) || q.find((it) => it.status === "queued" && (it.tries || 0) < MAX_TRIES);

async function refreshIfNeeded(cfg: Config) {
  if (!cfg.ig_token || Date.now() - (cfg.token_refreshed_at || 0) < 7 * 864e5) return;
  try {
    cfg.ig_token = await ig.refreshToken(cfg.ig_token);
    cfg.token_refreshed_at = Date.now();
    await saveConfig(cfg);
    await log("info", "Instagram token refreshed (valid ~60 more days)");
  } catch (e: any) { await log("warn", `Token refresh failed, will retry: ${e.message}`); }
}

async function collectInsights(cfg: Config, q: Item[]) {
  let changed = false;
  for (const it of q) {
    if (!it.media_id || !it.posted_at) continue;
    const ageH = (Date.now() - Date.parse(it.posted_at)) / 3600e3;
    const due = STATS_AT_HOURS.filter((h) => ageH >= h && !(it.stats_at || []).includes(h));
    if (!due.length) continue;
    try {
      const s = await ig.insights(it.media_id, cfg.ig_token!);
      if (!it.snapshot && ageH >= SNAPSHOT_HOURS) it.snapshot = s;
      it.latest = s;
      it.stats_at = [...(it.stats_at || []), ...due];
      changed = true;
      await log("info", `Insights #${it.id} @${Math.round(ageH)}h: ${s.views ?? 0} views, ${s.reach ?? 0} reach, ${s.shares ?? 0} shares`, it.id);
    } catch (e: any) { await log("warn", `Insights #${it.id} failed: ${e.message}`, it.id); }
  }
  return changed;
}

async function cleanupVideos(cfg: Config, q: Item[]) {
  let changed = false;
  for (const it of q) {
    if (it.status !== "posted" || it.blob_deleted || !it.posted_at || !it.video_url.includes(".blob.vercel-storage.com")) continue;
    if (Date.now() - Date.parse(it.posted_at) < cfg.keep_video_days * 864e5) continue;
    try { await del(it.video_url); it.blob_deleted = true; changed = true; await log("info", `Deleted stored video file of #${it.id} (posted ${cfg.keep_video_days}+ days ago)`, it.id); }
    catch (e: any) { await log("warn", `Could not delete video file of #${it.id}: ${e.message}`, it.id); }
  }
  return changed;
}

function fail(it: Item, msg: string) {
  it.tries = (it.tries || 0) + 1;
  it.error = msg;
  it.pending = undefined;
  it.force = false;
  it.status = it.tries >= MAX_TRIES ? "failed" : "queued";
}

// Step 2: container exists, wait for Instagram to finish processing, then publish
async function advancePending(cfg: Config, it: Item, plans: Record<string, PlanSlot[]>) {
  const p = it.pending!;
  try {
    const s = await ig.containerStatus(p.container_id, cfg.ig_token!);
    if (s.status_code === "FINISHED") {
      const pub = await ig.publish(cfg.ig_user_id!, cfg.ig_token!, p.container_id);
      it.media_id = pub.id;
      it.permalink = await ig.permalink(pub.id, cfg.ig_token!);
      it.posted_at = new Date().toISOString();
      it.window = p.window;
      it.status = "posted";
      it.pending = undefined;
      it.force = false;
      it.error = undefined;
      await log("ok", `Posted #${it.id} "${it.title}" ${it.permalink}`, it.id);
      return true;
    }
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") {
      fail(it, `Instagram processing ${s.status_code}: ${s.status || ""}`);
      await log("error", `#${it.id} ${it.error} (try ${it.tries}/${MAX_TRIES})`, it.id);
      return true;
    }
    if (Date.now() - Date.parse(p.started_at) > PROCESS_TIMEOUT_MIN * 60e3) {
      fail(it, "Instagram processing timed out");
      await log("error", `#${it.id} processing timed out (try ${it.tries}/${MAX_TRIES})`, it.id);
      return true;
    }
    await log("info", `#${it.id} Instagram is still processing the video (${s.status_code})`, it.id);
    return false;
  } catch (e: any) {
    fail(it, e.message);
    await log("error", `#${it.id} publish failed: ${e.message} (try ${it.tries}/${MAX_TRIES})`, it.id);
    return true;
  }
}

// Step 1: send the video to Instagram
async function startPost(cfg: Config, it: Item, window: number) {
  try {
    const c = await ig.createReel(cfg.ig_user_id!, cfg.ig_token!, { video_url: it.video_url, caption: it.caption, thumb_offset: it.cover_offset_ms });
    it.status = "posting";
    it.pending = { container_id: c.id, started_at: new Date().toISOString(), window };
    await log("info", `#${it.id} sent to Instagram, waiting for processing`, it.id);
  } catch (e: any) {
    fail(it, e.message);
    await log("error", `#${it.id} could not start post: ${e.message} (try ${it.tries}/${MAX_TRIES})`, it.id);
  }
}

export async function tick(opts: { source?: string } = {}) {
  if (!(await lock("tick", 240))) return { ok: false, note: "another run is busy" };
  try {
    const cfg = await getConfig();
    if (!cfg.ig_token || !cfg.ig_user_id) { await log("warn", "No Instagram account connected yet (Settings)"); return { ok: false, note: "not connected" }; }
    await refreshIfNeeded(cfg);
    const q = await getQueue();
    const plans = await getPlans();
    let changed = (await collectInsights(cfg, q)) || (await cleanupVideos(cfg, q));
    const { day, min } = tzParts(cfg.timezone);

    // 1) a post in progress? move it forward first
    const pend = q.find((it) => it.status === "posting" && it.pending);
    if (pend) {
      if (await advancePending(cfg, pend, plans)) {
        changed = true;
        for (const slots of Object.values(plans)) for (const s of slots) if (s.id === pend.id && pend.status !== "posted") delete s.id;
        await savePlans(plans);
      }
      if (changed) await saveQueue(q);
      return { ok: true, note: "advanced pending post" };
    }

    if (cfg.paused) { if (changed) await saveQueue(q); return { ok: true, note: "paused" }; }

    // 2) "post now" from the dashboard
    const forced = q.find((it) => it.status === "queued" && it.force);
    if (forced) {
      await log("info", `Post now requested for #${forced.id}`, forced.id);
      await startPost(cfg, forced, -1);
      // a manual post takes the next open slot of today's plan, so the day's total stays the same
      const slot = (plans[day] || []).find((t) => !t.id && !t.skipped);
      if (slot && forced.status === "posting") { slot.id = forced.id; slot.note = "posted manually"; await savePlans(plans); }
      await saveQueue(q);
      return { ok: true, note: "forced post started" };
    }

    // 3) today's plan
    if (!plans[day]) {
      const doneToday = q.filter((it) => it.posted_at && tzParts(cfg.timezone, Date.parse(it.posted_at)).day === day).length;
      const count = Math.max(0, cfg.posts_per_day - doneToday);
      plans[day] = makePlan(cfg, q, min, count);
      await savePlans(plans);
      await log("info", `Plan for ${day}: ${plans[day].map((t) => hhmm(t.min)).join(", ") || "nothing left today"} (${cfg.timezone})`);
    }
    for (const t of plans[day]) {
      if (t.id || t.skipped || min < t.min) continue;
      if (min > t.min + POST_WINDOW_MIN) { t.skipped = true; t.note = "missed"; await savePlans(plans); continue; }
      const it = nextItem(q);
      if (!it) { t.note = "queue empty"; await savePlans(plans); await log("warn", `${hhmm(t.min)}: queue is empty, nothing to post`); break; }
      t.id = it.id;
      await startPost(cfg, it, t.window);
      if (it.status !== "posting") delete t.id;
      await savePlans(plans);
      changed = true;
      break;
    }
    if (changed) await saveQueue(q);
    return { ok: true, day, min: hhmm(min), source: opts.source || "" };
  } catch (e: any) {
    await log("error", `Run failed: ${e.message}`);
    return { ok: false, error: e.message };
  } finally {
    await unlock("tick");
  }
}
