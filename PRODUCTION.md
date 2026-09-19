# CityConnect — production & commercial readiness

This document is the **master plan** for taking CityConnect from demo to **pilot/production** at [https://www.cityconnect.in](https://www.cityconnect.in).

---

## What the product does today

| Area | Capability | User value |
|------|------------|------------|
| **Citizen** | Civic reports with map pin, ward, SLA tracking | Faster grievance redressal |
| **Citizen** | Schemes eligibility, waste pickups, utilities | Self-service government services |
| **Citizen** | Health, education, mobility, emergency catalogs | Single portal for city information |
| **Official** | Dashboard, ticket queue, status updates | Operations control room |
| **Operations** | CVRP route planner + simulation | Waste fleet efficiency |
| **Platform** | PostgreSQL persistence, notification outbox worker | Data survives restarts |

---

## Commercial-ready feature roadmap

### Phase A — Pilot launch (now → 4 weeks)

Ship with Docker on **cityconnect.in**; real users on **demo OTP** (`ALLOW_DEMO_OTP=true`).

- [x] Docker stack: Postgres, API, web, worker, Caddy TLS
- [x] CORS locked to `www` + apex domain
- [x] Rate limiting + login throttling
- [x] Security headers (Caddy)
- [ ] SMS OTP (MSG91 / Twilio) — **required before marketing as “secure login”**
- [ ] User registration (phone + consent)
- [ ] Email/SMS ticket status notifications (outbox → provider)

### Phase B — Municipal contract (1–3 months)

- Ward-scoped official roles, audit log on ticket changes
- Photo/video evidence on tickets (S3-compatible storage)
- Hindi + one regional language
- SLA dashboards and weekly PDF for commissioners
- Export open tickets (GeoJSON/CSV)

### Phase C — Multi-city SaaS (3–6 months)

- Tenant per ULB (`ulbId`), subdomain branding
- Billing (per ward / per citizen MAU)
- DigiLocker / SSO, Open311 adapters
- Mobile offline queue + push

See also [ROADMAP.md](ROADMAP.md) for detailed ideas.

---

## Production hardening (implemented)

| Control | Implementation |
|---------|----------------|
| **TLS** | Caddy + Let's Encrypt |
| **CORS** | `CORS_ORIGINS` env + code defaults for cityconnect.in |
| **Rate limit** | `@fastify/rate-limit` global + stricter `/auth/login` |
| **Trust proxy** | `TRUST_PROXY=true` behind Caddy |
| **DB** | Postgres volume, not exposed publicly |
| **Migrations** | API entrypoint on startup |
| **Health** | `/api/health` for orchestration |
| **Demo auth guard** | `ALLOW_DEMO_OTP` — set `false` when SMS live |
| **CI** | typecheck, lint, coverage, Docker build |

### Before calling it “enterprise”

1. Replace demo OTP with real SMS and session hardening (httpOnly cookies or short-lived JWT + refresh).
2. Secrets in a vault (not plain `.env` on disk) — e.g. Docker secrets / host KMS.
3. Automated Postgres backups + restore drill.
4. WAF / DDoS (Cloudflare in front of Caddy or managed LB).
5. Pen test and privacy policy for citizen PII.

---

## Go live: https://www.cityconnect.in

### Prerequisites

- Linux VPS (4 GB RAM recommended), Docker + Compose v2
- Ports **80** and **443** open
- DNS **A records** → server IP: `www`, `@` (apex), `api`

### One-time setup

```bash
git clone <your-repo> && cd EcoNav
npm run setup:deploy          # creates .env.production + random DB password
# Edit .env.production: ACME_EMAIL, confirm domains & CORS
```

Required `.env.production` highlights:

```env
CORS_ORIGINS=https://www.cityconnect.in,https://cityconnect.in
NEXT_PUBLIC_API_URL=https://api.cityconnect.in
ALLOW_DEMO_OTP=true          # pilot only; false when SMS auth is live
TRUST_PROXY=true
RATE_LIMIT_ENABLED=true
```

### Deploy (production script)

**On the server** (or via SSH from laptop):

```bash
npm run deploy:live
```

This runs:

1. `preflight-production.sh` — env, CORS, Docker checks  
2. `deploy-docker.sh` — tests, `docker compose` build/up  
3. `verify-live.sh` — health, web, CORS preflight  

**Remote deploy from laptop** — add to `.env.production`:

```env
DEPLOY_SSH=ubuntu@YOUR_SERVER_IP
DEPLOY_PATH=/opt/cityconnect
```

Then `npm run deploy:live` rsyncs and starts Compose on the server.

### After deploy

```bash
npm run verify:live
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api caddy
```

Pilot users: **Help** → [https://www.cityconnect.in/citizen/help](https://www.cityconnect.in/citizen/help)

---

## Architecture (production)

```
Internet → Caddy (:443)
            ├─ www.cityconnect.in → web:3000 (Next.js)
            └─ api.cityconnect.in  → api:3001 (Fastify)
                    ├─ postgres:5432
                    └─ worker (notifications)
```

Browser calls `https://api.cityconnect.in` from `https://www.cityconnect.in`; API validates `Origin` against `CORS_ORIGINS`.

---

## Related docs

- [DEPLOY.md](DEPLOY.md) — operations & troubleshooting  
- [GO-LIVE.md](GO-LIVE.md) — short checklist  
- [ROADMAP.md](ROADMAP.md) — feature backlog  
