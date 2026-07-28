#!/usr/bin/env bash
# ============================================
# OnePost AI — Pre-Deploy Health Check
# ============================================
# Verifies all required environment variables are set before deployment.
# Run: bash scripts/health-check.sh
# Exit code 0 = all good, 1 = missing vars found
# ============================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check_required() {
  local var_name="$1"
  local description="$2"
  if [ -z "${!var_name:-}" ]; then
    echo -e "  ${RED}✗ MISSING${NC}  ${var_name} — ${description}"
    ERRORS=$((ERRORS + 1))
  else
    local masked="${!var_name:0:6}****"
    echo -e "  ${GREEN}✓${NC}         ${var_name}=${masked}"
  fi
}

check_optional() {
  local var_name="$1"
  local description="$2"
  if [ -z "${!var_name:-}" ]; then
    echo -e "  ${YELLOW}○ OPT${NC}     ${var_name} — ${description} (not set)"
    WARNINGS=$((WARNINGS + 1))
  else
    local masked="${!var_name:0:6}****"
    echo -e "  ${GREEN}✓${NC}         ${var_name}=${masked}"
  fi
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       OnePost AI — Pre-Deploy Health Check          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# --- CRITICAL: Server / Environment ---
echo -e "${CYAN}[ Server / Environment ]${NC}"
check_required "NODE_ENV"           "Must be 'production' for live deployments"
check_optional "PORT"               "API port (defaults to 3001)"

echo ""

# --- CRITICAL: AI Generation ---
echo -e "${CYAN}[ AI Content Generation ]${NC}"
check_required "OPENAI_API_KEY"     "GPT-4o API key for scripts, captions, hashtags"

echo ""

# --- CRITICAL: Payments ---
echo -e "${CYAN}[ Payments (Stripe) ]${NC}"
check_required "STRIPE_SECRET_KEY"        "Stripe live secret key"
check_required "STRIPE_PUBLISHABLE_KEY"   "Stripe live publishable key"
check_optional "STRIPE_WEBHOOK_SECRET"    "Stripe webhook signing secret"

echo ""

# --- Social Media: Required for publishing ---
echo -e "${CYAN}[ Social Media — Publishing ]${NC}"
check_optional "INSTAGRAM_ACCESS_TOKEN"   "Instagram/Facebook Graph API access token"
check_optional "TIKTOK_ACCESS_TOKEN"      "TikTok access token"
check_optional "YOUTUBE_API_KEY"          "YouTube Data API v3 key"
check_optional "LINKEDIN_ACCESS_TOKEN"    "LinkedIn API access token"
check_optional "PINTEREST_ACCESS_TOKEN"   "Pinterest API access token"
check_optional "SNAPCHAT_CLIENT_ID"       "Snapchat marketing API client ID"

echo ""

# --- E-commerce ---
echo -e "${CYAN}[ E-commerce (Shopify) ]${NC}"
check_optional "SHOPIFY_API_KEY"          "Shopify admin API key"
check_optional "SHOPIFY_API_SECRET"       "Shopify admin API secret"

echo ""

# --- AI Media Generation ---
echo -e "${CYAN}[ AI Media Generation (Optional) ]${NC}"
check_optional "HEYGEN_API_KEY"           "HeyGen AI avatar video"
check_optional "SYNTHESIA_API_KEY"        "Synthesia AI video"
check_optional "STABILITY_API_KEY"        "Stability AI image generation"

echo ""

# --- Frontend ---
echo -e "${CYAN}[ Frontend (Next.js Public) ]${NC}"
check_optional "NEXT_PUBLIC_APP_URL"             "Public app URL"
check_optional "NEXT_PUBLIC_API_URL"             "Public API URL"
check_optional "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Public Stripe key"

echo ""

# --- Monitoring ---
echo -e "${CYAN}[ Monitoring (Optional) ]${NC}"
check_optional "SENTRY_DSN"              "Sentry error monitoring DSN"

echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"

# --- Summary ---
if [ $ERRORS -gt 0 ]; then
  echo ""
  echo -e "  ${RED}✗ HEALTH CHECK FAILED${NC} — ${ERRORS} required variable(s) missing"
  echo ""
  echo "  To fix:"
  echo "    1. Copy .env.example to .env:  cp .env.example .env"
  echo "    2. Fill in the required values"
  echo "    3. Load the env:  source .env  (or use your deployment platform's env config)"
  echo "    4. Re-run this check:  bash scripts/health-check.sh"
  echo ""
  exit 1
fi

if [ $WARNINGS -gt 0 ]; then
  echo ""
  echo -e "  ${YELLOW}⚠ HEALTH CHECK PASSED${NC} — with ${WARNINGS} optional variable(s) not set"
  echo ""
  echo "  Optional vars can be added later. Core functionality is ready."
  echo ""
else
  echo ""
  echo -e "  ${GREEN}✓ HEALTH CHECK PASSED${NC} — all variables configured"
  echo ""
fi
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo ""
