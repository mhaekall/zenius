# 📋 Planning & Arsitektur: Katalog Digital QR untuk UMKM

> Dokumen perencanaan komprehensif untuk platform SaaS multi-tenant QR Code Digital Catalog.
> Dibuat: 7 Maret 2026 | Status: Draft MVP

---

## 📌 1. Identitas & Tujuan Sistem

**Katalog Digital QR** adalah platform SaaS multi-tenant yang memungkinkan UMKM (kafe, restoran, butik) membuat katalog digital berbasis QR Code tanpa keahlian teknis.

### Masalah yang Diselesaikan
- ❌ Biaya cetak ulang menu fisik yang mahal
- ❌ Keterbatasan teknis UMKM dalam membuat website
- ❌ Proses pemesanan yang tidak terstruktur

### Value Proposition
✅ **3 Langkah Simpel:** Daftar → Unggah Produk → Bagikan QR Code  
✅ **Tanpa App Download:** Pelanggan cukup scan QR → katalog terbuka di browser  
✅ **WhatsApp-First Payment:** Tidak perlu payment gateway kompleks di MVP  

---

## 🛠️ 2. Tech Stack yang Direkomendasikan

### A. Framework: Next.js 15 (App Router) ⭐ RECOMMENDED

> **Mengapa Next.js, bukan Vite React biasa?**
> Platform ini memiliki **halaman publik katalog** yang WAJIB terindeks Google (SEO).
> Next.js memiliki SSR/SSG built-in, API Routes, dan OG Image generation — semua dibutuhkan di sini.

```
Catatan: Project saat ini adalah Vite + React template. 
Untuk production, sangat direkomendasikan migrasi ke Next.js.
Atau tetap di Vite dengan tradeoff: halaman publik tidak bisa di-SSR (SEO kurang optimal).
```

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| **Framework** | Next.js 15 (App Router) | SSR/SSG untuk SEO, API Routes built-in |
| **Runtime** | Node.js / Vercel Edge | Deploy mudah di Vercel |
| **Language** | TypeScript 5.x | Type safety, DX lebih baik |

### B. Database, Auth & Storage

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| **Database** | Supabase (PostgreSQL) | Multi-tenant ready, RLS, real-time |
| **Auth** | BetterAuth.js + Supabase | Email/password + Google OAuth, session management |
| **Storage** | Supabase Storage | Simpan logo toko, foto produk, gambar QRIS |
| **ORM** | Drizzle ORM | Type-safe, ringan, cocok dengan Supabase |

### C. Frontend & UI

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| **Styling** | Tailwind CSS v4 | Utility-first, performa optimal |
| **UI Components** | Shadcn/UI | Copy-paste components, fully customizable |
| **Animation** | Framer Motion | Micro-interactions, page transitions |
| **State (Client)** | Zustand | Cart management, lightweight |
| **Forms** | React Hook Form + Zod | Validasi tipe-aman |
| **Icons** | Lucide React | Konsisten, ringan |
| **QR Generation** | `react-qr-code` | Generate QR dari URL toko |
| **Image Optimization** | Next.js Image | Otomatis WebP, lazy loading |

### D. Tools Pendukung

| Tool | Fungsi |
|------|--------|
| `qrcode` atau `react-qr-code` | Generate QR Code untuk setiap toko |
| `html-to-image` atau `jspdf` | Download QR Code sebagai PNG/PDF |
| `dayjs` | Format tanggal/waktu |
| `nprogress` | Loading bar navigasi |

---

## 🗄️ 3. Arsitektur Database (MVP - Sederhana)

### Schema Utama

```sql
-- ====================================
-- 1. TABLE: stores (Multi-tenant core)
-- ====================================
CREATE TABLE stores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug         TEXT UNIQUE NOT NULL,           -- URL: /[slug] → toko.com/kopisusu
  name         TEXT NOT NULL,
  description  TEXT,
  logo_url     TEXT,                           -- Supabase Storage URL
  qris_url     TEXT,                           -- Gambar QRIS milik pemilik toko
  wa_number    TEXT NOT NULL,                  -- Format: 628xxxxxxxxx
  is_active    BOOLEAN DEFAULT true,
  theme_color  TEXT DEFAULT '#6366f1',         -- Warna aksen katalog publik
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 2. TABLE: products
-- ====================================
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        DECIMAL(12, 0) NOT NULL,        -- Rupiah, tanpa desimal
  image_url    TEXT,
  category     TEXT DEFAULT 'Lainnya',
  is_available BOOLEAN DEFAULT true,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 3. TABLE: analytics_events (MVP Analytics)
-- ====================================
CREATE TABLE analytics_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL,                  -- 'page_view', 'product_view', 'wa_click'
  product_id   UUID REFERENCES products(id),   -- Nullable
  referrer     TEXT,                            -- Dari mana traffic datang
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Store owners hanya bisa akses data toko mereka sendiri
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage own store" ON stores
  FOR ALL USING (auth.uid() = owner_id);

-- Publik bisa baca toko yang aktif
CREATE POLICY "Public can read active stores" ON stores
  FOR SELECT USING (is_active = true);

-- Sama untuk products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage own products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  );
CREATE POLICY "Public can read available products" ON products
  FOR SELECT USING (
    is_available = true AND
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.is_active = true)
  );
```

