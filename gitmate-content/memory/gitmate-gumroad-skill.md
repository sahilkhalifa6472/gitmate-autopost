---
name: gitmate-gumroad-skill
description: Owner sells the git.mate reel pipeline as Claude skill "Repo Reels" on Gumroad at $19; where the zip, listing and assets are
metadata:
  type: project
  modified: 2026-11-03T12:47:25.700Z
---

- 2026-11-03 owner chose to sell the **git.mate reel pipeline** (not story-motion-reels) on Gumroad, price **$19**. Thread: "Sell reel skill on Gumroad".
- Built 2026-11-03: generic skill "repo-reels" (no git.mate branding; CONFIG block for brand/handle/keyword). Files in /mnt/project-files/gumroad/repo-reels/: repo-reels-skill.zip (SKILL.md, templates dark+light, scripts render/sheet/voice/transcribe/audio/mix/setup, references, vendor/fonts.css), LISTING.md (title, description, tags, settings), gumroad-cover.png 1280x720, gumroad-thumb.png 600x600, showcase.mp4 (30s, first 6s of 5 real git.mate reels), template dark/light demo mp4s.
- Source (editable) was built in a session scratchpad; rebuild from the zip if changes are needed.
- GSAP is NOT bundled (setup.sh downloads it from cdnjs) to avoid redistributing it; fonts are OFL. License: unlimited videos incl. client work, no resale of the skill.
- voice.py uses ElevenLabs /with-timestamps API (untested live: no key in cloud). Renders + mix were tested (dark 28.6s, -14.6 LUFS).
- Related: [[dev-repo-page-style]], [[gitmate-render-gotchas]]
