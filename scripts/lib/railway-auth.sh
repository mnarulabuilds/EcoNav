#!/usr/bin/env bash
# Railway CLI auth helpers for deploy scripts

trim_token() {
  # shellcheck disable=SC2001
  echo "$1" | sed 's/^[[:space:]"'\'''"'"']*//;s/[[:space:]"'\'''"'"']*$//'
}

# Use project token only — required for `railway up` in deploy
configure_railway_deploy() {
  RAILWAY_TOKEN=$(trim_token "${RAILWAY_TOKEN:-}")

  if [[ -n "${RAILWAY_TOKEN:-}" && -n "${RAILWAY_API_TOKEN:-}" ]]; then
    warn "Both Railway tokens set — using RAILWAY_TOKEN (project token) for deploy"
  fi

  unset RAILWAY_API_TOKEN

  if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
    error "Missing RAILWAY_TOKEN in .env.deploy"
    echo ""
    echo "  Create a Project Token:"
    echo "    Railway dashboard → Project → Settings → Tokens"
    exit 1
  fi

  export RAILWAY_TOKEN

  if [[ -z "${RAILWAY_PROJECT_ID:-}" && ! -f .railway/config.json ]]; then
    error "Missing RAILWAY_PROJECT_ID in .env.deploy"
    echo ""
    echo "  Find it at: Railway → Project → Settings → General → Project ID"
    exit 1
  fi
}

# Setup can use project token + project ID (recommended) or account token to link/create
configure_railway_setup() {
  RAILWAY_TOKEN=$(trim_token "${RAILWAY_TOKEN:-}")
  RAILWAY_API_TOKEN=$(trim_token "${RAILWAY_API_TOKEN:-}")
  RAILWAY_PROJECT_ID=$(trim_token "${RAILWAY_PROJECT_ID:-}")

  export RAILWAY_PROJECT_ID

  # Prefer project token + project ID — no init/link needed
  if [[ -n "${RAILWAY_TOKEN:-}" && -n "${RAILWAY_PROJECT_ID:-}" ]]; then
    unset RAILWAY_API_TOKEN
    export RAILWAY_TOKEN
    SETUP_MODE="project"
    return 0
  fi

  # Account token can link or create projects
  if [[ -n "${RAILWAY_API_TOKEN:-}" ]]; then
    unset RAILWAY_TOKEN
    export RAILWAY_API_TOKEN
    SETUP_MODE="account"
    return 0
  fi

  error "Railway credentials incomplete in .env.deploy"
  echo ""
  echo "  Recommended (easiest):"
  echo "    RAILWAY_TOKEN=<project token from Project → Settings → Tokens>"
  echo "    RAILWAY_PROJECT_ID=<from Project → Settings → General>"
  echo ""
  echo "  Alternative:"
  echo "    RAILWAY_API_TOKEN=<from https://railway.com/account/tokens>"
  exit 1
}

railway_project_args() {
  local args=()
  if [[ -n "${RAILWAY_PROJECT_ID:-}" ]]; then
    args+=("--project" "$RAILWAY_PROJECT_ID")
    # CLI v5 requires --environment when --project is set
    if [[ -n "${RAILWAY_ENVIRONMENT_ID:-}" ]]; then
      args+=("--environment" "$RAILWAY_ENVIRONMENT_ID")
    else
      args+=("--environment" "${RAILWAY_ENVIRONMENT:-production}")
    fi
  fi
  echo "${args[@]}"
}
