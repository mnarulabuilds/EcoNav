#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

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

check_port 3000 "web"
check_port 3001 "api"

trap 'kill 0' EXIT INT TERM

npm run dev:api &
npm run dev:web &
wait
