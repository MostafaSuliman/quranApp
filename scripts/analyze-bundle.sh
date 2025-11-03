#!/bin/bash

# Bundle Analysis Script for QuranApp
# This script analyzes the production build and generates a report

set -e

echo "🔍 QuranApp Bundle Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build the project
echo -e "${BLUE}📦 Building production bundle...${NC}"
npx vite build

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""

# Analyze bundle sizes
echo -e "${BLUE}📊 Bundle Size Analysis:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd dist/assets

echo ""
echo "Vendor Chunks (cached separately):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh *vendor*.js | awk '{printf "  %-40s %8s\n", $9, $5}'

echo ""
echo "Page Group Chunks (lazy-loaded):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh *pages*.js | awk '{printf "  %-40s %8s\n", $9, $5}'

echo ""
echo "App Shell:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh index*.js | awk '{printf "  %-40s %8s\n", $9, $5}'

echo ""
echo "CSS Bundles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh *.css | awk '{printf "  %-40s %8s\n", $9, $5}'

cd ../..

echo ""
echo -e "${YELLOW}💡 Total Sizes:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
du -sh dist/assets | awk '{printf "  Total assets: %s\n", $1}'
du -sh dist | awk '{printf "  Total build:  %s\n", $1}'

echo ""
echo -e "${GREEN}✨ Analysis complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run preview' to test the build"
echo "  2. Open Chrome DevTools → Network tab"
echo "  3. Navigate between routes to see lazy loading"
echo "  4. Run Lighthouse audit for performance metrics"
echo ""
