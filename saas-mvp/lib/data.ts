import { get, set, pushList, getList } from "./store";

export type Rule = { id: string; keyword: string; dm_text: string; link?: string; button?: string; public_reply?: string; on: boolean; created: number };
export type Account = {
  id: string;            // Instagram professional account id (same id webhooks send)
  username: string;
  token: string;         // long-lived Instagram Login token (IGAA...), refreshed automatically
  token_at: number;      // when it was issued / last refreshed (ms)
  reply_token?: string;  // optional EAA... token for comments/DMs (backup path that worked for git.mate)
  connected_at: number;
  rules: Rule[];
  ai_on: boolean;
  brain: string;         // what the business sells: products, prices, links, FAQ, rules
  goal: string;          // what the AI should push for
  tone: string;
  last_error?: string;
};
export type Post = {
  id: string; account: string; video_url: string; caption: string; at: number;
  status: "scheduled" | "processing" | "posted" | "failed";
  creation_id?: string; media_id?: string; permalink?: string; error?: string; tries?: number;
};
export type Ev = { at: string; account: string; kind: "post" | "comment" | "dm" | "ai" | "token" | "error"; text: string; ok: boolean };
export type Handoff = { at: string; account: string; user_id: string; username?: string; text: string; why: string };

export const DEFAULT_BRAIN = `Business: <naam, kya karte ho, 1-2 line>

Products / services:
- <product 1> : <price> : <kya milta hai> : <link>
- <product 2> : <price> : <kya milta hai> : <link>

FAQ:
- Delivery / time: <...>
- Refund: <...>

Rules:
- Discount mat dena (ya max 10%)
- Payment sirf upar wale link se`;

export async function accounts(): Promise<Record<string, Account>> { return get("accounts", {}); }
export async function accountList(): Promise<Account[]> { return Object.values(await accounts()).sort((a, b) => a.connected_at - b.connected_at); }
export async function account(id: string): Promise<Account | undefined> { return (await accounts())[id]; }
export async function saveAccount(a: Account) { const all = await accounts(); all[a.id] = a; await set("accounts", all); }
export async function patchAccount(id: string, p: Partial<Account>) {
  const all = await accounts(); if (!all[id]) return; all[id] = { ...all[id], ...p }; await set("accounts", all);
}
export async function removeAccount(id: string) { const all = await accounts(); delete all[id]; await set("accounts", all); }

export async function posts(): Promise<Post[]> { return get("posts", []); }
export async function savePosts(p: Post[]) { await set("posts", p.slice(-300)); }

export async function log(account: string, kind: Ev["kind"], text: string, ok = true) {
  await pushList("events", { at: new Date().toISOString(), account, kind, text: text.slice(0, 500), ok } satisfies Ev, 800);
}
export const events = (n = 100) => getList<Ev>("events", n);
export const handoffs = (n = 50) => getList<Handoff>("handoffs", n);
export async function addHandoff(h: Omit<Handoff, "at">) { await pushList("handoffs", { at: new Date().toISOString(), ...h }, 200); }
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
