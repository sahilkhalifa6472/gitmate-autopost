---
name: gitmate-autoreply-meta
description: git.mate comment-to-DM auto-reply: works via EAA reply_token on graph.facebook.com (2026-11-13); diag endpoint; token expiry
metadata:
  type: project
  modified: 2026-11-12T18:49:34.911Z
---

- Auto-reply code is live in the dashboard (lib/autoreply.ts, Inbox page). Read-only check: GET https://gitmate-autopost.vercel.app/api/autoreply?diag=1 with header x-upload-token: $GITMATE_QUEUE_KEY (PR #6).
- 2026-11-12 diag: old IGAA token is fine (git.mate, MEDIA_CREATOR, posting works), but Atlas reel comments_count 370 -> fetched 0, conversations 0. Cause: the old Meta app is in Development mode. Its Publish button is grey and its Marketing API use case can't be removed.
- Owner spent ~3h on Meta and is frustrated. Do NOT send them through new-app / Unified login / Graph Explorer / FB Page steps again. Apps created now have no "Instagram login" token flow: they need a business portfolio, a configuration and a FB Page.
- Owner chose the dashboard (not ManyChat). 2026-11-13: old app PUBLISHED (Live) after removing the extra permissions; the IGAA token still saw 0 comments.
- FIX (PR #7, merged 2026-11-13): an EAA... token (Graph API Explorer, Instagram permissions) reads comments + DMs on graph.facebook.com. Stored as config.reply_token (only auto-reply/Inbox/DMs use it; posting keeps ig_token). Set via dashboard Settings (EAA token auto-detected) or PUT /api/autoreply {reply_token} with QUEUE_KEY. Diag then: Atlas 96 fetched, 10 conversations.
- The EAA token is a SYSTEM USER token, Expires: Never (owner's debugger screenshot 2026-11-13), so it needs no refresh.
- Instagram refuses raw links in private replies (508/2534122 "Link can't be shared"). The DM now goes as a generic-template card with an "Open on GitHub" button; redis flag ar_card_mode skips the text attempt (PRs #8-#11). First cards were sent 2026-11-13 17:35 UTC. To retry failed comments: PUT /api/autoreply {retry_comment_ids:[...]}.
- Related: [[gitmate-autopost]]
- 2026-11-13 $9 PRIORITY FEATURE: owner takes $9 by PayPal (sends the email in DMs) + payment screenshot, then gives a fixed slot date. Owner asked to pitch everyone who DM'd a repo. 15 pitched by API at 17:40 UTC; 2 were rate-limited (Meta app limit #4). 2026-11-13 owner changed this: paid reels get a FIXED DATE via queue post_on (PR #18; engine posts it first that day, NY tz). Paid done: #28 Infradeck (karlo.ks, PayPal) post_on 2026-11-15, #29 DarkProof (is4wiz, USDC) post_on 2026-11-16, folders dev-reels/infradeck, dev-reels/darkproof. Paid reels tag the creator in the caption, show a creator credit, and end with 'Built something too? DM us your repo' before Comment GITMATE. Owner handles payments/slots in DMs himself.
- 2026-11-13 FOLLOW-GATE: quick-reply buttons DO show to the recipient (sender view hides them; owner verified via ai.herald). Gate msg now asks user to reply "LINK", follow msg asks "DONE" (PR #16). DM step matches /link|follow|done|yes|send|ok/.
- WEBHOOKS (PR #17, 2026-11-13): /api/webhook handles Meta verify + comments/messages events; cron then full-scans only every 25 min. Verify token stored in Redis ar_config.webhook_token (set via PUT /api/autoreply {webhook_token}); not stored here. Owner turned the toggle on and was given callback URL + token for Step 3 'Configure webhooks' (fields: comments, messages, messaging_postbacks). Optional env META_APP_SECRET enables signature check. Don't lower the cron below 5 min.
