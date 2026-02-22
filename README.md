# 🎵 VYBE — Deployment Guide
## From Zero to Live in ~20 Minutes. Everything FREE.

---

## What You're Deploying

| Service | Platform | Cost |
|---------|----------|------|
| Frontend (React) | Render Static Site | FREE forever |
| Backend (Node.js) | Render Web Service | FREE tier |
| Database + Auth | Supabase | FREE tier |
| AI (Groq) | Groq Cloud | FREE tier |
| Music API | Deezer | FREE, no key |

---

## STEP 1 — Set Up Supabase (5 min)

1. Go to **supabase.com** → Sign up (free, no card)
2. Click **New Project** → name it `vybe` → pick a region close to you
3. Wait for it to spin up (~2 min)
4. Go to **SQL Editor** → click **New query**
5. Paste the entire contents of `supabase/schema.sql` → click **Run**
6. Go to **Settings → API** and copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`

---

## STEP 2 — Get Your Groq API Key (2 min)

1. Go to **console.groq.com** → Sign in with your account
2. Click **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_...`)
4. This is your `GROQ_API_KEY`

---

## STEP 3 — Push to GitHub (3 min)

```bash
# In your terminal, navigate to the vybe-app folder
cd vybe-app

# Initialize git
git init
git add .
git commit -m "🎵 Initial VYBE commit"

# Create a new GitHub repo at github.com → New Repository → name: vybe-app
# Then:
git remote add origin https://github.com/YOUR_USERNAME/vybe-app.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy Backend on Render (5 min)

1. Go to **render.com** → Sign up (free, no card)
2. Click **New** → **Web Service**
3. Connect your GitHub → select `vybe-app` repo
4. Configure:
   - **Name**: `vybe-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add **Environment Variables**:
   - `GROQ_API_KEY` = your Groq key
   - `FRONTEND_URL` = (leave blank for now, update after frontend deploys)
   - `NODE_ENV` = `production`
6. Click **Create Web Service**
7. Wait for it to deploy (~3 min) — copy the URL (e.g. `https://vybe-backend.onrender.com`)

---

## STEP 5 — Deploy Frontend on Render (5 min)

1. In Render → Click **New** → **Static Site**
2. Connect the same `vybe-app` repo
3. Configure:
   - **Name**: `vybe-app`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_API_URL` = your backend URL from Step 4
   - `VITE_ADMIN_EMAIL` = your email address (gives you admin access)
5. Click **Create Static Site**
6. Wait for it to deploy (~3 min) — your app is LIVE!

---

## STEP 6 — Make Yourself Admin (1 min)

1. Go to your live app URL → Sign up with your admin email
2. Go to Supabase → **SQL Editor** → **New query**
3. Run:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```
4. Refresh the app → you'll see the ⚡ ADMIN button on the home screen

---

## STEP 7 — Update Backend CORS (1 min)

1. In Render → go to your backend service → **Environment**
2. Update `FRONTEND_URL` to your actual frontend URL
3. Click **Save Changes** → backend redeploys automatically

---

## You're Live! 🎉

Your VYBE app is now:
- ✅ Running at your Render static site URL
- ✅ User accounts with Supabase Auth
- ✅ AI powered by Groq (llama3-70b)
- ✅ Music discovery via Deezer
- ✅ Beat saving to Supabase database
- ✅ Admin dashboard at your account

---

## Notes

- **Backend spin-down**: Render's free tier spins down after 15 min inactivity. First AI request after idle takes ~30s to wake up. This is normal on free tier.
- **Static site**: Never spins down — loads instantly always.
- **Supabase**: 500MB database, 50MB file storage, 2GB bandwidth — more than enough to start.
- **Groq**: ~14,400 requests/day on free tier — plenty for early users.

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
cp .env.example .env    # fill in your GROQ_API_KEY
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
cp .env.example .env    # fill in all variables
npm run dev
```

Frontend: http://localhost:3000
Backend:  http://localhost:4000