### Supabase Storage Buckets

```
bucket: store-assets/
├── logos/          → {store_id}/logo.{ext}
├── products/       → {store_id}/{product_id}.{ext}
└── qris/           → {store_id}/qris.{ext}
```

---

## 🏗️ 4. Struktur Aplikasi & Routing

### Route Map

```
app/
├── (marketing)/                    # Landing page grup
│   ├── page.tsx                    # / → Landing Page
│   ├── login/page.tsx              # /login
│   └── register/page.tsx           # /register
│
├── (dashboard)/                    # Admin area (protected)
│   ├── layout.tsx                  # Auth guard + sidebar layout
│   ├── dashboard/
│   │   ├── page.tsx                # /dashboard → Overview (Bento Grid)
│   │   ├── products/page.tsx       # /dashboard/products → CRUD produk
│   │   ├── settings/page.tsx       # /dashboard/settings → Profil toko
│   │   ├── qrcode/page.tsx         # /dashboard/qrcode → Download QR
│   │   └── analytics/page.tsx      # /dashboard/analytics → Statistik
│
└── [slug]/                         # Public catalog (SSR + SEO)
    ├── page.tsx                    # /{slug} → Katalog publik
    └── not-found.tsx               # Toko tidak ditemukan
```

### Halaman & Fitur Detail

#### 🌐 Landing Page (`/`)
- Hero section dengan value proposition 3 langkah
- Preview demo katalog (screenshot/mockup)
- Pricing/plans section (MVP: gratis dulu)
- CTA: "Buat Katalog Sekarang" → /register

#### 🔐 Auth Pages (`/login`, `/register`)
- Email/password login
- Google OAuth (via BetterAuth.js)
- Form validasi dengan animasi shake error
- Progress indicator saat loading

#### 📊 Dashboard Admin (`/dashboard`)
**Layout: Bento Grid**
```
┌─────────────────┬──────────────┬──────────────┐
│                 │  Total       │  QR Code     │
│  Welcome Card   │  Produk: 12  │  [Download]  │
│  "Hai, Warung.."│              │              │
├─────────────────┴──────────────┤              │
│  Statistik Minggu Ini          ├──────────────┤
│  👁 234 views  💬 12 WA klik   │  Link Toko   │
├────────────────────────────────┴──────────────┤
│  Produk Terbaru (list 3 item terakhir)        │
│  [Lihat Semua Produk →]                       │
└───────────────────────────────────────────────┘
```

#### 📦 Manajemen Produk (`/dashboard/products`)
- Tabel produk dengan gambar thumbnail
- CRUD produk (modal/drawer)
- Toggle ketersediaan (switch)
- Drag & drop sorting (sort_order)
- Empty state estetik + panduan pertama kali

#### ⚙️ Pengaturan Toko (`/dashboard/settings`)
- Upload logo (preview langsung)
- Upload gambar QRIS
- Nomor WhatsApp
- Slug/URL toko (editable, cek ketersediaan)
- Warna tema (color picker simpel)

#### 🌟 Katalog Publik (`/[slug]`)
**Desain: Liquid Glass 2.0 / iOS Style**
```
[Header: Logo + Nama Toko]
[Filter Kategori: horizontal scroll]
[Grid/List produk: 2 kolom mobile]
  ┌──────────┐ ┌──────────┐
  │ [foto]   │ │ [foto]   │
  │ Nama     │ │ Nama     │
  │ Rp 25K   │ │ Rp 15K   │
  │ [+ Tambah│ │ [+ Tambah│
  └──────────┘ └──────────┘
[Floating Cart Button: "🛒 3 item - Rp 65.000"]
[Bottom Sheet Cart → Checkout WhatsApp]
```

---

## ⚡ 5. Performa & Rendering Strategy

### Strategi Rendering per Halaman

| Halaman | Strategi | Alasan |
|---------|----------|--------|
| `/` (Landing) | **SSG** (Static) | Tidak berubah sering, cepat |
| `/login`, `/register` | **SSG** | Form statis |
| `/dashboard/**` | **CSR** (Client) | Data personal, tidak perlu SEO |
| `/[slug]` (Katalog) | **SSR + ISR** | SEO kritis, data bisa berubah |

