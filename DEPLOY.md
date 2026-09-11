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

### 2. Configure credentials

```bash
cp .env.deploy.example .env.deploy
# Edit .env.deploy and paste VERCEL_TOKEN and RAILWAY_TOKEN
```

### 3. Run setup (links projects + first deploy)

```bash
npm run setup:deploy
```

### 4. Configure DNS (at your domain registrar)

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
| `Not signed in` on deploy | Use a **Project Token** as `RAILWAY_TOKEN` (Project → Settings → Tokens). Account tokens go in `RAILWAY_API_TOKEN` for setup only |
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
