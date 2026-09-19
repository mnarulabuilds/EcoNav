#!/usr/bin/env bash
# Go live at https://www.cityconnect.in — Docker + Postgres + Caddy + CORS verification
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}CityConnect live deploy${NC}"
echo -e "Target: ${CYAN}https://www.cityconnect.in${NC} (API: api.cityconnect.in)"
echo ""

bash "${ROOT}/scripts/preflight-production.sh"

# Ensure CORS aligns with deploy.config.json when unset or incomplete
ENV_FILE=$(node -e "console.log(require('./deploy.config.json').docker.envFile)")
EXPECTED_CORS=$(node scripts/lib/cors-origins.mjs)
# shellcheck disable=SC1090
set -a
source "${ENV_FILE}"
set +a
export CORS_ORIGINS="${CORS_ORIGINS:-${EXPECTED_CORS}}"

bash "${ROOT}/scripts/deploy-docker.sh"

echo ""
echo -e "${BOLD}Running live smoke tests…${NC}"
if bash "${ROOT}/scripts/verify-live.sh"; then
  echo ""
  echo "CityConnect is live for pilot users."
  echo "  Web:  https://www.cityconnect.in"
  echo "  API:  https://api.cityconnect.in"
  echo "  Help: https://www.cityconnect.in/citizen/help"
  echo ""
  echo "Pilot login (demo OTP): see /citizen/help — disable with ALLOW_DEMO_OTP=false when SMS auth ships."
else
  echo ""
  echo "Deploy finished but smoke tests failed — DNS/TLS may still be propagating (wait 5–30 min, re-run):"
  echo "  npm run verify:live"
  exit 1
fi
