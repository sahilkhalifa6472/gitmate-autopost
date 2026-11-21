---
name: anatomy-skill
description: Owner wants the Anatomy skill (isometric explainer machines) installed and used in any reel/project work where it helps; install command for fresh sessions
metadata:
  type: feedback
---

- 2026-10-24 owner: "Aab tum bhi isko use karna, jaha jaruri pade install karlo" for https://github.com/wheresryan22/anatomy (MIT Claude skill: explains an idea as an isometric SVG/WebGL machine figure with live readout and eased motion).
- **Why:** the owner liked the Anatomy reel's machine artifacts and wants that kind of explainer visual wherever it fits (git.mate reels, Growaun reels, Reel Studio components).
- **How to apply:** cloud containers are fresh each session, so install at the start of any run that needs it: `npx -y skills add wheresryan22/anatomy -g -y` (it prints a PromptScript "global not supported" error but still installs to ~/.claude/skills/anatomy; then the `anatomy` skill is available). Fallback: `git clone https://github.com/wheresryan22/anatomy` and use kit/iso-kit.mjs directly. Use it when a scene explains how something works (a process, a system, a mechanism); keep reel colours per that page's rules (git.mate = black & white, Growaun = deep green/white/black). To put a figure in a video: build the page with --light, record it with Playwright page.clock.install + runFor(1000/30) per frame, grayscale if needed. Example: /mnt/project-files/dev-reels/anatomy/ ([[gitmate-new-ui-per-reel]]).
