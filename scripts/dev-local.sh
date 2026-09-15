#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgres://cityconnect:cityconnect@localhost:5432/cityconnect}"

check_port() {
  local port=$1
  local name=$2
  if lsof -ti ":$port" >/dev/null 2>&1; then
    echo "Port $port is already in use ($name)."
    echo "Stop the existing dev server, then run npm run dev again:"
    echo "  lsof -ti :$port | xargs kill"
    exit 1
  fi
}

if command -v docker >/dev/null 2>&1; then
  echo "Starting PostgreSQL (docker compose)…"
  docker compose up -d postgres
  echo "Waiting for database…"
  for _ in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U cityconnect -d cityconnect >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
else
  echo "Docker not found — set DATABASE_URL to an existing Postgres instance or use PLATFORM_STORE=memory."
fi

echo "Running migrations & seed…"
npm run db:prepare

check_port 3000 "web"
check_port 3001 "api"

trap 'kill 0' EXIT INT TERM

npm run dev:api &
npm run worker:notifications --workspace=@econav/api &
npm run dev:web &
wait
