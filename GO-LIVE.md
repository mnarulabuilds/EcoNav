# Go live at www.econav.in (fresh start)

You deleted your Railway project — start here. Use **two free hosts**:

| What | Host | URL |
|------|------|-----|
| API | Railway | `api.econav.in` |
| Website | Vercel | `www.econav.in` |

Total time: ~15 minutes.

---

## Part A — API on Railway (7 min)

### A1. Create project

Open: **https://railway.com/new/github?repo=mnarulabuilds/EcoNav**

1. Click **Deploy Now** (authorize GitHub if asked)
2. Wait for first build — it may fail once; that's OK, we fix settings next

### A2. Configure the API service

Click your service → **Settings**:

| Setting | Value |
|---------|-------|
| Service name | `econav-api` |
| Config file | `railway.api.json` |

Go to **Variables** → **RAW Editor** → paste and save:

```
NODE_ENV=production
API_HOST=0.0.0.0
CORS_ORIGINS=https://www.econav.in,https://econav.in
```

Click **Deploy** (or push to GitHub to trigger rebuild).

### A3. Get a public URL

**Settings → Networking → Generate Domain**

You get something like `econav-api-production-xxxx.up.railway.app`

Test it:

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/health
```

Should return `{"status":"ok",...}`

### A4. Add custom domain (optional now, required for production)

**Networking → Custom Domain** → add `api.econav.in`

Copy the CNAME target Railway shows you (for DNS in Part C).

---

## Part B — Website on Vercel (5 min)

Vercel is easier for Next.js than Railway.

### B1. Import project

Open: **https://vercel.com/new**

1. **Import** → GitHub → select **EcoNav**
2. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | *(leave default or use below)* |
| Install Command | `cd ../.. && npm ci` |

3. **Environment Variables** → add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.econav.in` *(or your Railway URL from A3 while testing)* |
| `NEXT_PUBLIC_MAP_TILE_URL` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |

4. Click **Deploy**

### B2. Test Vercel URL

Open the `*.vercel.app` URL Vercel gives you. Click **Plan Optimal Routes**.

> If planning fails, set `NEXT_PUBLIC_API_URL` to your Railway `*.up.railway.app` URL, redeploy, test again.

### B3. Add custom domain

Vercel project → **Settings → Domains** → add:

- `www.econav.in`
- `econav.in` *(optional redirect to www)*

Copy the DNS records Vercel shows (for Part C).

---

## Part C — DNS (3 min)

Log in where you bought **econav.in** (GoDaddy, Cloudflare, Namecheap, etc.)

Add these records:

| Name / Host | Type | Value |
|-------------|------|-------|
| `api` | CNAME | *(Railway target from A4)* |
| `www` | CNAME | `cname.vercel-dns.com` *(or value Vercel shows)* |
| `@` | A | `76.76.21.21` *(for econav.in root → Vercel)* |

**Cloudflare users:** set records to **DNS only** (grey cloud) until SSL works.

Wait 10–30 minutes for DNS to propagate.

---

## Part D — Verify

```bash
curl https://api.econav.in/api/health
curl -I https://www.econav.in
```

Open **https://www.econav.in** → click **Plan Optimal Routes** → check map and results.

---

## If Railway build fails

Common fixes:

| Error | Fix |
|-------|-----|
| Uses wrong Dockerfile | Set Config file = `railway.api.json` in Settings |
| Build timeout | Redeploy; first build can take 3–5 min |
| Health check fail | Ensure Variables include `API_HOST=0.0.0.0` |

Check **Deployments → View logs** and share the error if stuck.

---

## After setup

Every `git push` to `main` auto-redeploys both Railway and Vercel.
