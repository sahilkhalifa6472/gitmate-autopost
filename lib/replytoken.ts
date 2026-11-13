import * as ig from "./ig";
import { getConfig, saveConfig, log } from "./data";

// Save a Facebook-Graph (EAA...) token used only for comments + DMs. Posting keeps using ig_token.
export async function setReplyToken(tok: string): Promise<{ ok?: boolean; error?: string; username?: string }> {
  const cfg = await getConfig();
  if (!tok) { cfg.reply_token = undefined; await saveConfig(cfg); await log("info", "Reply token removed"); return { ok: true }; }
  if (!tok.startsWith("EAA")) return { error: "Reply token must be an EAA... token" };
  if (!cfg.ig_user_id) return { error: "Connect the Instagram account first" };
  try {
    const a = await ig.fbAccount(cfg.ig_user_id, tok);
    cfg.reply_token = tok;
    cfg.reply_token_at = Date.now();
    await saveConfig(cfg);
    await log("ok", `Comments/DM token connected for @${a.username}`);
    return { ok: true, username: a.username };
  } catch (e: any) {
    return { error: `Token did not work: ${e.message.slice(0, 300)}` };
  }
}
