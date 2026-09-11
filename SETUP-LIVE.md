# Go live at www.econav.in

Your repo: **https://github.com/mnarulabuilds/EcoNav**

Run this in your terminal — it opens Railway and walks you through each step:

```bash
npm run go-live
```

Or open this link directly: **https://railway.com/new/github?repo=mnarulabuilds/EcoNav**

---

## What you do (4 steps, ~10 min)

### 1. Deploy API

- Click **Deploy Now** on Railway
- Rename service → `econav-api`
- Settings → **Config file** → `railway.api.json`
- Variables → paste:

```
NODE_ENV=production
API_HOST=0.0.0.0
CORS_ORIGINS=https://www.econav.in,https://econav.in
```

### 2. Deploy Web

- **+ Create** → **GitHub Repo** → EcoNav
- Rename service → `econav-web`
- Settings → **Config file** → `railway.web.json`
- Variables → paste:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.econav.in
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### 3. Add domains in Railway

| Service | Custom domain |
|---------|---------------|
| econav-api | `api.econav.in` |
| econav-web | `www.econav.in` |

### 4. DNS at your domain registrar

| Name | Type | Value |
|------|------|-------|
| `api` | CNAME | *(from Railway econav-api → Networking)* |
| `www` | CNAME | *(from Railway econav-web → Networking)* |

Wait 10–30 minutes, then open **https://www.econav.in**

---

## Test

```bash
curl https://api.econav.in/api/health
```

After DNS works, every `git push` to `main` auto-redeploys.
