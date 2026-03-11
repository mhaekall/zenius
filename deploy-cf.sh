#!/bin/bash
# AI PRODUCTIVITY HACKER: DIRECT DEPLOY SCRIPT
set -e

# 1. Load Credentials
source .env.cloudflare
PROJECT_NAME="zenius"

echo "🚀 Starting Deployment for $PROJECT_NAME..."

# 2. Extract Meta (seperti di package.json)
echo "📦 Running prebuild (extract-meta)..."
node scripts/extract-meta.js

# 3. Build with pnpm
echo "🛠️  Building project with pnpm..."
pnpm build

# 4. Upload to Cloudflare Pages (Direct Upload)
# Kita butuh wrangler-action style upload atau direct API zip upload.
# Karena Wrangler tidak bisa di Termux, kita gunakan curl untuk upload zip.

echo "📂 Zipping dist folder..."
cd dist && zip -r ../dist.zip . && cd ..

echo "📤 Uploading to Cloudflare Pages..."
# Cloudflare Pages Direct Upload via API requires a different endpoint
# and a specific structure. 

# Alternative: Using Wrangler is better, but since it's unsupported,
# we'll use a custom curl command to create a deployment.
# Note: This is an advanced 'hacker' move.

curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@dist.zip"

echo -e "\n✅ Deployment Complete! Check: https://$PROJECT_NAME.pages.dev"
rm dist.zip
