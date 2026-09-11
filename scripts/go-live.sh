#!/usr/bin/env bash
# Guided setup: Railway (API) + Vercel (Web) → www.econav.in
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

REPO="mnarulabuilds/EcoNav"
RAILWAY_URL="https://railway.com/new/github?repo=${REPO}"
VERCEL_URL="https://vercel.com/new"

echo ""
echo -e "${BOLD}EcoNav → www.econav.in${NC} (fresh setup)"
echo ""
echo -e "Full guide: ${CYAN}GO-LIVE.md${NC}"
echo ""

# ── Part A: Railway API ───────────────────────────────────────────────────────
echo -e "${BOLD}PART A — API on Railway${NC}"
echo ""
echo "  Opening: ${RAILWAY_URL}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "$RAILWAY_URL" 2>/dev/null || true
fi

echo "  1. Click Deploy Now"
echo "  2. Settings → name: econav-api"
echo "  3. Settings → Config file: railway.api.json"
echo "  4. Variables → paste:"
echo ""
echo -e "${YELLOW}NODE_ENV=production"
echo "API_HOST=0.0.0.0"
echo -e "CORS_ORIGINS=https://www.econav.in,https://econav.in${NC}"
echo ""
echo "  5. Networking → Generate Domain"
echo "  6. Test: curl https://YOUR-URL.up.railway.app/api/health"
echo ""
read -r -p "  Paste your Railway API URL (or press Enter to skip): " RAILWAY_API_URL

if [[ -z "${RAILWAY_API_URL}" ]]; then
  RAILWAY_API_URL="https://api.econav.in"
  echo "  Using default: ${RAILWAY_API_URL}"
fi

# ── Part B: Vercel Web ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}PART B — Website on Vercel${NC}"
echo ""
echo "  Opening: ${VERCEL_URL}"
echo ""

if command -v open >/dev/null 2>&1; then
  open "$VERCEL_URL" 2>/dev/null || true
fi

echo "  1. Import GitHub repo: EcoNav"
echo "  2. Root Directory: apps/web"
echo "  3. Environment variables:"
echo ""
echo -e "${YELLOW}NEXT_PUBLIC_API_URL=${RAILWAY_API_URL}"
echo -e "NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png${NC}"
echo ""
echo "  4. Deploy → then Settings → Domains → add www.econav.in"
echo ""
read -r -p "  Press ENTER when Vercel deploy is done..."

# ── Part C: DNS ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}PART C — DNS (domain registrar)${NC}"
echo ""
echo "  Add at your econav.in registrar:"
echo ""
echo "    api   CNAME   → Railway target (Networking tab)"
echo "    www   CNAME   → cname.vercel-dns.com"
echo "    @     A       → 76.76.21.21"
echo ""
read -r -p "  Press ENTER after saving DNS records..."

# ── Test ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Testing...${NC}"
echo ""

if curl -sf --max-time 10 "${RAILWAY_API_URL}/api/health" >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} API responds at ${RAILWAY_API_URL}"
else
  echo -e "  ${YELLOW}!${NC} API not reachable at ${RAILWAY_API_URL}"
fi

if curl -sf --max-time 10 "https://www.econav.in" >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} www.econav.in is live!"
else
  echo -e "  ${YELLOW}!${NC} www.econav.in not ready yet (DNS can take 30 min)"
  echo "    Use your *.vercel.app URL until DNS propagates"
fi

echo ""
echo -e "${BOLD}Done!${NC} See GO-LIVE.md if anything failed."
echo ""