### ISR untuk Katalog Publik
```typescript
// app/[slug]/page.tsx
export const revalidate = 60; // Revalidasi setiap 60 detik
// Atau: revalidatePath('/[slug]') saat admin update produk → Webhook
```

### Optimasi Performa
- **Image Optimization**: Next.js `<Image>` dengan `sizes` attribute
- **Font**: `next/font` dengan subset Latin+Indonesia
- **Bundle Splitting**: Dynamic import untuk komponen besar (Framer Motion, QR Code)
- **Caching**: SWR atau React Query untuk data dashboard
- **Supabase Edge**: Gunakan koneksi Supabase di Server Component untuk menghindari waterfall

---

## 🎨 6. Desain UI/UX

### Design System

#### Warna (Default Theme)
```css
--primary: #6366f1;      /* Indigo */
--primary-dark: #4f46e5;
--accent: #f59e0b;       /* Amber */
--surface: rgba(255,255,255,0.8);
--glass: rgba(255,255,255,0.15);
--backdrop: blur(20px);
```

#### Typography
```
Heading: Plus Jakarta Sans (modern, clean)
Body: Inter
Mono: JetBrains Mono (untuk harga/kode)
```

### A. Dashboard Admin — Bento Grid Layout

**Konsep:** Kartu-kartu modular berukuran berbeda yang tersusun dalam grid 12 kolom.
- Kartu besar: Statistik utama, daftar produk
- Kartu medium: QR Code, link toko
- Kartu kecil: Metric singkat

**Visual Style:**
- Background: Gradient halus abu-abu ke putih
- Kartu: Putih dengan shadow `shadow-lg`
- Border radius: `rounded-2xl` (besar, modern)
- Accent: Warna primary toko

### B. Katalog Publik — Liquid Glass 2.0

**Konsep:** Antarmuka bergaya iOS/iPadOS dengan efek glassmorphism yang responsif.

```css
/* Liquid Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border-radius: 20px;
}
```

**Background:** Blurred gradient mengikuti `theme_color` toko + foto produk sebagai ambient.

### C. Micro-Interactions

| Interaksi | Animasi |
|-----------|---------|
| Form error | Shake animasi (0.3s) |
| Tambah ke keranjang | Bounce + update counter |
| Toggle produk | Smooth switch |
| Loading halaman | Shimmer skeleton |
| Empty state | Subtle pulse + ilustrasi |
| Tombol submit | Loading spinner inset |

### D. WhatsApp Checkout Flow

