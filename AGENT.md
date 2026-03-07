# Zenius — QR Catalog SaaS untuk UMKM

## Project Overview
Platform SaaS multi-tenant berbasis QR Code untuk UMKM Indonesia.
- Pemilik bisnis: daftar → upload produk → share QR Code
- Pelanggan: scan QR → katalog mobile-first → pesan via WhatsApp

## Tech Stack (Production)
- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion + Lucide React
- Supabase (PostgreSQL + Auth + Storage)
- React Router DOM v6 (routing)
- Zustand + Persist (auth store + cart store)
- React Hook Form + Zod (form validation)
- react-qr-code (QR generation)
- html-to-image (QR download)
- Recharts (analytics chart)

## Build Commands
```bash
npm install       # Install dependencies
npm run dev       # Dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
```

## Environment Variables
Buat file `.env` dari `.env.example`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## Route Structure
- `/` → Landing page (marketing)
- `/login` → Login halaman
- `/register` → Daftar + buat toko
- `/dashboard` → Overview (Bento Grid)
- `/dashboard/products` → CRUD produk
- `/dashboard/settings` → Setting toko (logo, QRIS, WA, slug)
- `/dashboard/qrcode` → Generate & download QR
- `/dashboard/analytics` → Statistik (chart 7 hari)
- `/c/:slug` → Katalog publik (Liquid Glass design)

## File Structure
```
src/
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper (formatRupiah, buildWhatsAppUrl, sanitizeSlug)
├── types/
│   └── index.ts         # TypeScript interfaces
├── store/
│   ├── authStore.ts     # Auth + store state (Zustand + persist)
│   └── cartStore.ts     # Cart state (client-side, Zustand + persist)
├── components/
│   ├── ui/index.tsx     # Button, Input, Textarea, Card, Badge, Modal, Spinner
│   └── layout/
│       └── DashboardLayout.tsx  # Sidebar + mobile nav
├── pages/
│   ├── Landing.tsx      # Landing page
│   ├── Login.tsx        # Login form
│   ├── Register.tsx     # Register + create store
│   ├── Catalog.tsx      # Public catalog (/c/:slug)
│   └── dashboard/
│       ├── Overview.tsx     # Dashboard beranda (Bento Grid)
│       ├── Products.tsx     # CRUD produk dengan upload gambar
│       ├── Settings.tsx     # Store settings
│       ├── QRCode.tsx       # QR code generator + download
│       └── Analytics.tsx    # Analytics chart
└── App.tsx              # Router + AuthInit + Guard
```

## Supabase Database Schema
Lihat `README.md` untuk SQL migrations lengkap.

## Konvensi
- Bahasa UI: Bahasa Indonesia
- Kode/variable/comment: English
- Theme color: `#6366f1` (violet) — bisa dikustom per toko
- Harga: Rupiah tanpa desimal (DECIMAL 12,0)
- Cart: Client-side only (tidak disimpan ke database)
- WhatsApp: wa.me URL API (tidak perlu payment gateway)

## Catatan Penting
- Public catalog di `/c/:slug` (bukan `/:slug`) untuk menghindari konflik routing
- Cart auto-reset saat pindah ke toko berbeda
- Analytics events dikirim langsung dari client (no server)
- Storage buckets: `products` dan `store-assets` harus dibuat manual di Supabase
