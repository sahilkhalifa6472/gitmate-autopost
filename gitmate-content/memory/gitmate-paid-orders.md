---
name: gitmate-paid-orders
description: git.mate $9 'feature your repo' orders run through the dashboard Orders tab (FEATURE DM flow); daily task must make confirmed paid reels first
metadata:
  type: project
---

- 2026-11-13 built (PR #19): DM webhook handles "FEATURE" -> offer DM (price/PayPal/USDC from Orders > Offer settings, stored in Redis order_cfg) -> user sends repo link + screenshot or Solana tx (USDC auto-verified on chain) -> Orders tab "Check payment" -> owner presses Confirm -> next free date (1 paid/day, counts queue post_on too) booked + DM to user. Repo links sent without FEATURE -> "Free repos" list (owner can mark featured/skip).
- Daily reel task (trig_01Nvp77iUK48wXhrE3MVTSid, its prompt can't be edited by tool): instructions live in /mnt/project-files/dev-reels/gitmate_handoff.md top section. GET /api/orders (x-upload-token GITMATE_QUEUE_KEY): status "confirmed" -> make that reel first, push with meta.post_on = order.date, then POST {action:"made",id,item_id}. Featured free repos = owner ideas.
- After posting, engine sends buyer a "your reel is live" DM (fails outside Instagram 24h window; note shown on order).
- Paid reels so far (manual, before Orders existed): #28 Infradeck 2026-11-15, #29 DarkProof 2026-11-16.
- 2026-11-14 OWNER STRATEGY (PR #21): NO new free features. Any new repo link DM'd (even without FEATURE) gets the paid offer. Repos DM'd BEFORE 14 Nov = "Old repos · free" list on Orders (imported from IG conversations: 32 waiting after dismissing already-made atlas/opus-videos/DarkProof/Infradeck). Daily task makes the oldest one per day when no paid reel is due (POST free_made), as bait like the Atlas reel; after post the engine marks it live, tries a DM (usually fails, 24h window), owner sends via Orders page Copy message / Open their DM / Sent. Rule text in gitmate_handoff.md top section.
- 2026-11-15: 15 Nov paid reel looked 'missed' because the plan slot was 21:26 New York (= 16th IST); owner posted manually. Fix PR #25: post_on reels get a 7am-12pm NY slot (evening IST). posts_per_day set to 2 (owner: daily 2 = 1 trending pick + 1 old free DM repo, paid on top). GET /api/queue?debug=1 shows plans+logs (key auth); POST /api/settings accepts the queue key.
- Related: [[gitmate-autoreply-meta]], [[gitmate-autopost]]
- 2026-11-15 'DM FEATURE' promo reel for a paid boost (Bengaluru targeting, no city mentioned): /mnt/project-files/dev-reels/feature-promo/ (dark, 33.3s, Atlas 111,733-views story as proof, ends DM FEATURE). Delivered for review, NOT queued on the dashboard as of 2026-11-15.

- 2026-11-19 AI SALESMAN (PR #27): Gemini (owner said Claude too costly) answers non-flow DMs, pay buttons, 1 follow-up 3-20h, "Needs you" list, per-user pause; Orders page card. Gemini key now pasted on Orders page AI card (Redis sales_key, PR #28; env GEMINI_API_KEY also works); owner's key saved 2026-11-19 (owner pasted it in chat, advised to rotate). Models: gemini-2.5-flash 404 for new keys; fallback chain 3.8-flash -> flash-latest -> 3.1-flash-lite -> 3.5-flash (PR #29/#30). Owner must press Turn AI on. Discount default 0 (owner never answered $7 question). API /api/sales.
- 2026-11-20 INSTAGRAM RESTRICTION: @git.mate can't send messages until 2026-12-20 ("prohibited commercial practices / may deceive others to take money"). Likely cause: automated paid offers + crypto address in DMs + AI sales DMs. I turned AI salesman + follow-ups OFF. Gave owner appeal text; proposed removing automatic offer/payment DMs and USDC (waiting for owner OK). Don't re-enable sales automation without owner.
