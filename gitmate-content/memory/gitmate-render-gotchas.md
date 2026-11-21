---
name: gitmate-render-gotchas
description: git.mate reel rendering gotchas from daily runs (3D clipping strip capture, mix levels, layout traps) + newest dark/light templates
metadata:
  type: reference
  modified: 2026-11-08T05:24:22.492Z
---

Newest templates: DARK dev-reels/ghost-downloader/ (2026-11-21), LIGHT dev-reels/plutus/ (2026-11-21); each has build.py that assembles reel.html from parts/ + the previous template (plutus build.py finds markers by text, not line numbers); both built from parts/ (css.css, body.html, js.js) assembled onto the previous template head. github.com page screenshots via Playwright render styled. Each folder has reel.html, render.js, shots.js, sheet.py, sfx.py.

Rendering:
- Full 1080x1920 screenshots clip heavily 3D-transformed layers. Capture each frame as 3 strips (clip h 640 at y 0/640/1280) and ffmpeg vstack=inputs=3 (render.js does this). 4 parallel workers.
- Flat full-size layers (1080x1920 divs) or full-width text next to tilted c3d cards get cut; size layers to content and push text forward with translateZ(120-220px).
- An element over a tilted card slices through it: put overlays inside the card, or give 2D elements translate3d z ~90px.
- A payoff reveal must finish ~0.5s before the next scene start (camera transition starts TPRE .45s early and blurs it). Put the 2nd hook line before ~4.2s raw so the cover frame shows the full hook.
- Shapes reaching up from a moving element (press rod) cross titles; size them in tick().
- GSAP 3: no className tween (use attr:{class}); set text from tick(t). Never class "f" on inner elements.
- Nested preserve-3d accordions render skewed; use independent strips each with transformPerspective. Real CSS cubes work. 3D digit drum: 10 faces rotateX(-k*36) translateZ(h/2/tan18).
- README GIFs/videos -> ffmpeg jpg sequences swapped per tick; __seek returns img.decode() promises.

Audio mix (one ffmpeg command): voice atempo SPD, `apad=whole_dur=` before asplit (else music/SFX stop at voice end), music light-ref/lightmusic.wav 0.24 + sfx ~0.32 each sidechaincompress'd by voice, amix normalize=0, loudnorm -14. loudnorm usually lands -14.5..-15.6: add volume +xdB then `alimiter=limit=0.89:level=false` (without level=false it auto-levels to 0 dB) -> -14.0.

Blocked: downloading/running repo binaries and `npx skills add` can be blocked by the auto-mode check (hand-build CSS 3D instead). Don't rm a relative glob after cd (the whole command gets blocked, incl. other steps in it).
- mujoco (2026-11-11): README GIFs from repo doc/images via `git clone --depth 1 --filter=blob:none --sparse` + `git sparse-checkout set doc/images` (works when the GitHub API is blocked). shots.js/sheet.py there take env SD=<dir> (fresh dir per sheet). Things falling from above cross the headline: drop them from depth (translateZ -1400) instead.

- Running a repo's own code to render frames is BLOCKED by auto-mode; use README media. Voice via ElevenLabs REST with-timestamps gives word timings directly.

- 2026-11-18 (2 reels): sure (DARK, #36, SPD 1.06) + ilovenotch (LIGHT, old free DM repo, #37, SPD 1.12). Dark headlines >12 uppercase chars need font <=100px (else cut). Mix helper /tmp mix.sh: aformat stereo on mono sfx before sidechain; loudnorm then +0.3..0.9 dB lands -13.9.
- 2026-11-19 uv (DARK #38) + playnck (LIGHT #39): build.py now asserts marker lines of the previous template. A c3d card whose idle sway flips rotationY sign (data-ry -14 -> +7) lost its bottom strip (clipped at y 1280); fix data-ry=0. Real speed test (pip vs uv in container) made a strong real-data scene. DM FEATURE payoff needs >=1.5s before the comment-scene camera move.

- 2026-11-20 affine (DARK #41) + geotagcamera (LIGHT #42): github.com/trending via curl is 403 (session-bound proxy) -> use the web-fetch agent. Real app footage: Playwright on a project's live web demo (app.affine.pro, no login) incl. typing frames + mode toggle; hide in-app banners with injected CSS.

- 2026-11-21 ghost-downloader (#43) + plutus (#44): README user-attachments videos ARE downloadable by loading the github.com repo page in Playwright and fetching the signed private-user-images URLs with page.request.get. Typing demo data into a third-party live app (creating accounts) is blocked by auto-mode; use read-only screenshots (landing, dialogs).
