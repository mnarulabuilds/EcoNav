# Make EcoNav live at www.econav.in — 3 steps only

Your code is already on GitHub: **https://github.com/mnarulabuilds/EcoNav**

Do these 3 things in order (~15 minutes total).

---

## Step 1 — Railway (5 min)

1. Open this link: **https://railway.com/new/github**
2. Click **Configure GitHub App** → allow access → select **EcoNav** repo
3. Railway creates a service. Click it → **Settings** → rename to **`econav-api`**
4. Go to **Variables** → **Raw Editor** → paste:

```
NODE_ENV=production
API_HOST=0.0.0.0
CORS_ORIGINS=https://www.econav.in,https://econav.in
```

5. **Settings → Networking → Custom Domain** → add `api.econav.in`
6. Wait for deploy to finish (green checkmark)

---

## Step 2 — Add Web service on Railway (5 min)

1. In the same Railway project, click **+ Create** → **GitHub Repo** → **EcoNav**
2. Rename new service to **`econav-web`**
3. **Settings → Build** → set **Dockerfile Path** to: `Dockerfile.web`
4. Go to **Variables** → **Raw Editor** → paste:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.econav.in
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

5. **Settings → Networking → Custom Domain** → add `www.econav.in`
6. Wait for deploy to finish

---

## Step 3 — DNS at your domain registrar (5 min)

Log in where you bought **econav.in** and add these records.
(Railway shows the exact CNAME values in each service's **Networking** tab.)

| Name | Type | Value |
|------|------|-------|
| `api` | CNAME | *(copy from econav-api → Networking)* |
| `www` | CNAME | *(copy from econav-web → Networking)* |

Save and wait 10–30 minutes.

---

## Done — test it

Open **https://www.econav.in** and click **Plan Optimal Routes**.

```bash
curl https://api.econav.in/api/health
```

---

## After setup

Every `git push` to `main` auto-redeploys both services. No CLI needed.
