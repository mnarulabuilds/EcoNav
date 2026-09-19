#!/usr/bin/env bash
# Legacy: Vercel (web) + Railway (API). Production Docker: npm run deploy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}▸${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*" >&2; }
warn()  { echo -e "${YELLOW}!${NC} $*"; }

WEB_URL=$(node -e "console.log(require('./deploy.config.json').urls.web)")
API_URL=$(node -e "console.log(require('./deploy.config.json').urls.api)")
WEB_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.web)")
API_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.api)")
CORS_ORIGINS=$(node scripts/lib/cors-origins.mjs)

echo ""
info "Legacy deploy (Railway + Vercel) → ${WEB_URL}"
echo ""

if [[ ! -f .env.deploy ]]; then
  error "Missing .env.deploy — see DEPLOY-VERCEL.md"
  exit 1
fi

# shellcheck disable=SC1091
source .env.deploy

VERCEL_TOKEN=$(echo "${VERCEL_TOKEN:-}" | sed 's/^[[:space:]"'\'']*//;s/[[:space:]"'\'']*$//')

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  error "VERCEL_TOKEN required in .env.deploy"
  exit 1
fi

export VERCEL_TOKEN
VERCEL="npx vercel"
RAILWAY="npx @railway/cli"

# shellcheck disable=SC1091
source "$ROOT/scripts/lib/railway-auth.sh"
configure_railway_deploy
RAILWAY_FLAGS=( $(railway_project_args) )

info "Running tests..."
npm test --silent

info "Deploying API → ${API_DOMAIN}..."
$RAILWAY variable set "CORS_ORIGINS=${CORS_ORIGINS}" --skip-deploys "${RAILWAY_FLAGS[@]}" 2>/dev/null \
  || warn "Could not update CORS_ORIGINS — set it manually in Railway dashboard"

if ! $RAILWAY up --detach --yes "${RAILWAY_FLAGS[@]}"; then
  error "Railway deploy failed."
  exit 1
fi

info "Deploying Web → ${WEB_DOMAIN}..."
cd "$ROOT/apps/web"
$VERCEL deploy --prod --yes \
  --token "$VERCEL_TOKEN" \
  --env "NEXT_PUBLIC_API_URL=${API_URL}" \
  --env "NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

info "Done. Web → ${WEB_URL}  API → ${API_URL}"
