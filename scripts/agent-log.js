import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.resolve(__dirname, '../.agent_history.md');
const args = process.argv.slice(2);
const message = args.join(' ');

if (!message) {
  console.log('⚠️  Gunakan: pnpm log "Pesan atau ringkasan aktivitas"');
  process.exit(1);
}

const timestamp = new Date().toLocaleString('id-ID');
const logEntry = `\n### 🗓️ [${timestamp}]\n- ${message}\n---\n`;

fs.appendFileSync(logFile, logEntry);

console.log(`✅ Aktivitas berhasil dicatat di ${logFile}`);
