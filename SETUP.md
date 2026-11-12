# git.mate Auto-post Dashboard: Vercel setup (Hinglish)

Ye app Vercel pe chalti hai: login wala dashboard, Queue, Logs, Settings, aur har 5 min wala auto-post job.
Roz 1 reel, New York time pe random slot, views dekh ke best time seekhta hai.

## 1. Code GitHub pe (ek baar)
1. claude.ai pe GitHub connect karo: https://claude.ai/connect-github
2. GitHub pe naya **private** repo banao, naam: `gitmate-autopost` (khali, README ke bina)
3. Claude ko repo ka naam bata do, Claude code push kar dega.

## 2. Vercel pe deploy
1. https://vercel.com pe GitHub se login karo → **Add New → Project** → `gitmate-autopost` → **Import**
2. **Environment Variables** me ye 3 daalo (DigitalOcean/Growaun se koi lena-dena nahi):
   - `DASHBOARD_PASSWORD` = dashboard ka password (kuch bhi strong)
   - `CRON_SECRET` = koi bhi lamba random text (jaise 30 letters)
   - `QUEUE_KEY` = koi bhi lamba random text (30+ letters). Yahi value Claude ke cloud environment me `GITMATE_QUEUE_KEY` naam se bhi daalni hai (Project settings → Environment), taaki daily task reels queue me daal sake.
3. **Deploy** dabao.

## 3. Storage jodna (free)
Project → **Storage** tab:
1. **Upstash for Redis** (Marketplace) → Create → is project se connect karo
2. **Blob** → Create → is project se connect karo
3. Phir **Deployments → ⋯ → Redeploy** (taaki naye env vars aa jaayein)

## 4. 5-minute timer (free)
Vercel free plan me cron din me sirf 1 baar chalta hai, isliye:
1. https://cron-job.org pe free account banao → **Create cronjob**
2. URL: `https://<aapka-app>.vercel.app/api/cron?key=<CRON_SECRET>`
3. Schedule: **Every 5 minutes** → Save

## 5. Instagram jodna
1. `https://<aapka-app>.vercel.app` kholo → password se login
2. **Settings** → Instagram token paste karo → **Connect** (token sirf aapke Vercel database me rahega)
3. Settings ke "Setup checks" me sab safed (green jaisa) dikhna chahiye.

Phir Claude ko app ka URL bata do: woh 6 ready reels queue me daal dega, aur daily task naye reels khud daalega.

## 6. Comment GITMATE → auto DM (Inbox page)
Koi reel pe "GITMATE" comment kare toh dashboard usko DM mein us reel ka link bhejta hai, aur comment ke neeche chhota reply deta hai ("Sent it to your DMs 📩"). Ye har 5 min wale cron ke saath chalta hai. Webhook ki zarurat nahi hai.

Ek baar ka setup:
1. **Instagram app** (phone): Settings → Messages and story replies → Message controls → Connected tools → **Allow access to messages** ON.
2. **Meta developer app** → Use cases → Instagram API → Customize → Permissions mein ye dono add karo:
   - `instagram_business_manage_comments`
   - `instagram_business_manage_messages`
   (`instagram_business_basic` aur `instagram_business_content_publish` pehle se hain.)
3. Usi page pe **Generate token** dabao (naya token in permissions ke saath banega) → dashboard **Settings** → token paste → **Connect**.
4. Dashboard **Inbox** page kholo:
   - "Post links" mein dekho, har reel ke saath sahi GitHub link ho (naye reels ka link daily task khud daalega). Jis post pe link nahi hai, uske comments tab tak ruke rahenge.
   - **Comments: ON** dabao, phir **Run now**. Activity mein "DM sent" dikhna chahiye.
5. (Optional) **DM keyword: ON**: koi DM mein "gitmate" likhe toh latest 3 reels ke links reply mein jaate hain.

Instagram ke rules: comment ka private DM sirf comment ke 7 din ke andar, har comment pe ek baar. Normal DM ka reply sirf unke last message ke 24 ghante ke andar. Ek run mein max 15 DMs jaate hain (Settings mein badal sakte ho), taaki account spam na lage. Agar error aaye ki permission nahi hai, toh Meta app ko **Live** mode mein daalna pad sakta hai.
