// Storage: Upstash Redis on Vercel; a local JSON file when no Redis env is set (dev only).
import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const P = "gm:"; // key prefix

const FILE = path.join(process.cwd(), ".data", "store.json");
function fileRead(): Record<string, any> {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; }
}
function fileWrite(d: Record<string, any>) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(d, null, 1));
}

export const storeKind = redis ? "redis" : "file";

export async function get<T>(key: string, fallback: T): Promise<T> {
  if (redis) return ((await redis.get<T>(P + key)) ?? fallback) as T;
  const d = fileRead();
  return (d[key] ?? fallback) as T;
}

export async function set(key: string, value: unknown) {
  if (redis) { await redis.set(P + key, value); return; }
  const d = fileRead(); d[key] = value; fileWrite(d);
}

export async function pushLog(entry: unknown, max = 1500) {
  if (redis) { await redis.lpush(P + "logs", entry); await redis.ltrim(P + "logs", 0, max - 1); return; }
  const d = fileRead(); d.logs = [entry, ...(d.logs || [])].slice(0, max); fileWrite(d);
}

export async function getLogs(n = 500): Promise<any[]> {
  if (redis) return (await redis.lrange(P + "logs", 0, n - 1)) as any[];
  return (fileRead().logs || []).slice(0, n);
}

// simple lock so two cron calls never post at the same time
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
