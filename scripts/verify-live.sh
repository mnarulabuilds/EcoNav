#!/usr/bin/env bash
# Post-deploy smoke tests — health, TLS, CORS
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

WEB_URL=$(node -e "console.log(require('./deploy.config.json').urls.web)")
API_URL=$(node -e "console.log(require('./deploy.config.json').urls.api)")
WEB_ORIGIN="${WEB_URL}"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

fail() { echo -e "${RED}✗${NC} $*" >&2; exit 1; }
ok() { echo -e "${GREEN}✓${NC} $*"; }

info "Verifying ${WEB_URL} and ${API_URL}…"

HEALTH=$(curl -sf "${API_URL}/api/health") || fail "API health check failed: ${API_URL}/api/health"
echo "${HEALTH}" | grep -q '"status":"ok"' || fail "API health status not ok"
ok "API health"

WEB_CODE=$(curl -sf -o /dev/null -w '%{http_code}' "${WEB_URL}/") || fail "Web homepage unreachable"
[[ "${WEB_CODE}" == "200" ]] || fail "Web returned HTTP ${WEB_CODE}"
ok "Web homepage"

CORS_HEADERS=$(curl -sf -D - -o /dev/null -X OPTIONS "${API_URL}/api/v1/schemes" \
  -H "Origin: ${WEB_ORIGIN}" \
  -H "Access-Control-Request-Method: GET") || fail "CORS preflight failed"

echo "${CORS_HEADERS}" | grep -qi "access-control-allow-origin: ${WEB_ORIGIN}" || fail "CORS missing allow-origin for ${WEB_ORIGIN}"
ok "CORS preflight for ${WEB_ORIGIN}"

echo ""
ok "Live verification passed"
