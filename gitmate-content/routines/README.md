# git.mate scheduled tasks (copied 2026-11-21 from the Growaun Content project)

They are now recreated in the new git.mate project. Until a new task has completed one run successfully, the old one stays ON in Growaun. After that, the old one is turned OFF (disabled, not deleted).

| Task | Schedule (IST) | Old id (Growaun project) | Prompt file |
|---|---|---|---|
| git.mate daily reel | every day 10:42 | trig_01Nvp77iUK48wXhrE3MVTSid | daily-reel.md |
| git.mate weekly viral study | Sunday 20:47 | trig_0177rJRcJCSgufh4YWT99iEw | weekly-viral-study.md |
| git.mate weekly Friday carousel | Friday 11:13 | trig_01JiXGGGtJbayEiqEyjUNkJf | friday-carousel.md |

Cron strings: `CRON_TZ=Asia/Kolkata 42 10 * * *`, `CRON_TZ=Asia/Kolkata 47 20 * * 0`, `CRON_TZ=Asia/Kolkata 13 11 * * 5`.

All three need the cloud env vars GITMATE_QUEUE_KEY (+ ELEVENLABS_API_KEY for the daily reel). Daily reel since 2026-11-15 makes TWO reels per run (trending + oldest old-free-DM repo); that rule lives in dev-reels/gitmate_handoff.md top section, not in the prompt.
