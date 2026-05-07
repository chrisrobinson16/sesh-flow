# Sesh Tracker

Full-stack MERN app: JWT auth, protected session routes, Cloudinary image uploads, PWA-ready Vite frontend, and wellness-focused UI.

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **MongoDB** (local or Atlas URI)
- **Cloudinary** (optional; required only for session image uploads)

## Setup

1. **Clone the repo** and install dependencies:

   ```bash
   npm install
   ```

2. **Environment variables** — copy the example file and edit **only on your machine**:

   ```bash
   cp .env.example .env
   ```

   Fill in at minimum:

   - `MONGO_URI` — MongoDB connection string  
   - `JWT_SECRET` — long random string (never share or commit)  
   - `CLOUDINARY_*` — if you use session photos  
   - `VITE_API_URL` — API base the browser calls (e.g. `http://localhost:5001` for local desktop, or your Mac LAN IP + port for phone testing)

   **Security:** `.env` is listed in `.gitignore` and must **never** be committed. Use `.env.example` only as a template (no real secrets).

3. **Run locally** (two terminals):

   ```bash
   npm run server
   ```

   ```bash
   npm run dev
   ```

   Open the URL Vite prints (default `http://localhost:5173`). The API defaults to `http://localhost:5001` unless you override `PORT` / `VITE_API_URL`.

## Production build (frontend)

```bash
npm run build
```

Outputs `dist/` including the PWA service worker (`sw.js`) and `manifest.webmanifest`. Preview locally:

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

Serve `dist/` behind HTTPS in production for best PWA install behavior.

## PWA (install on iPhone)

1. Run a **production build** and serve it over **HTTPS** (or trusted localhost for dev tools).  
2. In **Safari**, use **Share → Add to Home Screen**.  
3. Theme / icons come from the web app manifest and `public/` assets after build.

## Security (V1)

| Measure | Detail |
|--------|--------|
| **Secrets** | Keep all secrets in `.env`; never commit `.env`. |
| **Auth validation** | Register: trimmed name, normalized email, strict `validator.isEmail` (TLD required, no IP domains), reject **RFC 2606 reserved TLDs** (`.test`, `.example`, `.invalid`, `.localhost`, `.local`), reject **disposable inboxes** (~120k-domain list via `disposable-email-domains`), reject placeholder domains (`example.com`, `test.com`, `fake.com`, etc.). Password: **8–128 chars**, must contain a **letter and a digit**, blocked against a small **common-password list** (`password`, `password123`, `qwerty123`, …), and cannot equal the user’s name or email local-part. Login is intentionally **lenient** so accounts created before these rules can still sign in; failure returns generic **Invalid email or password**. |
| **Rate limits** | **5** requests / **15 min** / **IP** on `POST /api/auth/register` and `POST /api/auth/login`. **30** creates / **15 min** / **IP** on `POST /api/sessions`. Response: `Too many attempts. Please try again later.` — tuned for normal use, not strict anti-DDoS. |
| **Body size** | `express.json({ limit: '1mb' })`. |
| **Uploads** | Session images: **images only**, max **5MB**; non-images rejected with a clear message. |
| **Reverse proxy** | If the API sits behind nginx/Heroku/etc., set `TRUST_PROXY=1` in `.env` so rate limiting sees the real client IP. |

## Pre-deploy checklist

Use this before tagging a release or opening a public demo:

- [ ] **`git status`** is clean (no accidental `.env` or `dist/` commits — `dist/` is gitignored).  
- [ ] **`npm run build`** completes; PWA plugin prints generated `sw.js`.  
- [ ] **`npm run server`** starts with no errors (Mongo + optional Cloudinary env).  
- [ ] **Signup / login** in the browser with your production-like `.env`.  
- [ ] **Rate limits** — a few logins/registers and session creates work; only rapid abuse hits `429`.  
- [ ] **Sessions** — create, edit, delete from the UI.  
- [ ] **Image upload** — one session with a small JPEG/PNG under 5MB.  
- [ ] **PWA** — after `build` + HTTPS (or your host’s rules), install on iPhone and open once online so the shell caches.

## Local iPhone Testing

Use this to test the app on your iPhone while running locally on your Mac.

1. Get your Mac's local IP address (same Wi-Fi as your iPhone):
   - Run `ipconfig getifaddr en0` (or `ipconfig getifaddr en1` depending on your adapter).
2. In your local `.env`, set:
   - `VITE_API_URL=http://<YOUR_MAC_IP>:5001`
   - Optional backend CORS pinning: `FRONTEND_ORIGINS=http://<YOUR_MAC_IP>:5173`
3. Start backend:
   - `npm run server`
4. Start frontend:
   - `npm run dev`
5. Open on iPhone Safari:
   - `http://<YOUR_MAC_IP>:5173`

Notes:

- Vite is configured with `host: "0.0.0.0"` for LAN device access.
- Express binds to `HOST` (default `0.0.0.0`) so API and uploads work from LAN clients.
- Switch environments later by changing `VITE_API_URL`:
  - local desktop: `http://localhost:5001`
  - local phone testing: `http://<YOUR_MAC_IP>:5001`
  - production: `https://your-api-domain`

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (frontend) |
| `npm run server` | Express API |
| `npm run build` | Production frontend + PWA assets |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |

## Optional: regenerate PWA icons

After changing the source mark in `public/brand/sesh-icon.png`:

```bash
python3 scripts/generate-pwa-icons.py
```

Then run `npm run build` again.
