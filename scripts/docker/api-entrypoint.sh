#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ "${SKIP_DB_BOOTSTRAP:-}" != "true" ]; then
  /app/scripts/docker/wait-for-postgres.sh
  echo "Applying migrations and seed (if empty)…"
  node /app/packages/db/dist/seed-cli.js
fi

exec "$@"
