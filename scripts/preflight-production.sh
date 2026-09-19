#!/usr/bin/env bash
# Validate .env.production before live deploy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE=$(node -e "console.log(require('./deploy.config.json').docker.envFile)")
EXPECTED_CORS=$(node scripts/lib/cors-origins.mjs)
WEB_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.web)")
API_DOMAIN=$(node -e "console.log(require('./deploy.config.json').domains.api)")

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

fail() { echo -e "${RED}✗${NC} $*" >&2; exit 1; }
ok() { echo -e "${GREEN}✓${NC} $*"; }

[[ -f "${ENV_FILE}" ]] || fail "Missing ${ENV_FILE}. Run: npm run setup:deploy"

# shellcheck disable=SC1090
set -a
source "${ENV_FILE}"
set +a

[[ -n "${ACME_EMAIL:-}" ]] || fail "Set ACME_EMAIL in ${ENV_FILE} (Let's Encrypt)"
[[ "${POSTGRES_PASSWORD:-}" != *change-me* ]] || fail "Set a strong POSTGRES_PASSWORD in ${ENV_FILE}"
[[ -n "${DATABASE_URL:-}" ]] || fail "DATABASE_URL is required"
[[ "${DATABASE_URL}" == *"${POSTGRES_PASSWORD}"* ]] || fail "DATABASE_URL password must match POSTGRES_PASSWORD"

[[ -n "${CORS_ORIGINS:-}" ]] || fail "CORS_ORIGINS is required"
[[ "${CORS_ORIGINS}" == *"https://${WEB_DOMAIN}"* ]] || fail "CORS_ORIGINS must include https://${WEB_DOMAIN}"
[[ "${CORS_ORIGINS}" == *"https://${PUBLIC_WEB_ALIAS:-cityconnect.in}"* ]] || fail "CORS_ORIGINS must include apex domain"

[[ "${NEXT_PUBLIC_API_URL:-}" == "https://${API_DOMAIN}" ]] || fail "NEXT_PUBLIC_API_URL must be https://${API_DOMAIN} (rebuild web after change)"
[[ "${PUBLIC_WEB_DOMAIN:-}" == "${WEB_DOMAIN}" ]] || fail "PUBLIC_WEB_DOMAIN should be ${WEB_DOMAIN}"
[[ "${PUBLIC_API_DOMAIN:-}" == "${API_DOMAIN}" ]] || fail "PUBLIC_API_DOMAIN should be ${API_DOMAIN}"

if [[ "${ALLOW_DEMO_OTP:-true}" == "true" && "${PREFLIGHT_ALLOW_DEMO_OTP:-false}" != "true" ]]; then
  echo -e "${RED}✗${NC} ALLOW_DEMO_OTP=true is unsafe for public production (https://${WEB_DOMAIN}). Set ALLOW_DEMO_OTP=false for go-live, or PREFLIGHT_ALLOW_DEMO_OTP=true only for a controlled pilot." >&2
  exit 1
fi

command -v docker >/dev/null 2>&1 || fail "Docker is required on the deploy host"
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required"

ok "Production env validated"
ok "CORS baseline: ${EXPECTED_CORS}"
