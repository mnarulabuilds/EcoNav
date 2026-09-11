#!/usr/bin/env bash
# One-time deployment setup for www.econav.in
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}▸${NC} $*"; }
warn()  { echo -e "${YELLOW}!${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*" >&2; }

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
  warn "Created .env.deploy — fill in tokens, then re-run: npm run setup:deploy"
  exit 0
fi

# shellcheck disable=SC1091
source .env.deploy

VERCEL_TOKEN=$(echo "${VERCEL_TOKEN:-}" | sed 's/^[[:space:]"'\'']*//;s/[[:space:]"'\'']*$//')

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  error "Missing VERCEL_TOKEN in .env.deploy"
  exit 1
fi

export VERCEL_TOKEN
VERCEL="npx vercel"
RAILWAY="npx @railway/cli"

# shellcheck disable=SC1091
source "$ROOT/scripts/lib/railway-auth.sh"
configure_railway_setup

RAILWAY_FLAGS=( $(railway_project_args) )

# ── Railway (API) ─────────────────────────────────────────────────────────────
info "Setting up Railway project for API..."

if [[ "${SETUP_MODE}" == "project" ]]; then
  info "Using project token + project ID"
elif [[ "${SETUP_MODE}" == "account" ]]; then
  if [[ ! -f .railway/config.json ]]; then
    if [[ -n "${RAILWAY_PROJECT_ID:-}" ]]; then
      info "Linking to existing project ${RAILWAY_PROJECT_ID}..."
      $RAILWAY link --project "$RAILWAY_PROJECT_ID"
    else
      info "Creating new Railway project 'econav-api'..."
      $RAILWAY init --name econav-api
    fi
  else
    info "Project already linked"
  fi
  # After link/init, capture project ID if not set
  if [[ -z "${RAILWAY_PROJECT_ID:-}" && -f .railway/config.json ]]; then
    RAILWAY_PROJECT_ID=$(node -e "console.log(require('./.railway/config.json').project || '')")
    export RAILWAY_PROJECT_ID
    RAILWAY_FLAGS=( $(railway_project_args) )
  fi
fi

info "Setting Railway environment variables..."
if ! $RAILWAY variable set \
  NODE_ENV=production \
  API_HOST=0.0.0.0 \
  "CORS_ORIGINS=${CORS_ORIGINS}" \
  --skip-deploys \
  "${RAILWAY_FLAGS[@]}"; then
  error "Failed to set Railway variables."
  if [[ "${SETUP_MODE}" == "project" ]]; then
    echo ""
    echo "  Check that RAILWAY_TOKEN is a Project Token (not account token)"
    echo "  from: Railway → Project → Settings → Tokens"
  else
    echo ""
    echo "  Check that RAILWAY_API_TOKEN is valid at https://railway.com/account/tokens"
  fi
  exit 1
fi

info "Deploying API (first time)..."
if ! $RAILWAY up --detach --yes "${RAILWAY_FLAGS[@]}"; then
  error "Railway deploy failed."
  echo ""
  echo "  Verify in .env.deploy:"
  echo "    RAILWAY_TOKEN     = Project → Settings → Tokens"
  echo "    RAILWAY_PROJECT_ID = Project → Settings → General"
  exit 1
fi

warn "In Railway dashboard (https://railway.com/dashboard):"
warn "  1. Open your project → Settings → Networking → Custom Domain"
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
