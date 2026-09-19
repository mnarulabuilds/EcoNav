#!/usr/bin/env bash
# Guided go-live: Docker production → www.cityconnect.in
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}CityConnect → https://www.cityconnect.in${NC} (Docker)"
echo ""
echo -e "Full guide: ${CYAN}GO-LIVE.md${NC} and ${CYAN}DEPLOY.md${NC}"
echo ""
echo "  1. npm run setup:deploy     # creates .env.production"
echo "  2. Edit ACME_EMAIL + verify CORS_ORIGINS / domains"
echo "  3. DNS A records → your VPS: www, @, api"
echo "  4. npm run deploy           # on server or via DEPLOY_SSH"
echo ""
echo -e "${GREEN}CORS (required in .env.production):${NC}"
echo "  CORS_ORIGINS=https://www.cityconnect.in,https://cityconnect.in"
echo "  NEXT_PUBLIC_API_URL=https://api.cityconnect.in"
echo ""

if command -v open >/dev/null 2>&1; then
  read -r -p "Open DEPLOY.md in default editor? [y/N] " ans
  if [[ "${ans}" =~ ^[Yy]$ ]]; then
    open "DEPLOY.md" 2>/dev/null || true
  fi
fi
