# Deploy CityConnect to https://www.cityconnect.in (Docker)

**Start here for commercial/production planning:** [PRODUCTION.md](PRODUCTION.md)

**One-command live deploy:** `npm run deploy:live` (preflight + Docker + CORS smoke tests)

Production stack runs entirely in **Docker**:

| Service | Container | Public URL |
|---------|-----------|------------|
| Web (Next.js) | `web` | https://www.cityconnect.in |
| API (Fastify) | `api` | https://api.cityconnect.in |
| PostgreSQL | `postgres` | internal only |
| Notification worker | `worker` | internal |
| TLS reverse proxy | `caddy` | ports 80 / 443 |

CORS is enforced by the API using `CORS_ORIGINS` (set automatically in `.env.production`).

---

## Prerequisites

- A Linux VPS (2 GB+ RAM recommended) with **Docker** and **Docker Compose v2**
- DNS control for **cityconnect.in**
- Ports **80** and **443** open on the server firewall

---

## One-time setup (~15 minutes)

### 1. Configure production env

On your **local machine** (or on the server):

```bash
npm run setup:deploy
# creates .env.production with a random Postgres password
```

Edit `.env.production`:

- `ACME_EMAIL` — email for Let's Encrypt (Caddy)
- Confirm domains: `www.cityconnect.in`, `cityconnect.in`, `api.cityconnect.in`
- Confirm `CORS_ORIGINS=https://www.cityconnect.in,https://cityconnect.in`
- Confirm `NEXT_PUBLIC_API_URL=https://api.cityconnect.in`

### 2. DNS records

Point all hostnames to your **server public IPv4** (A records):

| Host | Type | Value |
|------|------|--------|
| `www` | A | `YOUR_SERVER_IP` |
| `@` (apex) | A | `YOUR_SERVER_IP` |
| `api` | A | `YOUR_SERVER_IP` |

Wait for propagation (often 5–30 minutes).

### 3. Deploy

**Option A — deploy on the server (recommended)**

Copy the repo to the server, then:

```bash
cd /opt/cityconnect   # or your path
cp .env.production.example .env.production   # if not copied yet
# paste/edit secrets
npm run deploy
```

**Option B — deploy from your laptop via SSH**

In `.env.production`:

```env
DEPLOY_SSH=ubuntu@YOUR_SERVER_IP
DEPLOY_PATH=/opt/cityconnect
```

Then from the repo root:

```bash
npm run deploy
```

This rsyncs the project and runs `docker compose up -d --build` on the server.

---

## What `npm run deploy` does

1. Runs unit tests
2. Builds Docker images (`Dockerfile`, `Dockerfile.web`)
3. Starts Postgres, API, worker, web, and Caddy
4. API entrypoint runs DB migrations + demo seed (if DB is empty)
5. Caddy obtains TLS certificates and routes:
   - `api.cityconnect.in` → API
   - `www.cityconnect.in` → web
   - `cityconnect.in` → redirect to www

---

## Verify

```bash
curl https://api.cityconnect.in/api/health
curl -I https://www.cityconnect.in
```

In the browser (DevTools → Network), confirm API calls from `www.cityconnect.in` succeed with **no CORS errors**.

Demo login: OTP `123456` — citizen `9999999999`, official `8888888888`.

---

## CORS troubleshooting

| Symptom | Fix |
|---------|-----|
| Browser blocked by CORS | Set `CORS_ORIGINS=https://www.cityconnect.in,https://cityconnect.in` in `.env.production`, then `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build api` |
| Admin routes fail after login | Ensure `Authorization` is sent; API allows this header in preflight |
| Wrong API from web | Rebuild web after changing `NEXT_PUBLIC_API_URL`: `docker compose ... up -d --build web` |

Origins are also baked into `apps/api/src/cors.ts` for `cityconnect.in`; `CORS_ORIGINS` env wins for additional domains.

---

## Operations

```bash
# Logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api web caddy

# Restart after env change
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# Stop
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

Backups: snapshot the `cityconnect_pg_data` Docker volume regularly.

---

## Legacy (Vercel + Railway)

Non-container web hosting is still available via `npm run deploy:vercel` — see [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md).

---

## File reference

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production orchestration |
| `Dockerfile` | API + worker image |
| `Dockerfile.web` | Next.js standalone web image |
| `deploy/Caddyfile` | TLS + reverse proxy |
| `.env.production.example` | Production env template |
| `deploy.config.json` | Canonical domains & URLs |
| `scripts/deploy-docker.sh` | Deploy script |
| `scripts/setup-docker-prod.sh` | First-time env setup |
