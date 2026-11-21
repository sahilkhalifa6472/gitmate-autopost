---
name: gitmate-weekly-carousel
description: git.mate weekly Friday 4:5 carousel of the week's reels (dashboard carousel support, runbook, scheduled task)
metadata:
  type: project
---

- 2026-11-19 owner asked: every Friday one big 4:5 (1080x1350, not 1:1) carousel of all git.mate reels shared that week, 3D git.mate style, Explore-viral, last slide Comment GITMATE + Follow; nothing old may break.
- Dashboard support: PR #33 (merged 2026-11-19). Queue item kind "carousel" (images, post_on, post_min default 630 = 10:30 AM NY / 9 PM IST); never takes the daily reel slot. Commenters get one GitHub card per repo in the DM (PR #36). OWNER RULE 2026-11-20: never share the dashboard URL publicly anywhere (the /week page was removed for this). Push with scripts/push-carousel.mjs.
- Runbook /mnt/project-files/dev-reels/weekly/WEEKLY_CAROUSEL.md; each week's folder dev-reels/weekly/<friday>/ (src/ = carousel.html + week.js + shoot.js template; edit only week.js).
- Scheduled task trig_01JiXGGGtJbayEiqEyjUNkJf, Fridays 11:13 IST, fresh thread.
- First one: queue #40 (8 repos, 13-19 Nov), posts Fri 2026-11-20 9 PM IST. Owner's "100 tempo wala 3d style" reference was unclear; I used the git.mate dark 3D card style.
- Related: [[gitmate-autopost]], [[dev-repo-page-style]]
