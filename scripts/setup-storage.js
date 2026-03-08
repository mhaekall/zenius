import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Baca .env secara manual tanpa library tambahan
const envPath = path.resolve(__dirname, '../.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
    }
  });
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
// Service Role Key diperlukan untuk bypass RLS dan membuat bucket via API
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.log("⚠️  Peringatan: VITE_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di file .env.");
  console.log("👉 Melanjutkan dengan membuat file migrasi SQL lokal saja...");
}

// 2. Generate file Migrasi SQL (Otomatis)
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const sqlContent = `
-- ==============================================
-- 1. SETUP STORAGE BUCKETS
-- ==============================================
-- Membuat bucket public 'store-assets' jika belum ada
insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- ==============================================
-- 2. SETUP CORS POLICIES (WAJIB UNTUK HTML-TO-IMAGE)
-- ==============================================
-- Supabase secara default memblokir canvas rendering (html-to-image) dari origin luar.
-- Kita harus mengatur allowed_origins ke '*', atau domain spesifik aplikasi kita.

update storage.buckets
set allowed_origins = array['*']::text[],
    allowed_methods = array['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']::text[]
where id in ('store-assets', 'products');

-- ==============================================
-- 3. SETUP BUCKET POLICIES (R/W Access)
-- ==============================================
-- Publik boleh membaca gambar
create policy "Public Access"
on storage.objects for select
using ( bucket_id in ('store-assets', 'products') );

-- User terautentikasi boleh upload/hapus gambar
create policy "Authenticated Users Access"
on storage.objects for all
using ( auth.role() = 'authenticated' );
`;

const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
const sqlFile = path.join(migrationsDir, `${timestamp}_setup_storage_cors.sql`);

fs.writeFileSync(sqlFile, sqlContent);
console.log(`✅ [Automasi Storage] Berhasil meng-generate file migrasi SQL:`);
console.log(`👉 ${sqlFile}`);
console.log(`\n💡 Cara Eksekusi SQL:`);
console.log(`Opsi 1: Jalankan perintah 'npx supabase db push' jika Anda punya Supabase CLI.`);
console.log(`Opsi 2: Buka Supabase Dashboard > SQL Editor > Copy-Paste isi file tersebut dan jalankan.\n`);

// 3. Eksekusi Pembuatan Bucket via API JS (Jika Key Valid)
if (supabaseUrl && supabaseKey && supabaseKey.startsWith('eyJ')) {
  console.log(`🚀 Mencoba mengonfigurasi bucket via Supabase API secara langsung...`);
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function createBuckets() {
    const buckets = ['store-assets', 'products'];
    for (const b of buckets) {
      const { data, error } = await supabase.storage.createBucket(b, { public: true });
      if (error && error.message.includes('already exists')) {
        console.log(`ℹ️  Bucket '${b}' sudah ada.`);
      } else if (error) {
        console.log(`❌ Gagal membuat bucket '${b}': ${error.message}`);
      } else {
        console.log(`✅ Bucket '${b}' berhasil dibuat.`);
      }
    }
    console.log(`⚠️  Catatan: Pengaturan CORS (agar QR Download berfungsi) tetap HARUS dijalankan via SQL Migration yang dibuat tadi.`);
  }
  
  createBuckets();
}
