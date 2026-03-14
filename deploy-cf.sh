#!/bin/bash
# AI PRODUCTIVITY HACKER: DIRECT DEPLOY SCRIPT
set -e

# 1. Load Credentials
source .env.cloudflare
PROJECT_NAME="openmenu"

echo "🚀 Starting Deployment for $PROJECT_NAME..."

# 2. Extract Meta (seperti di package.json)
echo "📦 Running prebuild (extract-meta)..."
node scripts/extract-meta.js

# 3. Build with pnpm
echo "🛠️  Building project with pnpm..."
pnpm build

# 4. Patch workerd (Android arm64 bypass)
echo "🔧 Patching workerd for Termux..."
sed -i 's/function generateBinPath() {/function generateBinPath() { return __filename;/g' node_modules/.pnpm/workerd@*/node_modules/workerd/lib/main.js 2>/dev/null || true

# 5. Upload to Cloudflare Pages via Wrangler
echo "📤 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name $PROJECT_NAME --branch local-workspace

echo -e "\n✅ Deployment Complete! Check: https://$PROJECT_NAME.pages.dev"
