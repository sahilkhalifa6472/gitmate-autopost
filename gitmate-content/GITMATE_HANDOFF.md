# git.mate project handoff (moved out of the "Growaun Content" project, 2026-11-21)

Read this first in the new git.mate project. The owner writes Hinglish: reply in short, simple Hinglish.

## 1. What git.mate is
- Instagram page **@git.mate** ("git.mate | GitHub Repos Daily"). One awareness reel per GitHub repo, for US/global devs (audience mostly 18-34, India ~36%).
- Biggest hit: Atlas file-manager reel (#19, 111k views). Everything since follows `dev-reels/viral_playbook.md` (pain hook, real footage, "free", easy install, under 35s).
- Runs 2 reels/day: 1 trending pick + 1 "old free DM repo" (repos people DM'd before 14 Nov). Paid "$9 feature" reels come on top (Orders tab).
- Separate from Growaun: never use the Growaun DigitalOcean server, UPLOAD_TOKEN or any Growaun file for git.mate.

## 2. Infra (NOTHING here moves; it keeps running as-is)
- Dashboard: https://gitmate-autopost.vercel.app (never share this URL publicly). Code: GitHub `sahilkhalifa6472/gitmate-autopost` (push to main = Vercel auto-deploy). Next.js 15 + Upstash Redis + Vercel Blob.
- cron-job.org hits /api/cron every 5 min; posts reels at planned New York times; Instagram token in dashboard Settings.
- Auto-reply (comment GITMATE -> DM card with GitHub link), Inbox, Orders ($9 feature flow), AI salesman (Gemini, currently OFF), weekly carousel support. Details in `memory/gitmate-autopost.md`, `gitmate-autoreply-meta.md`, `gitmate-paid-orders.md`, `gitmate-weekly-carousel.md`.
- 2026-11-20: Instagram restricted @git.mate from SENDING messages until 2026-12-20. AI salesman + follow-ups were turned OFF. Don't re-enable sales automation without the owner.
- API auth for Claude: header `x-upload-token: $GITMATE_QUEUE_KEY`. Queue: GET /api/queue; orders: GET/POST /api/orders.

## 3. Cloud environment the new project needs
- `GITMATE_QUEUE_KEY` (same value as QUEUE_KEY in Vercel)
- `ELEVENLABS_API_KEY` (new ElevenLabs account; voice Marcus `y0s2ExEMuum3muUnA6Zd`, model `eleven_v4`, REST with-timestamps; the ElevenLabs connector is the OLD empty account, don't use it)
- Network must reach vercel.app, api.elevenlabs.io, raw.githubusercontent.com, cdnjs.
- Never write keys into files or memory.

## 4. What's in this bundle (`gitmate-content/` in the repo)
| Folder | Copy to (new project files) | What |
|---|---|---|
| `dev-reels/` | `/mnt/project-files/dev-reels/` | every reel's source (reel.html, parts/, build.py, render.js, shots.js, sheet.py, sfx.py, script, caption, meta), log.json (all reels made), viral_playbook.md, gitmate_handoff.md (daily-run rules: paid first, 2 reels/day), ideas.md, weekly/ carousel runbook, vend/ (gsap + fonts), brand/ (profile pics), light-ref/lightmusic.wav |
| `gitmate-dashboard/` | `/mnt/project-files/gitmate-dashboard/` | dashboard copy + scripts/push-reel.mjs, push-carousel.mjs, SETUP.md |
| `social-autopost/gitmate-queue/` | `/mnt/project-files/social-autopost/gitmate-queue/` | N.json queue files (1..42+) |
| `skills/` | `/mnt/project-files/skills/` | instagram-agent-skill (ig-* writing skills), storytelling skill |
| `memory/` | save into the new project's memory | all git.mate memory files (rules, style, gotchas, autopost, orders, autoreply, viral study, carousel) |
| `routines/` | recreate as scheduled tasks | daily reel, Sunday viral study, Friday carousel prompts + cron |

Not included: old rendered mp4s, voices and per-reel media (2 GB; the videos already live on Vercel Blob / Instagram). Only the newest dark (`ghost-downloader`) and light (`plutus`) templates keep their media. Old queue JSONs point to mp4 paths that won't exist: the backlog push must skip missing files (all of them are already queued).

## 5. First-thread checklist in the new project
1. Copy the folders from the table above into `/mnt/project-files/` (from a clone of the repo).
2. Save each file in `memory/` as a project memory (keep names), plus a MEMORY.md index.
3. Check env: `GITMATE_QUEUE_KEY` and `ELEVENLABS_API_KEY` are set; GET /api/queue returns 200.
4. Create the 3 scheduled tasks from `routines/` (same schedules).
5. After the new daily reel task has run once successfully, tell the owner, and in the OLD Growaun project disable the 3 old git.mate tasks (trig_01Nvp77iUK48wXhrE3MVTSid, trig_0177rJRcJCSgufh4YWT99iEw, trig_01JiXGGGtJbayEiqEyjUNkJf). Disable, don't delete.

## 6. Key owner rules (short)
- Black & white only; dark and light reels alternate; NEW UI components every reel; all cards 3D, all transitions 3D camera moves; no subtitles (kinetic type); no overlaps.
- Real repo media only. Friendly "mate" English voice. Ending: Comment GITMATE + Follow tap.
- Audio ducked under voice, -14 LUFS. Cover frame = full hook visible.
- Facts verified. Free DM reels tag @user + "DM us FEATURE". Paid reels: post_on date, creator credit.
- Owner ideas: "git.mate reel: <link>" -> append to `dev-reels/ideas.md`; "abhi banao" = make it now.
- Dashboard work: mobile-first UI style (.ph, .prow, .tabbar); push to GitHub, Vercel deploys.
