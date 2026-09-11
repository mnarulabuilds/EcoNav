#!/usr/bin/env bash
# One-time deployment setup for www.econav.in
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}▸${NC} $*"; }
warn()  { echo -e "${YELLOW}!${NC} $*"; }

API_URL=$(node -e "console.log(require('./deploy.config.json').urls.api)")
WEB_URL=$(node -e "console.log(require('./deploy.config.json').urls.web)")
WEB_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.web)")
API_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.api)")
CORS_ORIGINS="https://www.econav.in,https://econav.in,${WEB_URL}"

info "EcoNav deployment setup"
info "Web: ${WEB_URL}"
info "API: ${API_URL}"
echo ""

# ── .env.deploy ──────────────────────────────────────────────────────────────
if [[ ! -f .env.deploy ]]; then
  cp .env.deploy.example .env.deploy
  warn "Created .env.deploy — add your VERCEL_TOKEN and RAILWAY_TOKEN"
  warn "  Vercel:  https://vercel.com/account/tokens"
  warn "  Railway: https://railway.com/account/tokens"
  echo ""
  warn "Edit .env.deploy now, then re-run: npm run setup:deploy"
  exit 0
fi

# shellcheck disable=SC1091
source .env.deploy

if [[ -z "${VERCEL_TOKEN:-}" || -z "${RAILWAY_TOKEN:-}" ]]; then
  warn ".env.deploy is missing VERCEL_TOKEN or RAILWAY_TOKEN"
  exit 1
fi

export VERCEL_TOKEN
VERCEL="npx vercel"
# Must use @railway/cli — the `railway` package is the TypeScript SDK, not the CLI
RAILWAY="npx @railway/cli"

# Setup needs account token; fall back to project token if provided
if [[ -z "${RAILWAY_API_TOKEN:-}" && -n "${RAILWAY_TOKEN:-}" ]]; then
  warn "Using RAILWAY_TOKEN for setup. For linking, an account token (RAILWAY_API_TOKEN) is recommended."
  export RAILWAY_TOKEN
elif [[ -n "${RAILWAY_API_TOKEN:-}" ]]; then
  export RAILWAY_API_TOKEN
  unset RAILWAY_TOKEN
else
  warn "Add RAILWAY_API_TOKEN (account token) to .env.deploy for setup"
  exit 1
fi

# ── Railway (API) ─────────────────────────────────────────────────────────────
info "Setting up Railway project for API..."
cd "$ROOT"

if [[ ! -f .railway/config.json ]]; then
  $RAILWAY init --name econav-api 2>/dev/null || $RAILWAY link
fi

info "Setting Railway environment variables..."
$RAILWAY variable set \
  NODE_ENV=production \
  API_HOST=0.0.0.0 \
  "CORS_ORIGINS=${CORS_ORIGINS}" \
  --skip-deploys

info "Deploying API (first time)..."
$RAILWAY up --detach --yes

warn "In Railway dashboard (https://railway.com/dashboard):"
warn "  1. Open econav-api → Settings → Networking → Custom Domain"
warn "  2. Add: ${API_DOMAIN}"
warn "  3. Point DNS: api.econav.in CNAME → Railway hostname"
echo ""

# ── Vercel (Web) ──────────────────────────────────────────────────────────────
info "Setting up Vercel project for Web..."
cd "$ROOT/apps/web"

$VERCEL link --yes --project econav-web --token "$VERCEL_TOKEN" 2>/dev/null \
  || $VERCEL link --yes --token "$VERCEL_TOKEN"

info "Setting Vercel production environment variables..."
$VERCEL env rm NEXT_PUBLIC_API_URL production --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
printf '%s' "$API_URL" | $VERCEL env add NEXT_PUBLIC_API_URL production --token "$VERCEL_TOKEN"

$VERCEL env rm NEXT_PUBLIC_MAP_TILE_URL production --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
printf '%s' 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' \
  | $VERCEL env add NEXT_PUBLIC_MAP_TILE_URL production --token "$VERCEL_TOKEN"

info "Deploying Web (first time)..."
$VERCEL deploy --prod --yes --token "$VERCEL_TOKEN"

warn "In Vercel dashboard (https://vercel.com/dashboard):"
warn "  1. Project econav-web → Settings → Domains"
warn "  2. Add: ${WEB_DOMAIN} and econav.in"
warn "  3. DNS records (at your domain registrar):"
warn "     www.econav.in → CNAME cname.vercel-dns.com"
warn "     econav.in     → A 76.76.21.21"
echo ""

info "Setup complete! Deploy anytime with:"
echo ""
echo "  npm run deploy"
echo ""
