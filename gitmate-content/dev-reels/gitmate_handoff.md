## VIRAL PLAYBOOK — read first (owner rule 2026-11-15)
Before writing ANY reel script (trending, old free DM repo, or paid), read /mnt/project-files/dev-reels/viral_playbook.md and follow its rules: pain hook in the first 2 seconds with real footage, repo name after ~3-4s, plain words for normal users, "free" + easiest install, builder story, under 35s. For the trending pick, prefer free apps normal people use daily over niche AI-agent/CLI tools. In log.json add "playbook": which pain hook you used.

## PAID ORDERS — do this BEFORE picking a trending repo (owner rule 2026-11-13)
PAID ORDERS FIRST (owner rule 2026-11-13): GET https://gitmate-autopost.vercel.app/api/orders with header x-upload-token: $GITMATE_QUEUE_KEY. For every order with status "confirmed" (paid, date booked, no reel yet), oldest date first: make THAT repo's reel today instead of a trending pick (same quality rules; tag the buyer @<user> in the caption, show a small "built by @<user>" credit scene, and add "Built something too? DM us your repo." before the Comment GITMATE scene). Push it with meta.post_on = the order's date, then POST /api/orders {"action":"made","id":<order id>,"item_id":<queue id>} with the same header. Make at most 2 paid reels per run; if more are waiting, say so in the summary. TWO REELS EVERY DAY (owner rule 2026-11-15, replaces the older one-pick rule): the dashboard now posts 2 reels/day. Every run makes TWO reels: (A) the usual trending/ideas.md pick, exactly like before (that style performs well, keep it), AND (B) one OLD FREE REPO: from the same GET /api/orders response, "free" holds repos people DM'd before 14 Nov (oldest first). Take the OLDEST entry with status "new" and make its reel (open the repo, use its real README media; tag @<user> in the caption with "built by @<user>"; in the reel and caption say "Want your repo featured too? DM us FEATURE"). Push it (no post_on), then POST /api/orders {"action":"free_made","repo":<repo>,"item_id":<queue id>}. If the repo is broken/empty/unsafe, POST {"action":"free","repo":<repo>,"status":"dismissed"} and take the next one. Paid orders (above) come on top of these two. After posting, the dashboard marks free ones live and the owner sends them the reel from the Orders page.

# git.mate: Instagram page handoff

Paste this at the start of a new chat so Claude knows the whole setup.

## Page
- Instagram handle: @git.mate
- Name: git.mate | GitHub Repos Daily
- Bio:
  Your daily open-source mate 🤝
  1 useful GitHub repo, every day
  Free tools devs actually use
  💬 Comment GITMATE for the link
- Profile picture: glossy white ball with ">_" on a black background (gitmate_profile_dark.png)
- Content: one reel per GitHub repo, made for awareness: what the repo is, its key features, and why it's useful.

## Video style (approved)
- Dark developer look: black background, black and white only. The repo's own media may be in colour.
- Growaun-level motion design: detailed, smooth, kinetic typography.
- NO subtitles. Spoken words appear as big bold animated words instead (Inter Tight 900 headlines, JetBrains Mono for small labels).
- Liquid glass (Apple-style frosted glass) ONLY on 1-3 key cards. Everything else uses simple dark cards. Don't overuse glass.
- Never let elements overlap. Keep proper spacing.
- Use the repo's REAL images, screenshots and videos from its GitHub README whenever available.
- 1080x1920, 30fps, about 35-40 seconds.

## Voiceover
- English, ElevenLabs voice "Marcus - Bright, Upbeat and Clear", model eleven_v4.
- Tone: friendly "mate" vibe with real emotion, simple, never over the top. Tags like [excited], [warm] and [friendly] work well.
- Structure: hook ("this one honestly blew my mind"), what it is, 3-5 features, why it matters, CTA.
- Sound effects stay quiet and music low. Both duck under the voice, so the voice is always clear.

## Ending (every reel)
1. Say and show: "Comment GITMATE and I'll send you the link" (show a comment being typed and a DM with the link).
2. Last shot: a profile card (logo, @git.mate, name, bio) with a Follow button that gets tapped and turns into "Following ✓".

## Reels made so far
1. openGym: free self-hosted gym tracker (older style, too much glass). Also a 9-slide carousel.
2. awesome-opus5-5-videos (github.com/yihui-dev/awesome-opus5-5-videos): made with the new rules. This is the reference for future reels.
