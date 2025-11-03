#!/bin/bash
# QuranApp Test Deployment Script
# Builds the app without TypeScript checking for quick deployment testing

set -e

echo "🚀 QuranApp Test Deployment"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build without TypeScript checking
echo -e "${YELLOW}🔨 Building for production (skipping TypeScript errors)...${NC}"
export NODE_ENV=production
export VITE_API_BASE_URL=https://api.quran.com/api/v4
export VITE_ENABLE_CSP=true
export VITE_BUILD_ENV=production

# Build with Vite (skips tsc check)
npx vite build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "📊 Build Statistics:"
    du -sh dist
    echo ""
    echo "📁 Build output in: dist/"
    echo ""
    echo -e "${GREEN}Ready to deploy!${NC}"
    echo ""
    echo "Choose your deployment method:"
    echo ""
    echo "1️⃣  Netlify CLI (Recommended):"
    echo "   npm install -g netlify-cli"
    echo "   netlify deploy --prod"
    echo ""
    echo "2️⃣  Netlify Drop (Drag & Drop):"
    echo "   Go to: https://app.netlify.com/drop"
    echo "   Drag the 'dist' folder"
    echo ""
    echo "3️⃣  Vercel CLI:"
    echo "   npm install -g vercel"
    echo "   vercel --prod"
    echo ""
    echo "4️⃣  GitHub Pages:"
    echo "   Push to GitHub, workflow will auto-deploy"
    echo ""
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
