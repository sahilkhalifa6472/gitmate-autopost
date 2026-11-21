# git.mate: ab tak jo kuch bana (step by step)

Updated 2026-11-20 IST. Dashboard link internal hai, kahin public share mat karna.

## 1. Page aur content (23-24 Oct)
1. Page idea: GitHub repo awareness reels, handle @git.mate, bio, profile pic (glossy white ball ">_").
2. Style frames: pehle dark B&W, phir liquid-glass v2 approve hua. Rules: glass kam, sab cards 3D, 3D camera moves, repo ki REAL README images/videos, no subtitles (big kinetic text).
3. Voice: ElevenLabs Marcus (friendly "mate" tone), eleven_v4, word timestamps se sync. SFX/music voice ke neeche duck.
4. Ending: "Comment GITMATE for the link" + profile card, Follow tap.
5. Dark/Light alternate: ek reel dark, agli light (white bg, blur typing, serif italic).
6. Har reel me NAYE UI components (purane copy nahi).
7. Render pipeline: reel.html (GSAP) -> Playwright frames (3 strips for 3D) -> ffmpeg, audio mix -14 LUFS, cover frame chosen.
8. Daily scheduled task 10:42 IST: reel banata hai aur dashboard pe push karta hai.
9. ideas.md: owner ka idea (link/topic) pehle banta hai, oldest first.

## 2. Dashboard (Vercel, 24 Oct)
10. Next.js + Upstash Redis + Vercel Blob. Pages: Dashboard, Queue, Logs, Settings. Password login.
11. Queue: reel upload, reorder, Post now, Skip. Script push-reel.mjs se Claude reels push karta hai.
12. Engine: cron-job.org har 5 min /api/cron. Post steps me hota hai (container -> processing -> publish).
13. Settings: Instagram token, schedule, pause, Run now.
14. 1 Nov: mobile-first app-like UI (glass bottom tab bar, cover thumbnails).

## 3. Posting time calculation
15. Har din New York time me random slots, 2-ghante ke windows (7 AM-11 PM NY).
16. Learning: post ke 12h baad views se us window ko score; agle plans winning window ko zyada chunte hain, 25% explore.
17. 2 reels/day (15 Nov se): 1 trending pick + 1 old free DM repo, paid upar se.
18. Paid/booked reel (post_on): apne din pe sabse pehle, 7 AM-12 PM NY slot (= shaam IST), din miss ho toh asap.
19. Har reel pe post time NY + IST dono, 12-hour format; queue me ETA (kab post hoga) estimate.
20. Queue debug view (/api/queue?debug=1): plans + logs.

## 4. Comment GITMATE -> auto DM (12-14 Nov)
21. Comment me GITMATE (ya "git mate") -> private DM with link + public reply. Inbox page (settings, per-post links, DM list, reply box).
22. Privacy policy + data deletion pages, app icon (Meta app Live ke liye).
23. EAA (system user, never expires) token comments/DMs ke liye; posting purana token. Read-only diag check.
24. Instagram raw link refuse kare toh "Open on GitHub" button card. Failed comments retry.
25. Follow gate (ManyChat jaisa): pehle follow karo, "LINK"/"DONE" reply, follow check, phir link card.
26. Kam API calls (unchanged posts skip), Meta webhooks se instant reply (cron sirf safety net).

## 5. Paid orders: $9 FEATURE (13-16 Nov)
27. DM me "FEATURE" -> offer DM (price, PayPal / Crypto buttons). Orders tab: Offer settings.
28. User repo link + screenshot ya Solana tx bhejta hai; USDC on-chain auto verify.
29. Owner Confirm dabata hai -> next free date book (1 paid/day, day after tomorrow se) + DM user ko. Reject DM bhi.
30. Koi bhi project link (Play Store/website) chalega; method ke hisaab se checking DM.
31. 14 Nov se: naye repo links = sirf paid offer. 14 Nov se pehle wale = "Old repos · free" list (1/day bait reel, Copy message / Open DM / Sent).
32. Reel live hone pe buyer ko "your reel is live" DM (24h window me).
33. Daily task pehle confirmed paid orders banata hai (post_on = order date).
34. "DM FEATURE" promo reel (Atlas 111k proof) review ke liye bana.

## 6. Growth / learning
35. Atlas viral study (111.7k views): viral_playbook.md rules (pain hook 2s me real footage, repo name 3-4s pe, "free" + easy install, under 35s).
36. Sunday weekly study task: data padh ke playbook update karta hai.
37. Repo Reels skill Gumroad pe $19 (pipeline package).

## 7. Weekly Friday carousel (19-20 Nov)
38. Har Friday 4:5 carousel, hafte ki reels; queue kind "carousel", daily reel slot nahi leta, 9 PM IST.
39. Carousel pe GITMATE comment -> DM me har repo ka alag GitHub card (8 cards). Public /week page hataya.
40. Friday 11:13 IST scheduled task.

## 8. AI DM salesman (aaj, 19-20 Nov)
41. Gemini AI non-flow DMs ka jawab deta hai (poora thread + order status padh ke), pay buttons, 1 gentle follow-up 3-20h baad, "Needs you" list, per-user pause, Orders page pe AI card.
42. Gemini key Orders page pe paste (check hoke save), "Turn AI on" button.
43. Models fallback chain; ab fast Flash Lite pehle (3.5-flash-lite -> flash-lite-latest -> 3.1-flash-lite -> 3.8-flash).
44. Ek user ke DMs padhne ka API.
45. Fixed flows (FEATURE, follow gate, links) se clash band; repo ka README/stars padh ke real feedback.
46. Galat skip hone wale replies fix; "hi" phir "FEATURE" jaisa overlap me sirf naye message ka jawab (dedupe); webhook turant answer.
