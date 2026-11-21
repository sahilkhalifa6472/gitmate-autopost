// AI DM replies with Claude Haiku 5.5, answering only from this account's own "business brain".
import Anthropic from "@anthropic-ai/sdk";
import type { Account } from "./data";

export const AI_MODEL = "claude-haiku-5-5";
export const aiReady = () => !!process.env.ANTHROPIC_API_KEY;

export type Turn = { from: "customer" | "us"; text: string };
export type AiOut = { reply: string; handoff: boolean; reason: string };

// Same rules for every account (learnt from the git.mate DM ban on 2026-11-20)
const SAFETY = `Hard rules, always:
- Answer ONLY from the business info below. Never invent a price, offer, stock, date or fact. If the info doesn't cover it, set handoff=true and write a short holding reply ("Ek sec, main check karke batata hoon").
- Never ask for payment, bank details, UPI, card numbers or crypto. If they want to buy, share only a checkout/booking link that is written in the business info.
- Never pressure, never fake urgency, never promise results.
- If they are angry, want a human, ask something personal/legal/medical, or say stop: set handoff=true.
- If they say stop / unsubscribe / don't message: reply is an empty string and handoff=true.
- Keep it short like a real Instagram DM: 1-3 sentences, max 1 emoji, no markdown.
- Reply in the customer's language (Hindi, Hinglish or English).`;

const SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "The DM to send now (may be empty when handoff is true and nothing should be sent)" },
    handoff: { type: "boolean", description: "true when a human should take over this chat" },
    reason: { type: "string", description: "One short line: why handoff (empty when false)" },
  },
  required: ["reply", "handoff", "reason"],
  additionalProperties: false,
};

export async function aiReply(acc: Account, turns: Turn[]): Promise<AiOut> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const system = `You are the Instagram DM assistant for @${acc.username}. You talk to people who messaged this account.

${SAFETY}

Your goal in chats: ${acc.goal || "answer questions and share the right link when they are interested"}
Tone: ${acc.tone || "friendly, simple, like a helpful shop owner"}

Business info (the ONLY source of truth):
"""
${acc.brain.slice(0, 12000)}
"""`;
  const transcript = turns.slice(-16).map((t) => `${t.from === "customer" ? "Customer" : "You"}: ${t.text}`).join("\n");
  const res = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system,
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: `Chat so far (oldest first):\n${transcript}\n\nWrite your next reply to the customer.` }],
  });
  if (res.stop_reason === "refusal") return { reply: "", handoff: true, reason: "AI declined this chat" };
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  try {
    const o = JSON.parse(text) as AiOut;
    return { reply: String(o.reply || "").slice(0, 900), handoff: !!o.handoff, reason: String(o.reason || "") };
  } catch {
    return { reply: "", handoff: true, reason: "AI answer was not readable" };
  }
}
