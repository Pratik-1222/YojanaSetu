# YojanaSetu

A government scheme eligibility & assistance platform. Citizens fill in a short
profile, get a ranked list of schemes they're likely to qualify for, and get
plain-language guidance on documents, deadlines, and how to apply.

This is a real two-part app, built to be deployed for free:

- **`frontend/`** — React + Vite + Tailwind, deployed to **Vercel**
- **`backend/`** — Node + Express API, deployed to **Render**

```
yojanasetu/
├── frontend/   → the website users visit
├── backend/    → the API that serves scheme data & eligibility matching
```

---

## 1. Run it locally first

**Backend**
```bash
cd backend
npm install
npm run dev        # http://localhost:5000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev             # http://localhost:5173
```

Open `http://localhost:5173` — the site should load schemes from your local API.

---

## 2. Deploy the backend to Render

1. Push this project to a GitHub repository.
2. Go to [render.com](https://render.com) → **New +** → **Web Service**.
3. Connect your repo and set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Add an environment variable once you know your Vercel URL (step 3):
   - `FRONTEND_URL` = `https://your-app.vercel.app`
5. Deploy. Render gives you a URL like `https://yojanasetu-api.onrender.com` —
   copy it, you'll need it next. Check it works by visiting
   `https://yojanasetu-api.onrender.com/api/health`.

   *(A `render.yaml` blueprint is included in `backend/` if you prefer
   "New + → Blueprint" instead of the manual steps above.)*

   > Free Render web services spin down after 15 minutes of inactivity and
   > take ~30–50 seconds to wake up on the next request. That's fine for a
   > demo/MVP; upgrade the plan for always-on if this goes to real users.

---

## 3. Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import the same GitHub repo and set:
   - **Root directory:** `frontend`
   - **Framework preset:** Vite (auto-detected)
   - **Build command:** `npm run build` (default)
   - **Output directory:** `dist` (default)
3. Add an environment variable:
   - `VITE_API_URL` = `https://yojanasetu-api.onrender.com` (your Render URL from step 2)
4. Deploy. Vercel gives you a URL like `https://yojanasetu.vercel.app`.
5. Go back to Render and set `FRONTEND_URL` to that exact Vercel URL, then
   trigger a redeploy of the backend, so CORS allows requests from your live site.

That's it — your live site is talking to your live API.

---

## What's actually implemented

- Landing page with search, categories, popular schemes, testimonials, FAQ
- 4-step onboarding that posts your profile to `/api/schemes/match` and gets
  back a ranked list (rule-based scoring — see `backend/routes/schemes.js`)
- AI Assistant chat UI (currently keyword-based; swap in a real LLM call
  server-side when you're ready — see "Next steps" below)
- Browse/filter schemes by category
- Scheme detail pages (overview, eligibility, documents, application steps)
- Dashboard (recommended, saved, deadlines, notifications)
- Saved schemes and profile persist in the browser (`localStorage`), so a
  visitor's data survives a refresh without needing accounts yet

## Next steps toward "production-grade"

These weren't built because they need real infrastructure decisions, not
just UI — happy to build any of these out next:

- **Accounts & a database.** Right now profile/saved data lives in the
  browser. Add Postgres (Render offers a free Postgres instance) plus JWT
  auth to persist data across devices.
- **Real AI assistant.** Wire the `/assistant` page to an LLM API call from
  the backend (never from the browser, to keep your API key private) so it
  can parse free-text queries instead of keyword matching.
- **Admin panel / CMS.** A protected `/admin` area for adding and editing
  scheme records instead of hand-editing `backend/data/schemes.js`.
- **Multilingual support.** i18next on the frontend + translated copy.
- **Document vault.** File uploads need object storage (e.g. Cloudflare R2
  or S3) — not something Render/Vercel provide directly.