```typescript
// Format pesan WhatsApp yang dikirim
function buildWhatsAppMessage(cart: CartItem[], store: Store): string {
  const items = cart.map(item => 
    `• ${item.name} x${item.qty} = Rp ${formatRupiah(item.price * item.qty)}`
  ).join('\n');
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  return `Halo ${store.name}! 👋\n\nSaya ingin memesan:\n\n${items}\n\n*Total: Rp ${formatRupiah(total)}*\n\n---\nDikirim dari: ${process.env.NEXT_PUBLIC_APP_URL}/${store.slug}`;
}

// URL wa.me
const waUrl = `https://wa.me/${store.wa_number}?text=${encodeURIComponent(message)}`;
```

---

## 🔍 7. SEO & Analitik

### A. SEO Strategy

#### Meta Tags Dinamis (per Toko)
```typescript
// app/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const store = await getStore(params.slug);
  return {
    title: `${store.name} | Menu Digital`,
    description: store.description ?? `Lihat menu dan produk dari ${store.name}`,
    openGraph: {
      title: store.name,
      description: store.description,
      images: [store.logo_url ?? '/og-default.png'],
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

#### Sitemap Dinamis
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await getAllActiveStores();
  return stores.map(store => ({
    url: `${baseUrl}/${store.slug}`,
    lastModified: store.updated_at,
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}
```

#### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Nama Toko",
  "menu": "https://app.com/slug",
  "hasMenu": {
    "@type": "Menu",
    "hasMenuSection": [...]
  }
}
```

### B. Analytics (MVP — Privacy-First)

**Pilihan:** Custom analytics menggunakan Supabase (gratis, simple).

**Events yang Dilacak:**
```typescript
type AnalyticsEvent = 
  | 'page_view'        // Pelanggan buka katalog
  | 'product_view'     // Klik detail produk
  | 'add_to_cart'      // Tambah ke keranjang
  | 'wa_checkout'      // Klik tombol pesan via WA
  | 'qris_view';       // Lihat gambar QRIS
```

**Dashboard Analytics (Admin):**
- Total pengunjung hari ini / minggu ini / bulan ini
- Produk paling sering dilihat
- Waktu puncak kunjungan (chart 24 jam)
- Jumlah klik "Pesan via WhatsApp"

**Post-MVP Option:**
- Integrasi [Plausible Analytics](https://plausible.io) (bayar ~$9/bln) untuk heatmap & funnel
- Atau self-host [Umami](https://umami.is) di Supabase Edge Functions

---

## 🔒 8. Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Auth** | BetterAuth.js dengan session JWT + refresh token |
| **Database** | Row Level Security (RLS) di semua tabel |
| **API Routes** | Auth middleware di semua `/api/dashboard/*` |
| **Storage** | Bucket policies: public read untuk gambar produk, private untuk QRIS |
| **Rate Limiting** | Next.js middleware + Upstash Redis (post-MVP) |
| **Input Sanitization** | Zod schema validation di semua form |
| **Slug Injection** | Validasi regex: `^[a-z0-9-]+$` hanya alfanumerik-dash |

---

## 🗺️ 9. Roadmap Implementasi

### Phase 0: Setup & Foundation (1-2 hari)
- [ ] Init Next.js 15 project + TypeScript
- [ ] Setup Tailwind CSS v4 + Shadcn/UI
- [ ] Setup Supabase project + run migrations
- [ ] Setup BetterAuth.js dengan Supabase adapter
- [ ] Deploy ke Vercel (staging)

### Phase 1: Auth & Onboarding (2-3 hari)
- [ ] Halaman Landing (`/`)
- [ ] Halaman Register + Login (email & Google)
- [ ] Onboarding: Setup toko pertama (slug, nama, WA, logo)
- [ ] Redirect ke dashboard setelah onboarding

### Phase 2: Core Admin (3-4 hari)
- [ ] Dashboard overview (Bento Grid)
- [ ] CRUD Produk (tambah, edit, hapus, toggle tersedia)
- [ ] Upload gambar produk ke Supabase Storage
- [ ] Halaman Settings toko (logo, QRIS, warna tema)

### Phase 3: Katalog Publik (2-3 hari)
- [ ] Halaman `[slug]` dengan desain Liquid Glass
- [ ] Filter kategori produk
- [ ] Keranjang (client-side Zustand)
- [ ] Checkout via WhatsApp

### Phase 4: QR Code & Polish (1-2 hari)
- [ ] Generate & Download QR Code per toko
- [ ] Empty states yang estetik
- [ ] Loading skeletons
- [ ] Error states
- [ ] Mobile optimization & testing

### Phase 5: Analytics & SEO (2-3 hari)
- [ ] Implementasi event tracking
- [ ] Dashboard analytics (chart sederhana)
- [ ] Sitemap.xml dinamis
- [ ] Meta tags per toko
- [ ] JSON-LD structured data

### Phase 6: Launch Preparation
- [ ] Testing end-to-end
- [ ] Performance audit (Lighthouse ≥ 90)
- [ ] Custom domain setup
- [ ] Go live! 🚀

---

## 📦 10. Dependensi NPM yang Dibutuhkan

```bash
# Core Framework
npx create-next-app@latest --typescript --tailwind --app

# UI & Animation
npx shadcn@latest init
npm install framer-motion lucide-react

# Auth
npm install better-auth

# Database
npm install @supabase/supabase-js drizzle-orm

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# State Management
npm install zustand

# QR Code
npm install react-qr-code

# Utilities
npm install dayjs clsx tailwind-merge

# Charts (Analytics Dashboard)
npm install recharts

# Image to file (QR download)
npm install html-to-image
```

---

## 🤔 Pertanyaan Terbuka (Perlu Keputusan)

| # | Pertanyaan | Opsi | Rekomendasi |
|---|-----------|------|-------------|
| 1 | Tetap Vite atau migrasi Next.js? | Vite (tanpa SSR) vs Next.js (dengan SSR) | **Next.js** untuk SEO |
| 2 | Auth: BetterAuth atau NextAuth v5? | Keduanya bagus | **BetterAuth** (lebih modern, lebih fleksibel) |
| 3 | Apakah ada limit produk per toko di MVP? | Unlimited vs 20 produk/gratis | **20 produk** untuk kontrol biaya storage |
| 4 | Multi-bahasa di katalog publik? | Indonesia only vs EN+ID | **Indonesia dulu** untuk MVP |
| 5 | Order management (admin bisa lihat pesanan)? | Lewat WA saja vs ada tab Pesanan | **WA saja** untuk MVP, tambah di v2 |
| 6 | Domain: Subdomain atau path? | `kafe-ku.app.com` vs `app.com/kafe-ku` | **Path** lebih mudah implementasi |

---

## 📐 Estimasi Ukuran Project

| Komponen | Estimasi Waktu |
|----------|---------------|
| Setup + Auth | 3 hari |
| Dashboard Admin | 4 hari |
| Katalog Publik | 3 hari |
| Analytics | 2 hari |
| QR + Polish | 2 hari |
| **Total MVP** | **~14 hari kerja** |

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan arsitektur baru.*  
*Versi: 1.0 | Dibuat dengan ❤️ untuk UMKM Indonesia*
