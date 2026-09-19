# Legacy deploy: Railway (API) + Vercel (web)

The primary production path is **Docker** — see [DEPLOY.md](DEPLOY.md).

This document is for the older split hosting model.

1. Copy `.env.deploy.example` → `.env.deploy` (Vercel + Railway tokens)
2. Deploy API with `railway.api.json` / `Dockerfile`
3. Deploy web on Vercel (`apps/web`)
4. Set `CORS_ORIGINS` on Railway to match your web domain

```bash
npm run deploy:vercel
```

Update `deploy.config.json` domains if you are not using `cityconnect.in`.
