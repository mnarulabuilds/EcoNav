#!/usr/bin/env bash
# Railway CLI auth helpers for deploy scripts
configure_railway_auth() {
  if [[ -n "${RAILWAY_TOKEN:-}" && -n "${RAILWAY_API_TOKEN:-}" ]]; then
    warn "Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set — using RAILWAY_TOKEN for deploy"
    unset RAILWAY_API_TOKEN
  fi

  if [[ -z "${RAILWAY_TOKEN:-}" && -z "${RAILWAY_API_TOKEN:-}" ]]; then
    error "Missing Railway token in .env.deploy"
    echo ""
    echo "  For deploys, create a Project Token:"
    echo "    Railway dashboard → your project → Settings → Tokens"
    echo "    Add to .env.deploy as RAILWAY_TOKEN=..."
    echo ""
    echo "  For first-time setup (linking), use an Account Token:"
    echo "    https://railway.com/account/tokens"
    echo "    Add to .env.deploy as RAILWAY_API_TOKEN=..."
    exit 1
  fi

  if [[ -n "${RAILWAY_TOKEN:-}" ]]; then
    export RAILWAY_TOKEN
  else
    export RAILWAY_API_TOKEN
    if [[ -z "${RAILWAY_PROJECT_ID:-}" && ! -f .railway/config.json ]]; then
      error "Account token requires RAILWAY_PROJECT_ID in .env.deploy, or run: npm run setup:deploy"
      exit 1
    fi
  fi
}

railway_project_args() {
  if [[ -n "${RAILWAY_PROJECT_ID:-}" ]]; then
    echo "--project" "$RAILWAY_PROJECT_ID"
  fi
}
