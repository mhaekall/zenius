# 🗺️ Codebase Map: Zenius (QR Catalog SaaS)

## 1. 🏗️ Gambaran Besar (The Big Picture)
Zenius adalah platform SaaS yang memungkinkan UMKM membuat katalog digital instan berbasis QR Code. Bayangkan aplikasi ini seperti sebuah **Pusat Kuliner (Food Court)** modern. Pemilik warung (Tenant) datang untuk menyewa lapak, mengatur menu mereka sendiri, dan memberikan kode unik ke pelanggan. Pelanggan cukup memindai kode tersebut untuk melihat menu digital dari warung tersebut, tanpa perlu mengunduh aplikasi tambahan, dan memesan langsung melalui "pelayan virtual" (WhatsApp).

## 2. 📂 Peta Lokasi (Directory Structure)
Berikut adalah denah dari Pusat Kuliner kita:

- 🍽️ **`/src/pages` & `/src/components` (Ruang Makan & Etalase):** Tempat pengunjung melihat menu dan berinteraksi. Di sini kode mengatur tampilan tombol, warna tema (Liquid Glass), dan kartu produk.
  - `/pages/dashboard`: Ruang kontrol khusus pemilik warung untuk mengatur menu.
  - `/pages/Catalog.tsx`: Buku menu digital yang dilihat pelanggan.
- 🍳 **`/src/store` & `/src/lib` (Dapur & Pelayan):** Tempat koki memproses pesanan dan pelayan mencatat. `store` (Zustand) mengingat apa saja yang dimasukkan pelanggan ke keranjang, sedangkan `lib` berisi alat-alat bantu seperti format mata uang dan pembuat link WhatsApp.
- 📦 **`supabase/` & Cloud Storage (Gudang & Brankas):** Tempat menyimpan bahan baku secara permanen. Data toko, daftar produk, dan file gambar (logo, QRIS) diamankan di sini menggunakan brankas canggih (Row Level Security).

## 3. ⚙️ Mesin Utama (Key Files)
- `src/App.tsx`: **Resepsionis Utama.** File ini mengatur siapa yang boleh masuk ke Ruang Makan (publik) dan siapa yang boleh masuk ke Ruang Kontrol (admin).
- `src/store/cartStore.ts`: **Buku Catatan Pelayan.** Mengingat pesanan pelanggan secara lokal (di perangkat mereka sendiri) tanpa harus menyimpannya ke Gudang (Database).
- `PLANNING.md` & `AGENT.md`: **Cetak Biru (Blueprint).** Rencana arsitektur yang mendokumentasikan masa depan aplikasi ini, termasuk niat untuk berekspansi ke Next.js.

## 4. 🚀 Cara Menjalankan (How to Start)
1. Buka terminal di folder proyek.
2. Jalankan `npm install` untuk merakit semua perabotan.
3. Jalankan `npm run dev` untuk membuka pintu Food Court secara lokal.
4. Buka `http://localhost:5173` di browser Anda.
