# git.mate weekly Friday carousel (runbook)

Owner ask (2026-11-19): every Friday, one big 4:5 carousel (1080x1350, NOT 1:1) of all reels shared that week,
in the git.mate 3D dark style, made to go viral on Explore, last slide = Comment GITMATE + Follow.
Nothing existing may change: daily reels, dashboard, auto-reply, orders, sales AI.

## How posting works (dashboard, PR #33)
- Queue item `kind: "carousel"` with `images` (2-10 JPEG), `post_on` (NY date), `post_min` (min of day, NY).
  Default/used: 630 = 10:30 AM New York = 9:00 PM IST Friday.
- Carousels never take the daily reel slot, so the daily reel still posts that day.
- "GITMATE" commenters get a DM with one GitHub card per repo (from `links`), button "Open on GitHub" (PR #36).
- OWNER RULE: NEVER share the dashboard URL (gitmate-autopost...) with anyone, in captions, DMs, slides or links.
- Push: `scripts/push-carousel.mjs <dashboard url> <carousel.json>` (in repo sahilkhalifa6472/gitmate-autopost;
  run from a scratch dir with `npm i @vercel/blob@2`, env GITMATE_QUEUE_KEY, `NODE_USE_ENV_PROXY=1`).

## Steps each Friday (IST morning)
1. GET https://gitmate-autopost.vercel.app/api/queue (header x-upload-token: $GITMATE_QUEUE_KEY).
   This week's reels = items with status "posted", no `kind`, posted_at after the previous carousel's
   post date (or last 7 days). Skip if a slug `weekly-<friday YYYY-MM-DD>` already exists.
2. Max 10 slides: cover + up to 8 repos + CTA. If more than 8 reels, keep the 8 with the most
   `latest.views`. Order by views (best first = #1).
3. Copy the previous week's folder `dev-reels/weekly/<last friday>/src/` to `dev-reels/weekly/<this friday>/src/`.
   Edit only `week.js` (label/range/repos). Per repo: name, kick, sub (serif line), repo, img (grayscale
   copy of the reel's real README media from dev-reels/<slug>/media, made with PIL into src/m/),
   bar, chips (2 facts, real numbers from the reel's meta.json caption), facts (3 lines), card geometry
   (alternate ry +10/-10). Facts must come from the reel caption, never invented.
4. Render: `node shoot.js out` in src (Playwright, viewport 1080x1350), check a contact sheet by eye:
   no text cut, chips not covering a headline, names fit (long names: fs 96-108).
   Save JPEGs 01..10.jpg (quality 93) in the week folder.
5. Write carousel.json (see last week's): slug weekly-<friday>, post_on <friday>, post_min 630,
   caption = hook line + numbered list + "Comment GITMATE and I'll DM you all N links" + follow line,
   ~15 hashtags, links [{title:"#k Name", url}].
6. Push with push-carousel.mjs, then confirm in /api/queue (kind carousel, queued, 10 images) and
   that the item has all `links` (real GitHub URLs).
7. Append to this file's Weekly log: date, queue id, repos.

## Weekly log
- 2026-11-20: #40, 8 repos (Astryx, Sherlock, Ruff, Infradeck, Codex Security, MuJoCo, DarkProof, 4R022 Heart),
  posts Fri 10:30 AM NY / 9:00 PM IST. Folder dev-reels/weekly/2026-11-20/.
