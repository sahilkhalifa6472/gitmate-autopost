import { get, set, pushLog } from "./store";
import { Config, DEFAULT_CONFIG, Item, PlanSlot } from "./types";

export async function getConfig(): Promise<Config> {
  return { ...DEFAULT_CONFIG, ...(await get<Partial<Config>>("config", {})) };
}
export async function saveConfig(c: Config) { await set("config", c); }

export async function getQueue(): Promise<Item[]> { return get<Item[]>("queue", []); }
export async function saveQueue(q: Item[]) { await set("queue", q); }

export async function getPlans(): Promise<Record<string, PlanSlot[]>> { return get("plans", {}); }
export async function savePlans(p: Record<string, PlanSlot[]>) {
  const keep = Object.keys(p).sort().slice(-21);
  await set("plans", Object.fromEntries(keep.map((k) => [k, p[k]])));
}

export type LogEntry = { at: string; level: "info" | "ok" | "warn" | "error"; msg: string; id?: number };
export async function log(level: LogEntry["level"], msg: string, id?: number) {
  const e: LogEntry = { at: new Date().toISOString(), level, msg, ...(id != null ? { id } : {}) };
  console.log(`[${level}] ${msg}`);
  await pushLog(e);
}

// Caption cleanup: hashtags appended, max 30 tags, 2200 chars
export function igCaption(caption: string, hashtags: string[] = []) {
  let cap = caption.trim();
  const extra = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).filter((h, i, a) => a.indexOf(h) === i && !cap.toLowerCase().includes(h.toLowerCase()));
  if (extra.length) cap += "\n\n" + extra.join(" ");
  let n = 0;
  cap = cap.replace(/#[\p{L}\p{N}_]+/gu, (h) => (++n <= 30 ? h : ""));
  return cap.slice(0, 2200);
}
