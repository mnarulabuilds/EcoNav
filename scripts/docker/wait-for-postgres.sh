#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set; skipping Postgres wait."
  exit 0
fi

echo "Waiting for PostgreSQL…"
attempt=0
max=60

until node -e "
const url = new URL(process.env.DATABASE_URL);
const net = require('net');
const port = Number(url.port || 5432);
const socket = net.createConnection({ host: url.hostname, port });
socket.setTimeout(4000);
socket.on('connect', () => { socket.end(); process.exit(0); });
socket.on('timeout', () => { socket.destroy(); process.exit(1); });
socket.on('error', () => process.exit(1));
"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max" ]; then
    echo "PostgreSQL did not become ready in time." >&2
    exit 1
  fi
  sleep 2
done

echo "PostgreSQL is ready."
