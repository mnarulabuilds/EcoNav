#!/usr/bin/env bash
# Production deploy — Docker Compose stack (API + web + Postgres + Caddy TLS)
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

COMPOSE_FILE=$(node -e "console.log(require('./deploy.config.json').docker.composeFile)")
ENV_FILE=$(node -e "console.log(require('./deploy.config.json').docker.envFile)")
WEB_URL=$(node -e "console.log(require('./deploy.config.json').urls.web)")
API_URL=$(node -e "console.log(require('./deploy.config.json').urls.api)")
EXPECTED_CORS=$(node scripts/lib/cors-origins.mjs)

echo ""
info "CityConnect → ${WEB_URL} (Docker)"
echo ""

if [[ ! -f "${ENV_FILE}" ]]; then
  error "Missing ${ENV_FILE} — run: npm run setup:deploy"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "${ENV_FILE}"
set +a

if [[ "${POSTGRES_PASSWORD:-}" == *change-me* ]]; then
  error "Set a strong POSTGRES_PASSWORD / DATABASE_URL in ${ENV_FILE}"
  exit 1
fi

if [[ -z "${CORS_ORIGINS:-}" ]]; then
  export CORS_ORIGINS="${EXPECTED_CORS}"
  warn "CORS_ORIGINS was empty — using ${CORS_ORIGINS}"
elif [[ "${CORS_ORIGINS}" != *"${PUBLIC_WEB_DOMAIN:-www.cityconnect.in}"* ]]; then
  warn "CORS_ORIGINS may not include your web domain. Recommended:"
  warn "  CORS_ORIGINS=${EXPECTED_CORS}"
fi

info "Running tests…"
npm test --silent

compose() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

remote_deploy() {
  local ssh_target=$1
  local remote_path=$2
  info "Deploying on ${ssh_target}:${remote_path}…"

  ssh "${ssh_target}" "mkdir -p '${remote_path}'"
  rsync -az --delete \
    --exclude node_modules \
    --exclude .git \
    --exclude .next \
    --exclude dist \
    "${ROOT}/" "${ssh_target}:${remote_path}/"

  ssh "${ssh_target}" "cd '${remote_path}' && docker compose --env-file '${ENV_FILE}' -f '${COMPOSE_FILE}' up -d --build --remove-orphans"
}

if [[ -n "${DEPLOY_SSH:-}" && -n "${DEPLOY_PATH:-}" ]]; then
  remote_deploy "${DEPLOY_SSH}" "${DEPLOY_PATH}"
else
  info "Building and starting containers locally…"
  compose up -d --build --remove-orphans
fi

info "Waiting for API health…"
HEALTH_OK=false
for _ in $(seq 1 36); do
  if curl -sf "${API_URL}/api/health" >/dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  sleep 5
done

if [[ "$HEALTH_OK" == "true" ]]; then
  info "API is healthy ✓"
else
  warn "Public API health check did not succeed yet (DNS/TLS may still be propagating)."
  warn "Try: curl ${API_URL}/api/health"
  compose ps || true
fi

echo ""
info "Deployment finished."
echo "  Web  → ${WEB_URL}"
echo "  API  → ${API_URL}"
echo "  CORS → ${CORS_ORIGINS}"
echo ""
