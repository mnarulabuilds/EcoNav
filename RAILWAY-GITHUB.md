# Deploy EcoNav via Railway + GitHub → www.econav.in

This guide deploys **both** the API and Web app from your GitHub repo on Railway.

| Service | URL | Dockerfile |
|---------|-----|------------|
| API | https://api.econav.in | `Dockerfile` |
| Web | https://www.econav.in | `Dockerfile.web` |

Every push to `main` auto-deploys both services.

---

## Step 1 — Push code to GitHub

```bash
cd EcoNav

git init   # skip if already a repo
git add .
git commit -m "EcoNav initial release"
git branch -M main

# Create a repo on GitHub, then:
git remote add origin https://github.com/<your-username>/EcoNav.git
git push -u origin main
```

---

## Step 2 — Create Railway project from GitHub

1. Go to [railway.com/dashboard](https://railway.com/dashboard)
2. Click **New Project**
3. Choose **Deploy from GitHub repo**
4. Authorize Railway to access GitHub if prompted
5. Select your **EcoNav** repository
6. Railway creates a first service — rename it to **`econav-api`**

---

## Step 3 — Configure the API service

Click **econav-api** → **Settings**:

### Build

| Setting | Value |
|---------|-------|
| Builder | Dockerfile |
| Dockerfile path | `Dockerfile` |

(Railway reads `railway.toml` at repo root automatically.)

### Variables

Go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `API_HOST` | `0.0.0.0` |
| `CORS_ORIGINS` | `https://www.econav.in,https://econav.in` |

> Railway injects `PORT` automatically — do not set it manually.

### Networking

1. Go to **Settings → Networking**
2. Click **Generate Domain** (you get a `*.up.railway.app` URL for testing)
3. Click **Custom Domain** → add `api.econav.in`

### Deploy

Click **Deploy** (or push to `main` — Railway auto-deploys).

Verify:

```bash
curl https://api.econav.in/api/health
# → {"status":"ok","service":"econav-api",...}
```

---

## Step 4 — Add the Web service

1. In the same Railway project, click **+ New** → **GitHub Repo**
2. Select the **same EcoNav repo**
3. Rename the new service to **`econav-web`**

### Build

| Setting | Value |
|---------|-------|
| Builder | Dockerfile |
| Dockerfile path | `Dockerfile.web` |

### Variables

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://api.econav.in` |
| `NEXT_PUBLIC_MAP_TILE_URL` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |

> `NEXT_PUBLIC_*` variables must be set **before** the first build — they are baked in at build time.

### Networking

1. **Settings → Networking → Generate Domain**
2. Add custom domain: `www.econav.in`
3. Optionally add `econav.in` and redirect to `www`

### Deploy

Trigger deploy. Verify the Railway URL loads the map UI, then test **Plan Optimal Routes**.

---

## Step 5 — Configure DNS (domain registrar)

At wherever you manage **econav.in** (GoDaddy, Cloudflare, Namecheap, etc.):

| Host | Type | Value |
|------|------|-------|
| `api` | CNAME | *(Railway hostname for econav-api — shown in Networking tab)* |
| `www` | CNAME | *(Railway hostname for econav-web — shown in Networking tab)* |
| `@` | CNAME | *(Railway hostname for econav-web, or redirect `@` → `www`)* |

Railway shows the exact CNAME target when you add each custom domain.

**If using Cloudflare:** set proxy to **DNS only** (grey cloud) initially until SSL certificates are issued.

Wait 5–30 minutes for DNS propagation.

---

## Step 6 — Verify production

```bash
# API health
curl https://api.econav.in/api/health

# Web loads
curl -I https://www.econav.in
```

In browser at https://www.econav.in:

- [ ] Map renders with depot and collection sites
- [ ] **Plan Optimal Routes** returns results
- [ ] **Simulate** tab runs timeline
- [ ] No CORS errors in browser DevTools console

---

## Auto-deploy on every push

Railway watches your GitHub repo by default. After setup:

```bash
git add .
git commit -m "your changes"
git push origin main
```

Both `econav-api` and `econav-web` rebuild and redeploy automatically.

To deploy only one service: Railway dashboard → service → **Redeploy**, or use **Watch Paths** in settings to limit triggers.

---

## Architecture

```
GitHub (main branch)
       │
       ▼
Railway Project: EcoNav
├── econav-api  (Dockerfile)     → api.econav.in
└── econav-web  (Dockerfile.web) → www.econav.in
         │
         └── calls API at api.econav.in
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on API | Check Railway build logs; ensure `Dockerfile` path is correct |
| Build fails on Web | Set `NEXT_PUBLIC_API_URL` before build; redeploy |
| CORS error in browser | Set `CORS_ORIGINS=https://www.econav.in,https://econav.in` on API service, redeploy |
| `Plan Optimal Routes` fails | Confirm API is up: `curl https://api.econav.in/api/health` |
| Custom domain not working | Verify CNAME in DNS matches Railway Networking tab exactly |
| SSL pending | Wait 10–15 min; disable Cloudflare proxy if enabled |
| Web shows wrong API URL | Update `NEXT_PUBLIC_API_URL` on web service → **Redeploy** (rebuild required) |

---

## Optional — Watch paths (reduce unnecessary deploys)

In each service's **Settings → Build**:

**econav-api** watch paths:
```
apps/api/**
packages/core/**
Dockerfile
```

**econav-web** watch paths:
```
apps/web/**
packages/core/**
Dockerfile.web
```
