import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Baca .env secara manual
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
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Gagal: VITE_SUPABASE_URL atau Key tidak ditemukan di .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fungsi sederhana untuk generate ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const DUMMY_STORES = [
  {
    name: 'Kopi Susu Senja',
    slug: 'kopi-senja',
    description: 'Kopi susu gula aren terbaik di kota.',
    wa_number: '6281234567890',
    theme_color: '#f59e0b',
  },
  {
    name: 'Warung Bu Sri',
    slug: 'warung-bu-sri',
    description: 'Masakan Padang asli, pedas dan nikmat.',
    wa_number: '6289876543210',
    theme_color: '#ef4444',
  }
];

const DUMMY_PRODUCTS = [
  { name: 'Kopi Gula Aren', price: 25000, category: 'Minuman' },
  { name: 'Roti Bakar Coklat', price: 15000, category: 'Makanan' },
  { name: 'Es Teh Manis', price: 5000, category: 'Minuman' },
  { name: 'Nasi Rendang', price: 35000, category: 'Makanan Utama' },
  { name: 'Ayam Pop', price: 20000, category: 'Lauk' }
];

async function seedData() {
  console.log('🌱 Memulai proses seeding data dummy ke Supabase...');

  // Kita asumsikan tabel 'stores' dan 'products' sudah dibuat sesuai PLANNING.md
  for (const store of DUMMY_STORES) {
    const storeId = generateUUID();
    
    console.log(`\nMemasukkan Toko: ${store.name}`);
    
    // Perhatikan: Insert ini mungkin gagal jika RLS Supabase memblokirnya (terutama jika pakai ANON_KEY)
    // Untuk seeding di local/development, gunakan SERVICE_ROLE_KEY
    const { error: storeError } = await supabase
      .from('stores')
      .insert({
        id: storeId,
        owner_id: '00000000-0000-0000-0000-000000000000', // Ini harus diganti dengan ID user auth yang valid jika RLS ketat
        name: store.name,
        slug: store.slug,
        description: store.description,
        wa_number: store.wa_number,
        theme_color: store.theme_color
      });

    if (storeError) {
      console.error(`❌ Gagal menambahkan toko ${store.name}: ${storeError.message}`);
      console.log(`ℹ️  Tips: Jika error RLS, pastikan Anda menggunakan SUPABASE_SERVICE_ROLE_KEY di .env atau menonaktifkan RLS sementara.`);
      continue; // Lewati insert produk jika toko gagal
    }

    console.log(`✅ Toko ${store.name} berhasil ditambahkan.`);

    // Tambahkan 3 produk acak untuk toko ini
    for (let i = 0; i < 3; i++) {
      const randomProduct = DUMMY_PRODUCTS[Math.floor(Math.random() * DUMMY_PRODUCTS.length)];
      
      const { error: prodError } = await supabase
        .from('products')
        .insert({
          store_id: storeId,
          name: `${randomProduct.name} - ${store.name.split(' ')[0]}`,
          price: randomProduct.price,
          category: randomProduct.category
        });

      if (prodError) {
        console.error(`  ❌ Gagal menambahkan produk: ${prodError.message}`);
      } else {
        console.log(`  ✅ Produk ditambahkan: ${randomProduct.name}`);
      }
    }
  }
  
  console.log('\n🎉 Proses seeding selesai!');
}

seedData();
