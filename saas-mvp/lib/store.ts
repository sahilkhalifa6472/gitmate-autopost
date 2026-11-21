// Storage: Upstash Redis (its own new database, never git.mate's). Local JSON file when no Redis env (dev only).
import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const P = "ap:";

const FILE = path.join(process.cwd(), ".data", "store.json");
const fileRead = (): Record<string, any> => { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } };
const fileWrite = (d: Record<string, any>) => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d, null, 1)); };

export const storeKind = redis ? "redis" : "file";

export async function get<T>(key: string, fallback: T): Promise<T> {
  if (redis) return ((await redis.get<T>(P + key)) ?? fallback) as T;
  return (fileRead()[key] ?? fallback) as T;
}
export async function set(key: string, value: unknown) {
  if (redis) { await redis.set(P + key, value); return; }
  const d = fileRead(); d[key] = value; fileWrite(d);
}
export async function pushList(key: string, entry: unknown, max = 500) {
  if (redis) { await redis.lpush(P + key, entry); await redis.ltrim(P + key, 0, max - 1); return; }
  const d = fileRead(); d[key] = [entry, ...(d[key] || [])].slice(0, max); fileWrite(d);
}
export async function getList<T = any>(key: string, n = 200): Promise<T[]> {
  if (redis) return (await redis.lrange(P + key, 0, n - 1)) as T[];
  return (fileRead()[key] || []).slice(0, n);
}
// "seen" ids (comments / messages already handled); returns true only the FIRST time an id is claimed
export async function claim(key: string, id: string): Promise<boolean> {
  if (redis) return (await redis.sadd(P + key, id)) === 1;
  const d = fileRead(); const s: string[] = d[key] || [];
  if (s.includes(id)) return false;
  d[key] = [...s, id].slice(-5000); fileWrite(d); return true;
}
export async function unclaim(key: string, id: string) {
  if (redis) { await redis.srem(P + key, id); return; }
  const d = fileRead(); d[key] = (d[key] || []).filter((x: string) => x !== id); fileWrite(d);
}
// counter that resets after `seconds` (used for the hourly DM limit)
export async function bump(key: string, seconds: number): Promise<number> {
  if (redis) { const n = await redis.incr(P + key); if (n === 1) await redis.expire(P + key, seconds); return n; }
  const d = fileRead(); const c = d[key] && d[key].until > Date.now() ? d[key] : { n: 0, until: Date.now() + seconds * 1000 };
  c.n++; d[key] = c; fileWrite(d); return c.n;
}
export async function lock(name: string, seconds: number): Promise<boolean> {
  if (redis) return (await redis.set(P + "lock:" + name, Date.now(), { nx: true, ex: seconds })) === "OK";
  const d = fileRead(); const k = "lock:" + name;
  if (d[k] && Date.now() - d[k] < seconds * 1000) return false;
  d[k] = Date.now(); fileWrite(d); return true;
}
export async function unlock(name: string) {
  if (redis) { await redis.del(P + "lock:" + name); return; }
  const d = fileRead(); delete d["lock:" + name]; fileWrite(d);
}
