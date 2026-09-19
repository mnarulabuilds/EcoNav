#!/usr/bin/env bash
# One-time production env for Docker deploy → cityconnect.in
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}▸${NC} $*"; }
warn()  { echo -e "${YELLOW}!${NC} $*"; }

WEB_URL=$(node -e "console.log(require('./deploy.config.json').urls.web)")
API_URL=$(node -e "console.log(require('./deploy.config.json').urls.api)")
WEB_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.web)")
API_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.api)")
WEB_ALIAS=$(node -e "console.log(require('./deploy.config.json').domains.webAlias)")
DEFAULT_CORS=$(node scripts/lib/cors-origins.mjs)

info "CityConnect Docker production setup"
info "Web: ${WEB_URL}"
info "API: ${API_URL}"
echo ""

if [[ ! -f .env.production ]]; then
  cp .env.production.example .env.production
  PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
  sed -i.bak "s/change-me-use-a-long-random-password/${PASS}/g" .env.production
  rm -f .env.production.bak
  warn "Created .env.production with a generated Postgres password."
  warn "Edit ACME_EMAIL and review domains before going live."
else
  info ".env.production already exists — leaving it unchanged."
fi

# Keep CORS in sync with deploy.config.json unless user customized heavily
if grep -q '^CORS_ORIGINS=' .env.production; then
  if ! grep -q "^CORS_ORIGINS=${DEFAULT_CORS}$" .env.production 2>/dev/null; then
    warn "Ensure CORS_ORIGINS in .env.production includes: ${DEFAULT_CORS}"
  fi
fi

echo ""
info "Next steps:"
echo "  1. Edit .env.production (ACME_EMAIL, passwords if needed)"
echo "  2. Point DNS A records for ${WEB_DOMAIN}, ${WEB_ALIAS}, ${API_DOMAIN} → your server IP"
echo "  3. On the server: npm run deploy   (or docker compose locally for testing)"
echo ""
info "Full guide: DEPLOY.md"
echo ""
