#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}CityConnect → https://www.cityconnect.in${NC}"
echo ""
echo -e "Full plan: ${CYAN}PRODUCTION.md${NC}"
echo ""
echo "  1. npm run setup:deploy       # .env.production"
echo "  2. DNS A records → VPS: www, @, api"
echo "  3. npm run deploy:live        # Docker + CORS verify"
echo ""
echo "Quick verify after deploy: npm run verify:live"
echo ""
