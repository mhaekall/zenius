import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.resolve(__dirname, '../src/pages');
const publicDir = path.resolve(__dirname, '../public');
const outputFile = path.join(publicDir, 'route-meta.json');

// Fungsi rekursif untuk mencari semua file .tsx di folder src/pages
function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = scanDirectory(pagesDir);
const metaData = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  // Mencari anotasi khusus seperti: // @meta title="Home" description="Welcome"
  const metaMatch = content.match(/\/\/\s*@meta\s+(.+)/);
  if (metaMatch) {
    const metaString = metaMatch[1];
    const metaInfo = {};
    
    // Mengekstrak pasangan key="value"
    const regex = /(\w+)="([^"]+)"/g;
    let match;
    while ((match = regex.exec(metaString)) !== null) {
      metaInfo[match[1]] = match[2];
    }
    
    // Membuat route path dari lokasi file (contoh: src/pages/Landing.tsx -> /Landing)
    let routePath = file.replace(pagesDir, '').replace('.tsx', '').replace(/\\/g, '/');
    if (routePath.endsWith('/index')) routePath = routePath.replace('/index', '');
    if (routePath === '/Landing' || routePath === '') routePath = '/';
    
    metaData[routePath] = metaInfo;
  }
});

// Pastikan folder public ada
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(metaData, null, 2));
console.log(`✅ [Automasi Meta] Berhasil mengekstrak ${Object.keys(metaData).length} rute meta data ke ${outputFile}`);
console.log(`ℹ️  File ini bisa dimuat secara dinamis atau digunakan oleh Edge Function untuk SEO WhatsApp.`);
