import { accountList, Account } from "./data";
// selected account from ?a=<id>, else the first connected one
export async function pick(sp: Promise<Record<string, string | string[] | undefined>>): Promise<{ list: Account[]; acc?: Account; q: Record<string, string> }> {
  const raw = await sp; const q: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string") q[k] = v;
  const list = await accountList();
  return { list, acc: list.find((a) => a.id === q.a) || list[0], q };
}
export const ago = (ms: number) => {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return "abhi"; if (m < 60) return `${m}m ago`; const h = Math.round(m / 60); if (h < 48) return `${h}h ago`; return `${Math.round(h / 24)}d ago`;
};
