# Autopilot MVP: setup (Hinglish)

Personal use ke liye chhota version: aapke apne (tester) Instagram accounts pe 1 mahina chalane ke liye.
git.mate dashboard se **bilkul alag** hai: naya Vercel project, naya Redis, naya Blob, naya Meta app. git.mate ko kuch nahi hota.

## Isme kya hai

| Page | Kaam |
| --- | --- |
| Home | Continue with Instagram, followers, last 9 posts ke views/likes/reach, activity log |
| Posts | Reel upload, abhi ya schedule karke auto post |
| Auto DM | Keyword comment kare (jaise "LINK") to DM me link card + public reply |
| Inbox | Saari chats, reply, "Needs you" list, kisi bande ke liye AI pause |
| AI | Business Brain (product, price, link, FAQ), test chat, AI ON/OFF (Claude Haiku 5.5) |

Isme abhi nahi hai: Claude se reel banana, photo/carousel post, billing, dusre users. Woh baad ke phase me.

## Setup (ek baar, ~30 min)

### 1. Vercel project
1. Vercel → Add New → Project → repo `gitmate-autopost` import karo.
2. **Root Directory = `saas-mvp`** (yeh zaroori hai). Project ka naam kuch bhi, jaise `ig-autopilot`.
3. Deploy. URL milega jaise `https://ig-autopilot.vercel.app`. Isko neeche `SITE` bolenge.

### 2. Naya Redis + Blob (git.mate wale mat use karna)
1. Is naye project me Storage → Create → **Upstash Redis** (free) → Connect. Env khud aa jayenge.
2. Storage → Create → **Blob** (public) → Connect.

### 3. Meta app (naya)
1. developers.facebook.com → Create app → use case **"Manage messaging & content on Instagram"**.
2. Left me Instagram → **API setup with Instagram login**.
3. Wahan **Instagram app ID** aur **Instagram app secret** copy karo (step 4 me chahiye).
4. "Set up Instagram business login" → Business login settings → **Redirect URL**: `SITE/api/ig/callback`
5. "Configure webhooks" → Callback URL: `SITE/api/webhook`, Verify token: jo aap `WEBHOOK_VERIFY_TOKEN` me rakhoge → Verify and save → fields **comments** aur **messages** ON.
6. App settings → Basic → Privacy Policy URL `SITE/privacy`, Data deletion URL `SITE/data-deletion` → Save.
7. App roles → Roles → **Add people → Instagram Tester** → apna IG username.
8. Instagram app me (us account se): Settings → Website permissions → Apps and websites → **Tester invites** → Accept.

App ko Live karne ya App Review ki zarurat nahi: testers pe Development mode me chalega.

### 4. Vercel → Settings → Environment Variables

| Naam | Value |
| --- | --- |
| `APP_PASSWORD` | Dashboard ka password (aap rakho) |
| `APP_URL` | `SITE` (jaise https://ig-autopilot.vercel.app, end me / nahi) |
| `IG_APP_ID` | Step 3.3 wala Instagram app ID |
| `IG_APP_SECRET` | Step 3.3 wala Instagram app secret |
| `WEBHOOK_VERIFY_TOKEN` | Koi bhi lamba random text (wahi Meta webhook me daalo) |
| `CRON_SECRET` | Koi bhi lamba random text |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API keys (AI replies ke liye) |

Save karke **Redeploy** karo.

### 5. Har 5 minute ka cron
cron-job.org → naya job → URL `SITE/api/cron?key=CRON_SECRET_WALA_TEXT` → every 5 minutes.
(Isi se scheduled posts jaate hain, token refresh hota hai, aur koi missed comment/DM pakda jata hai.)

### 6. Use karo
1. `SITE` kholo → password → **Continue with Instagram** → tester account se login → Allow.
2. Auto DM me rule banao, reel ke caption me "Comment LINK" likho.
3. AI page pe Business Brain bharo → Test chat me check karo → Turn ON.
4. Doosra account add karna ho to Home → "+ Account / Reconnect".

## Dhyan rakhna
- **@git.mate se DM test mat karna**: us pe 20 Dec 2026 tak messages bhejne ki rok hai. Doosre account se test karo.
- Development mode me Meta kabhi kabhi dusre logon ke comments/DMs nahi dikhata (git.mate me yahi hua tha). Agar Auto DM ya Inbox khali dikhe to Home → Advanced me **EAA backup token** paste karo (Graph API Explorer se, git.mate jaisa).
- AI safety hamesha ON: payment/UPI/crypto nahi maangta, price guess nahi karta, "stop" pe ruk jata hai, doubt ho to "Needs you" me daalta hai. Limit 60 AI replies/hour.
- Reel: MP4, 9:16, 3-90 sec. Upload ke baad 5 min ke andar post (cron se).
- Kharcha: AI reply ~$0.0005 ek (1,000 replies ~$0.50). Vercel/Upstash/Blob free plan me chal jayega.
