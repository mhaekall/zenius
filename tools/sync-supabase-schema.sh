#!/bin/bash
# tools/sync-supabase-schema.sh

# Resolve environment file based on script location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

source "$ENV_FILE"

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing."
    exit 1
fi

echo "🔄 Extracting Supabase schema using Service Role Key..."

# Fetch OpenAPI spec directly to a temporary file
curl -s "$VITE_SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" > .supabase-schema-raw.json

# Parse the JSON and format it into a clean Markdown file using Node.js
node -e "
const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('.supabase-schema-raw.json', 'utf8'));
    let md = '# 🗄️ Supabase Database Schema\\n\\n';
    md += '> *Auto-generated using Service Role Key.*\\n\\n';
    
    if (data.definitions) {
        for (const [tableName, schema] of Object.entries(data.definitions)) {
            md += '## 📋 Table: \`' + tableName + '\`\\n\\n';
            if (schema.properties) {
                md += '| Column Name | Data Type | Default Value | Notes |\\n';
                md += '|---|---|---|---|\\n';
                for (const [colName, colData] of Object.entries(schema.properties)) {
                    let type = colData.format || colData.type || 'any';
                    let def = colData.default ? String(colData.default).replace(/\\|/g, '&#124;') : '-';
                    let desc = colData.description ? colData.description.replace(/\\n/g, ' ').replace(/\\|/g, '&#124;') : '';
                    
                    // Simple styling
                    if (desc.includes('Primary Key')) desc = '🔑 **PK**';
                    if (desc.includes('Foreign Key')) {
                        const match = desc.match(/table=\\'(.+?)\\'/);
                        desc = match ? '🔗 **FK** to \`' + match[1] + '\`' : '🔗 **FK**';
                    }
                    
                    md += '| \`' + colName + '\` | ' + type + ' | \`' + def + '\` | ' + desc + ' |\\n';
                }
            }
            md += '\\n';
        }
    } else {
        md += 'No tables found or error reading schema.\\n';
    }
    
    const outPath = fs.existsSync('docs') ? 'docs/DB_SCHEMA.md' : '../docs/DB_SCHEMA.md';
    fs.writeFileSync(outPath, md);
    console.log('✅ Schema successfully written to ' + outPath);
    
    // Cleanup temporary file
    fs.unlinkSync('.supabase-schema-raw.json');
} catch (e) {
    console.error('❌ Error parsing schema: ', e.message);
}
"