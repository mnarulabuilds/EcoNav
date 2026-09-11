# Deploy EcoNav to www.econav.in

One-command deployment using **Vercel** (web) + **Railway** (API).

| Service | URL | Host |
|---------|-----|------|
| Web | https://www.econav.in | Vercel |
| API | https://api.econav.in | Railway |

---

## One-time setup (~10 minutes)

### 1. Get deploy tokens

| Platform | Token URL |
|----------|-----------|
| Vercel | https://vercel.com/account/tokens |
| Railway | https://railway.com/account/tokens |

### 2. Create a Railway project (if you don't have one)

1. Go to https://railway.com/dashboard → **New Project** → **Empty Project**
2. Name it `econav-api`
3. Copy **Project ID** from Settings → General
4. Create a **Project Token** from Settings → Tokens

### 3. Configure credentials

```bash
cp .env.deploy.example .env.deploy
```

Edit `.env.deploy`:

```env
VERCEL_TOKEN=...           # from vercel.com/account/tokens
RAILWAY_PROJECT_ID=...     # from Railway → Project → Settings → General
RAILWAY_TOKEN=...          # from Railway → Project → Settings → Tokens
```

> **Important:** `RAILWAY_TOKEN` must be a **Project Token**, not an account token from railway.com/account/tokens.

### 4. Run setup (first deploy)

```bash
npm run setup:deploy
```

### 5. Configure DNS (at your domain registrar)

| Record | Type | Value |
|--------|------|-------|
| `www.econav.in` | CNAME | `cname.vercel-dns.com` |
| `econav.in` | A | `76.76.21.21` |
| `api.econav.in` | CNAME | *(Railway hostname from dashboard)* |

Also add domains in hosting dashboards:
- **Vercel** → econav-web → Settings → Domains → add `www.econav.in` and `econav.in`
- **Railway** → econav-api → Settings → Networking → add `api.econav.in`

---

## Deploy (every time)

```bash
npm run deploy
```

This will:
1. Run all unit tests
2. Deploy API to Railway (`api.econav.in`)
3. Deploy Web to Vercel (`www.econav.in`)
4. Verify API health

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing .env.deploy` | Run `npm run setup:deploy` |
| CORS error on website | Redeploy — script updates `CORS_ORIGINS` automatically |
| API not reachable | Check Railway logs; confirm DNS for `api.econav.in` |
| Web shows old API URL | Redeploy with `npm run deploy` |
| Tests fail | Fix failing tests before deploy (deploy aborts on test failure) |
| `railway/iac requires Railway CLI 5.42.1` | Fixed — scripts use `@railway/cli`, not the `railway` SDK package |
| `Unauthorized` on setup/deploy | Use a **Project Token** as `RAILWAY_TOKEN` (Project → Settings → Tokens) plus `RAILWAY_PROJECT_ID`. Account tokens from railway.com/account/tokens will NOT work as `RAILWAY_TOKEN` |
| `Not signed in` on deploy | Same as above — project token + project ID required |
| `railway variables` fails | Fixed — CLI v5 uses `railway variable set` |

---

## File reference

| File | Purpose |
|------|---------|
| `deploy.config.json` | Domain and URL configuration |
| `.env.deploy` | Vercel + Railway tokens (gitignored) |
| `scripts/setup-deploy.sh` | One-time project linking |
| `scripts/deploy.sh` | Production deploy script |
| `Dockerfile` | API container for Railway |
| `railway.toml` | Railway build config |
| `apps/web/vercel.json` | Vercel monorepo build config |
