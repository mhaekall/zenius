# 🚀 OPENMENU: PRODUCT ROADMAP & MIGRATION PLAN
*Berdasarkan Framework "Solo AI Director" (Product > Architecture)*

## 🛑 PERUBAHAN ARAH (PIVOT STRATEGI)
Berdasarkan tinjauan kritis terhadap risiko bisnis dan "Opportunity Cost" untuk Solo Developer, rencana migrasi arsitektur besar-besaran (Better Auth, TanStack Start) **DITUNDA**. Fokus utama saat ini bergeser dari *Engineering Perfection* menjadi **Product, Revenue, dan Shipping**.

### 🚨 Layer 1: Security (SEGERA DISELESAIKAN)
- [x] Masukkan `mcp-master-config.json` ke `.gitignore`.
- [ ] Rotasi password Database Supabase.
- [ ] Rotasi GitHub Personal Access Token (PAT).
- [ ] Rotasi Figma Access Token.

---

## 🗺️ Roadmap Eksekusi (Realistis)

### Phase 1: Product Over Architecture (Fokus Bulan Ini)
Menyelesaikan fitur yang berhadapan langsung dengan pengguna (*user-facing*) untuk mempercepat laju monetisasi.
- [x] **Bundle/Paket Produk (Pricing):** Implementasi halaman upgrade dan logic batasan tier (Gratis vs Juragan vs Bos).
- [x] **Onboarding Flow yang Smooth:** Mengarahkan pengguna baru setelah register langsung ke langkah-langkah esensial (upload logo, tambah produk pertama).
- [x] **Sistem Notifikasi Pesanan:** Feedback UI (misal: toast) atau notifikasi realtime saat ada pesanan masuk.
- [x] **Perbaikan Landing Page:** Penambahan *Social Proof* (Testimonial) dan *Pricing Section* agar UMKM yakin untuk mendaftar.
- [x] **Manajemen Masal & Drag-and-Drop:** Fitur produktivitas pemilik toko di Dashboard.
- [x] **Analitik & Estimasi Omset:** Motivasi visual berbasis data untuk pemilik toko.

### Phase 2: Incremental Improvement (Q2)
Upgrade teknis berisiko rendah dengan *Developer Experience* (DX) yang tinggi.
- [ ] **Routing (TanStack Router):** Evaluasi perpindahan dari `react-router-dom` ke `TanStack Router` (hanya routing, bukan *full framework*) untuk type-safety parameter dan mencegah bug typo path.

### Phase 3: Revisit Full-Stack Migration (Q3/Q4 - Backlog)
Hanya dieksekusi jika sudah ada **data masalah yang terbukti** (misal: SEO sangat buruk, traffic hilang) dan **traction revenue yang stabil**.
- [ ] **TanStack Start:** Untuk kebutuhan *Server-Side Rendering* (SSR) dan optimasi meta tag/SEO tingkat lanjut.
- [ ] **Drizzle ORM:** Jika *query* Supabase JS Client sudah tidak sanggup menangani kompleksitas relasi data yang ada.
- [ ] **Better Auth:** Jika ada permintaan nyata dari klien untuk sistem autentikasi yang lebih kompleks (seperti SSO/SAML).

---

## 🧠 Framework Berpikir (Checklist Sebelum Migrasi)
Setiap kali ada godaan untuk melakukan perombakan teknis (*refactoring* besar), selalu tanyakan 3 hal ini:
1. **Does it solve a proven problem?** (Apakah ada keluhan nyata/data dari *user*?)
2. **What breaks if this goes wrong?** (Apakah risiko downtime/kehilangan data sepadan?)
3. **What's the opportunity cost?** (Apakah waktu ini lebih baik dipakai membuat fitur berbayar?)
