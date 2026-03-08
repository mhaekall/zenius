import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

async function check() {
  console.log('🔍 Menjalankan Health Check Proyek Zenius...\n');
  let hasError = false;

  // 1. Cek File .env
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ File .env ditemukan.');
    const content = fs.readFileSync(envPath, 'utf-8');
    if (!content.includes('VITE_SUPABASE_URL') || !content.includes('VITE_SUPABASE_ANON_KEY')) {
      console.log('❌ Error: Variabel Supabase (URL/KEY) hilang di .env');
      hasError = true;
    }
  } else {
    console.log('❌ Error: File .env tidak ditemukan!');
    hasError = true;
  }

  // 2. Cek Node Modules & pnpm
  if (fs.existsSync(path.join(rootDir, 'node_modules'))) {
    console.log('✅ Folder node_modules tersedia.');
  } else {
    console.log('❌ Error: node_modules hilang! Jalankan "pnpm install".');
    hasError = true;
  }

  if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) {
    console.log('✅ Lockfile pnpm ditemukan (Konsistensi Terjaga).');
  } else {
    console.log('⚠️  Peringatan: pnpm-lock.yaml tidak ditemukan. Pastikan pakai pnpm!');
  }

  // 3. Cek Koneksi Supabase (Ping Test)
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\s]+)/);
  if (urlMatch) {
    const url = urlMatch[1].replace(/['"]/g, '');
    console.log(`🌐 Mengetes koneksi ke Supabase: ${url}...`);
    
    try {
      await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            console.log('✅ Koneksi ke Supabase API lancar!');
            resolve();
          } else {
            reject(new Error(`Status Code: ${res.statusCode}`));
          }
        }).on('error', reject);
      });
    } catch (err) {
      console.log(`❌ Gagal terhubung ke Supabase: ${err.message}`);
      hasError = true;
    }
  }

  console.log('\n--- Hasil Akhir ---');
  if (hasError) {
    console.log('🚩 Proyek bermasalah. Perbaiki error di atas sebelum lanjut coding!');
    process.exit(1);
  } else {
    console.log('🚀 Proyek SEHAT dan siap tempur!');
  }
}

check();
