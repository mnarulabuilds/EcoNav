#!/usr/bin/env bash
# Opens Railway setup for EcoNav — minimal steps to go live
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

REPO="mnarulabuilds/EcoNav"
RAILWAY_URL="https://railway.com/new/github?repo=${REPO}"

echo ""
echo -e "${BOLD}EcoNav → www.econav.in${NC}"
echo ""
echo -e "${CYAN}Your repo:${NC} https://github.com/${REPO}"
echo ""

echo -e "${BOLD}STEP 1 — Connect Railway to GitHub (2 minutes)${NC}"
echo ""
echo "  Opening Railway in your browser..."
echo "  URL: ${RAILWAY_URL}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "$RAILWAY_URL" 2>/dev/null || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$RAILWAY_URL" 2>/dev/null || true
fi

echo "  In Railway:"
echo "    1. Click ${BOLD}Deploy Now${NC} (or Configure GitHub → select EcoNav)"
echo "    2. Rename the service to: ${BOLD}econav-api${NC}"
echo "    3. Settings → Config file → set: ${BOLD}railway.api.json${NC}"
echo "    4. Variables → Raw Editor → paste:"
echo ""
echo -e "${YELLOW}NODE_ENV=production"
echo "API_HOST=0.0.0.0"
echo -e "CORS_ORIGINS=https://www.econav.in,https://econav.in${NC}"
echo ""
read -r -p "  Press ENTER when econav-api is deployed (green checkmark)..."

echo ""
echo -e "${BOLD}STEP 2 — Add Web service (2 minutes)${NC}"
echo ""
echo "  In the same Railway project:"
echo "    1. Click ${BOLD}+ Create${NC} → ${BOLD}GitHub Repo${NC} → EcoNav"
echo "    2. Rename service to: ${BOLD}econav-web${NC}"
echo "    3. Settings → Config file → set: ${BOLD}railway.web.json${NC}"
echo "    4. Variables → Raw Editor → paste:"
echo ""
echo -e "${YELLOW}NODE_ENV=production"
echo "NEXT_PUBLIC_API_URL=https://api.econav.in"
echo -e "NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png${NC}"
echo ""
read -r -p "  Press ENTER when econav-web is deployed..."

echo ""
echo -e "${BOLD}STEP 3 — Custom domains${NC}"
echo ""
echo "  econav-api → Networking → add: ${BOLD}api.econav.in${NC}"
echo "  econav-web → Networking → add: ${BOLD}www.econav.in${NC}"
echo ""
echo "  Copy the CNAME targets Railway shows you."
echo ""
read -r -p "  Press ENTER when domains are added in Railway..."

echo ""
echo -e "${BOLD}STEP 4 — DNS (at your domain registrar)${NC}"
echo ""
echo "  Add these DNS records for econav.in:"
echo ""
echo "    api   CNAME   → (from Railway econav-api Networking tab)"
echo "    www   CNAME   → (from Railway econav-web Networking tab)"
echo ""
echo -e "${YELLOW}Note: DNS for econav.in is not configured yet.${NC}"
echo "  Until DNS propagates, use the *.up.railway.app URLs Railway gives you."
echo ""
read -r -p "  Press ENTER when DNS records are saved..."

echo ""
echo -e "${GREEN}▸ Testing...${NC}"
echo ""

if curl -sf --max-time 10 "https://api.econav.in/api/health" >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} API live at https://api.econav.in"
else
  echo -e "  ${YELLOW}!${NC} api.econav.in not reachable yet (DNS may still be propagating)"
  echo "    Try the Railway *.up.railway.app URL from the Networking tab"
fi

if curl -sf --max-time 10 "https://www.econav.in" >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} Web live at https://www.econav.in"
else
  echo -e "  ${YELLOW}!${NC} www.econav.in not reachable yet (DNS may still be propagating)"
fi

echo ""
echo -e "${BOLD}Done!${NC} Open https://www.econav.in and click Plan Optimal Routes."
echo ""
