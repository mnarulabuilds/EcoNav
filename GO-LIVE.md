# Go live at https://www.cityconnect.in

Use the **Docker production stack** (Postgres + API + web + Caddy TLS).

**Full guide:** [DEPLOY.md](DEPLOY.md)

---

## Quick checklist

### 1. Server

- Ubuntu/Debian VPS with Docker + Compose v2
- Open ports **80** and **443**

### 2. Environment

```bash
npm run setup:deploy
# edit .env.production → ACME_EMAIL, verify domains & CORS_ORIGINS
```

### 3. DNS (A records → server IP)

| Host | Points to |
|------|-----------|
| `www.cityconnect.in` | VPS IPv4 |
| `cityconnect.in` | VPS IPv4 |
| `api.cityconnect.in` | VPS IPv4 |

### 4. Deploy

On the server (with repo + `.env.production`):

```bash
npm run deploy
```

Or from laptop with `DEPLOY_SSH` + `DEPLOY_PATH` set in `.env.production`.

### 5. Verify

```bash
curl https://api.cityconnect.in/api/health
```

Open **https://www.cityconnect.in** — test login and **Plan Optimal Routes** (no CORS errors in console).

---

## CORS (required values)

In `.env.production`:

```env
CORS_ORIGINS=https://www.cityconnect.in,https://cityconnect.in
NEXT_PUBLIC_API_URL=https://api.cityconnect.in
```

After any change, rebuild API and web:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build api web
```
