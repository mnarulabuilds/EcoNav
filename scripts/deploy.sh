#!/usr/bin/env bash
# One-command production deploy → www.econav.in
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
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
CORS_ORIGINS="https://www.econav.in,https://econav.in,${WEB_URL}"

echo ""
info "EcoNav → ${WEB_URL}"
echo ""

# ── Preflight ─────────────────────────────────────────────────────────────────
if [[ ! -f .env.deploy ]]; then
  error "Missing .env.deploy — run one-time setup first:"
  echo "  npm run setup:deploy"
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

# ── Tests ─────────────────────────────────────────────────────────────────────
info "Running tests..."
npm test --silent

# ── Deploy API (Railway) ──────────────────────────────────────────────────────
info "Deploying API → ${API_DOMAIN}..."

$RAILWAY variable set "CORS_ORIGINS=${CORS_ORIGINS}" --skip-deploys "${RAILWAY_FLAGS[@]}" 2>/dev/null \
  || warn "Could not update CORS_ORIGINS — set it manually in Railway dashboard"

if ! $RAILWAY up --detach --yes "${RAILWAY_FLAGS[@]}"; then
  error "Railway deploy failed."
  echo ""
  echo "  Verify in .env.deploy:"
  echo "    RAILWAY_TOKEN      = Project → Settings → Tokens"
  echo "    RAILWAY_PROJECT_ID = Project → Settings → General"
  exit 1
fi

info "Waiting for API health check..."
HEALTH_OK=false
for _ in $(seq 1 24); do
  if curl -sf "${API_URL}/api/health" >/dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  sleep 5
done

if [[ "$HEALTH_OK" == "false" ]]; then
  warn "Custom domain health check timed out (DNS may still be propagating)"
  warn "Verify: curl ${API_URL}/api/health"
else
  info "API is healthy ✓"
fi

# ── Deploy Web (Vercel) ───────────────────────────────────────────────────────
info "Deploying Web → ${WEB_DOMAIN}..."
cd "$ROOT/apps/web"

$VERCEL deploy --prod --yes \
  --token "$VERCEL_TOKEN" \
  --env "NEXT_PUBLIC_API_URL=${API_URL}" \
  --env "NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

echo ""
info "Deployment complete!"
echo ""
echo "  Web  → ${WEB_URL}"
echo "  API  → ${API_URL}"
echo ""
