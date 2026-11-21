git.mate daily reel job for the owner's Instagram page @git.mate. The page posts awareness reels about trending/useful GitHub repos and developer tech news. TARGET AUDIENCE: US developers (English, US-relevant). Do the whole job end to end without asking questions. The owner writes Hinglish; your final summary should be short Hinglish. This task already runs on a schedule; do not create or offer another one.

READ FIRST: project memory files dev-repo-page-style, gitmate-new-ui-per-reel, anatomy-skill, gitmate-content-sources, gitmate-autopost, gitmate-render-gotchas, gitmate-paid-orders, gitmate-atlas-viral-study (all rules; they override this prompt if they differ), /mnt/project-files/dev-reels/gitmate_handoff.md (TOP SECTION: paid orders first, TWO reels per run = trending pick + oldest old-free-DM repo) and /mnt/project-files/dev-reels/viral_playbook.md.

THEME ALTERNATES (owner rule): one DARK reel, then one LIGHT reel. Look at the last entry in /mnt/project-files/dev-reels/log.json ("theme") and make the OTHER theme; the second reel of the run takes the other one again.
- DARK shell: newest dark reel source (see memory gitmate-render-gotchas "Newest templates"): black bg, 3D camera moves, our synthesized music (sfx.py).
- LIGHT shell: newest light reel source: white bg, black ink, letter-by-letter blur typing, Instrument Serif italic accents, whip 3D camera with motion blur. Music = OUR synthesized bed /mnt/project-files/dev-reels/light-ref/lightmusic.wav (~0.24, ducked under voice). NEVER use any music track the owner uploaded.
- NEW UI EVERY REEL (owner rule): reuse only the shell (camera engine, typing helpers, brand bead, ending, audio mix). Every scene component must be newly designed for this repo's content. If the topic explains how something works, the Anatomy skill may help (see memory anatomy-skill).

OWNER RULES (both themes):
1. Black & white only, high-detail motion design, kinetic typography, no subtitles ever. Little/no glass. No overlapping elements.
2. ALL cards 3D and ALL scene transitions are 3D camera moves.
3. Use REAL images/videos from the repo itself (raw.githubusercontent.com README media, Playwright screenshots of the repo page or the project's live web demo). github.com/trending: use the web-fetch agent (curl is blocked).
4. Voiceover: English, friendly "mate" tone, natural simple emotion. ElevenLabs REST API with env ELEVENLABS_API_KEY (NOT the connector): POST https://api.elevenlabs.io/v1/text-to-speech/y0s2ExEMuum3muUnA6Zd/with-timestamps?output_format=mp3_44100_192, header xi-api-key, body {"text":..., "model_id":"eleven_v4"}; alignment gives word timings. One take only. Reel under 35s, 1080x1920, 30fps.
5. Ending: "Comment GITMATE and I'll send you the link" scene, then the Follow ending (mark + rings, handle types, Follow tapped -> Following).
6. Audio: SFX and music low, ducked hard under voice; loudnorm -14 LUFS.
7. Facts must be correct: verify claims with a web search. Avoid "today"/"right now" in the video.

STEPS:
1. Paid orders + old free repos: GET https://gitmate-autopost.vercel.app/api/orders (header x-upload-token: $GITMATE_QUEUE_KEY), follow gitmate_handoff.md top section.
2. Trending pick: a repo not already in log.json, broad US appeal, good real visuals, playbook rules (pain hook, free, easy install).
3. For each reel: README + real media, punchy script, voice + timings, build from parts/ with build.py onto the newest template, contact sheet check (overlaps, cropping, blank frames) and fix, render (4 parallel workers, 3-strip capture), mix, encode H.264+AAC (-crf 21 -maxrate 12M, +faststart).
4. Save into /mnt/project-files/dev-reels/<slug>/: gitmate_<slug>.mp4, reel.html, parts/, build.py, voice.mp3, script.txt, caption.txt ("Comment GITMATE"), meta.json.
5. QUEUE = Vercel dashboard https://gitmate-autopost.vercel.app ONLY (never the Growaun/DigitalOcean server). Copy /mnt/project-files/gitmate-dashboard/scripts/push-reel.mjs to a scratch folder, `npm i @vercel/blob@2`, then `NODE_USE_ENV_PROXY=1 GITMATE_QUEUE_KEY=$GITMATE_QUEUE_KEY node push-reel.mjs https://gitmate-autopost.vercel.app <mp4> <N.json>`. N.json in /mnt/project-files/social-autopost/gitmate-queue/ as the next number (copy the newest one's format; include "link" = repo URL). COVER: pick cover_offset_ms where hook text + main visual are fully shown (look at ffmpeg frames). BACKLOG first every run: push each existing N.json in number order (already-queued slugs are skipped; skip a JSON whose mp4 is missing).
   If GITMATE_QUEUE_KEY is missing or the dashboard answers 401: finish the reels and tell the owner to set the env var. Never print or store keys.
6. Append to log.json (date, repo, slug, theme, hook, playbook, new_ui, file, queued + dashboard_id). Re-read just before writing. Update memory gitmate-render-gotchas with the newest templates + any new gotcha.
7. Short Hinglish summary: both reels (repo, theme, what's new visually, queue ids). If ElevenLabs fails, do NOT make a silent reel; stop and report exactly what failed.
