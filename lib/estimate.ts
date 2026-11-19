// Rough "when will each queued reel post": today's open plan slots first, then posts_per_day a day
// (future times are picked at midnight New York, so only the day is known for those)
import { Config, Item, PlanSlot, isCarousel } from "./types";
import { nextItem } from "./engine";
import { tzParts, tzToUtc } from "./time";

export type Eta = { day: string; ms?: number };
export function estimate(cfg: Config, q: Item[], plans: Record<string, PlanSlot[]>): Record<number, Eta> {
  const out: Record<number, Eta> = {};
  const sim = q.filter((i) => !isCarousel(i)).map((i) => ({ ...i }));
  for (const c of q) if (isCarousel(c) && c.status === "queued" && c.post_on) out[c.id] = { day: c.post_on, ms: tzToUtc(cfg.timezone, c.post_on, c.post_min ?? 630) };
  const { day, min } = tzParts(cfg.timezone);
  const take = (d: string, ms?: number) => { const it = nextItem(sim, d); if (!it) return false; out[it.id] = { day: d, ms }; it.status = "posted"; it.force = false; return true; };
  const slots = (plans[day] || []).filter((t) => !t.id && !t.skipped && t.min + 120 >= min).sort((a, b) => a.min - b.min);
  for (const t of slots) take(day, tzToUtc(cfg.timezone, day, t.min));
  let d = new Date(Date.parse(day + "T12:00:00Z"));
  const per = Math.max(1, cfg.posts_per_day || 1);
  for (let i = 0; i < 60 && sim.some((x) => x.status === "queued"); i++) {
    d = new Date(d.getTime() + 864e5); const k = d.toISOString().slice(0, 10);
    for (let j = 0; j < per; j++) if (!take(k)) break;
  }
  return out;
}
