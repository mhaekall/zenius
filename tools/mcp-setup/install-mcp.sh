#!/bin/bash
# tools/mcp-setup/install-mcp.sh
# Skrip ini memandu instalasi 3 The Vanguard MCP untuk Vibe Coding Pipeline.

echo "🚀 Memulai Setup 'The Vanguard' MCP (Maret 2026)"
echo "Pastikan Anda memiliki Node.js dan pnpm terinstal."
echo "---------------------------------------------------"

# 1. EXA SEARCH MCP (Untuk Riset Tren)
echo "🔍 1. Menyiapkan Exa Search MCP..."
echo "  [Aksi Anda]: Dapatkan EXA_API_KEY dari https://exa.ai/api"
echo "  Untuk menjalankan lokal (via Cursor/Claude):"
echo "  npx -y @exa/mcp-server --api-key YOUR_EXA_API_KEY"
echo ""

# 2. FIRECRAWL MCP (Untuk Ekstraksi UI & Web)
echo "🕷️ 2. Menyiapkan Firecrawl MCP..."
echo "  [Aksi Anda]: Dapatkan FIRECRAWL_API_KEY dari https://firecrawl.dev"
echo "  Untuk menjalankan lokal:"
echo "  npx -y @mendable/firecrawl-mcp-server --api-key YOUR_FIRECRAWL_KEY"
echo ""

# 3. COMPOSIO MCP (Meta-Server untuk Notion & Slack)
echo "🔗 3. Menyiapkan Composio Meta-MCP..."
echo "  Composio memerlukan login untuk mengotorisasi aplikasi (OAuth)."
echo "  Langkah 1: Instal CLI Composio"
echo "  pnpm add -g composio-core"
echo "  Langkah 2: Login"
echo "  composio login"
echo "  Langkah 3: Tambahkan integrasi Notion dan Slack"
echo "  composio add notion"
echo "  composio add slack"
echo "  Langkah 4: Jalankan MCP Server"
echo "  composio serve mcp"
echo "---------------------------------------------------"
echo "✅ Setup Guide selesai. Gunakan VANGUARD_PROMPTS.md setelah server berjalan!"
