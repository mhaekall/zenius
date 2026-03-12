import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PAGES = [
  {
    id: "landing",
    label: "Landing",
    route: "/",
    icon: "🏠",
    status: "exists",
    features: [
      { id: "l1", name: "Hero section + tagline", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "l2", name: "Phone mockup animasi", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "l3", name: "3-step features section", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "l4", name: "CTA Daftar Gratis", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "l5", name: "Sticky navbar", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "l6", name: "Footer dengan branding", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "l7", name: "Social proof / testimonial section", type: "ui", status: "recommended", tier: "free", priority: "high", reason: "Trust builder untuk UMKM baru" },
      { id: "l8", name: "Pricing section (Gratis vs Juragan vs Bos)", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "Dibutuhkan sebelum launch monetisasi" },
      { id: "l9", name: "Demo katalog live embed", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "User bisa lihat hasil akhir sebelum daftar" },
      { id: "l10", name: "SEO meta tags (title, OG, description)", type: "technical", status: "recommended", tier: "free", priority: "high", reason: "Landing page harus bisa diindex Google" },
      { id: "l11", name: "FAQ section", type: "ui", status: "recommended", tier: "free", priority: "low", reason: "Kurangi support load" },
    ],
  },
  {
    id: "login",
    label: "Login",
    route: "/login",
    icon: "🔐",
    status: "exists",
    features: [
      { id: "lg1", name: "Email + password login", type: "auth", status: "exists", tier: "free", priority: "done" },
      { id: "lg2", name: "Google OAuth", type: "auth", status: "exists", tier: "free", priority: "done" },
      { id: "lg3", name: "Show/hide password toggle", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "lg4", name: "Error message handling", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "lg5", name: "Link ke Register", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "lg6", name: "Lupa password / reset via email", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "Missing — user akan complain saat lupa password" },
      { id: "lg7", name: "Remember me / persistent session", type: "feature", status: "exists", tier: "free", priority: "done" },
    ],
  },
  {
    id: "register",
    label: "Register",
    route: "/register",
    icon: "📝",
    status: "exists",
    features: [
      { id: "r1", name: "Form: nama toko, WA, email, password", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "r2", name: "Live slug preview dari nama toko", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "r3", name: "WA number validation (format 628x)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "r4", name: "Google OAuth register", type: "auth", status: "exists", tier: "free", priority: "done" },
      { id: "r5", name: "Success state + redirect", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "r6", name: "Slug uniqueness check realtime", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "Bug kritis — slug duplikat bisa terjadi sekarang" },
      { id: "r7", name: "Terms of service checkbox", type: "legal", status: "recommended", tier: "free", priority: "medium", reason: "Dibutuhkan sebelum monetisasi aktif" },
      { id: "r8", name: "Email verification flow", type: "auth", status: "recommended", tier: "free", priority: "medium", reason: "Supabase support ini — kurangi fake accounts" },
    ],
  },
  {
    id: "catalog",
    label: "Katalog Publik",
    route: "/c/:slug",
    icon: "🛍️",
    status: "exists",
    features: [
      { id: "c1", name: "Sticky header dengan logo + nama toko", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "c2", name: "Theme color dinamis per toko", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "c3", name: "Category filter pills", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "c4", name: "Product grid 2-col dengan image", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "c5", name: "Product placeholder (initial letter)", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "c6", name: "Add to cart + quantity control", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "c7", name: "Cart FAB dengan total & item count", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "c8", name: "Cart bottom sheet", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "c9", name: "Checkout via WhatsApp (format otomatis)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "c10", name: "QRIS modal viewer", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "c11", name: "Share button (WA, Telegram, copy link)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "c12", name: "Share modal preview card", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "c13", name: "404 state (toko tidak ditemukan)", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "c14", name: "Skeleton loading state", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "c15", name: "Analytics: page_view + add_to_cart tracking", type: "analytics", status: "exists", tier: "free", priority: "done" },
      { id: "c16", name: "Haptic feedback saat add to cart", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "c17", name: "Lazy loading gambar produk", type: "performance", status: "exists", tier: "free", priority: "done" },
      { id: "c18", name: "XSS protection untuk theme color", type: "security", status: "exists", tier: "free", priority: "done" },
      { id: "c19", name: "Powered by Zenius watermark", type: "marketing", status: "exists", tier: "free", priority: "done" },
      { id: "c20", name: "Product detail bottom sheet / modal", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "User ingin lihat deskripsi & gambar full sebelum order" },
      { id: "c21", name: "Search produk di katalog", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "Berguna ketika produk > 20 item" },
      { id: "c22", name: "Store info section (deskripsi, jam buka)", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "Konteks penting untuk pelanggan baru" },
      { id: "c23", name: "Empty state yang lebih engaging", type: "ux", status: "recommended", tier: "free", priority: "low", reason: "Saat ini hanya emoji + teks" },
      { id: "c24", name: "PWA install prompt (Add to Home Screen)", type: "feature", status: "recommended", tier: "juragan", priority: "medium", reason: "Pelanggan bisa simpan katalog toko favorit" },
      { id: "c25", name: "Dynamic OG meta tags (SSR)", type: "technical", status: "recommended", tier: "free", priority: "high", reason: "og-proxy sudah ada tapi belum SSR native" },
      { id: "c26", name: "Gambar produk bisa di-zoom / fullscreen", type: "ux", status: "recommended", tier: "free", priority: "low", reason: "Terutama untuk produk fashion/craft" },
      { id: "c27", name: "'Toko Tutup' state saat is_active false", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "Pemilik bisa tutup sementara tanpa hapus toko" },
    ],
  },
  {
    id: "overview",
    label: "Dashboard: Overview",
    route: "/dashboard",
    icon: "📊",
    status: "exists",
    features: [
      { id: "o1", name: "Header nama toko + URL", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "o2", name: "Period selector (Hari ini / 7 hari / 30 hari)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "o3", name: "Insight card dengan sentiment (generateInsight)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "o4", name: "Metrics: pengunjung, pesanan WA, keranjang", type: "analytics", status: "exists", tier: "free", priority: "done" },
      { id: "o5", name: "Conversion rate ring chart", type: "analytics", status: "exists", tier: "free", priority: "done" },
      { id: "o6", name: "Bar chart tren 7 hari (views vs WA)", type: "analytics", status: "exists", tier: "free", priority: "done" },
      { id: "o7", name: "Catalog link dengan copy button", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "o8", name: "3 produk terbaru list", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "o9", name: "Link buka katalog + QR Code shortcut", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "o10", name: "Setup Toko state (Google OAuth tanpa store)", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "o11", name: "Top produk (by add-to-cart count)", type: "analytics", status: "recommended", tier: "juragan", priority: "high", reason: "Insight produk terlaris — sangat valuable" },
      { id: "o12", name: "Traffic source breakdown (referrer)", type: "analytics", status: "recommended", tier: "juragan", priority: "medium", reason: "Dari mana pelanggan datang — data sudah tersimpan" },
      { id: "o13", name: "Quick action: share katalog langsung", type: "ux", status: "recommended", tier: "free", priority: "medium", reason: "Shortcut yang sering dibutuhkan" },
      { id: "o14", name: "Revenue estimasi (total WA order × avg price)", type: "analytics", status: "recommended", tier: "juragan", priority: "medium", reason: "Motivasi pemilik toko — gamification sederhana" },
      { id: "o15", name: "Notifikasi onboarding checklist", type: "ux", status: "recommended", tier: "free", priority: "high", reason: "Arahkan user baru ke langkah berikutnya" },
    ],
  },
  {
    id: "products",
    label: "Dashboard: Produk",
    route: "/dashboard/products",
    icon: "📦",
    status: "exists",
    features: [
      { id: "p1", name: "Product grid 2/3 col dengan gambar", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "p2", name: "Search produk realtime", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p3", name: "Filter kategori pills", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p4", name: "FAB add produk (dari DashboardLayout)", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "p5", name: "Modal add/edit produk", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p6", name: "Upload foto + compress otomatis", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p7", name: "Toggle available/habis per produk", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p8", name: "Delete produk dengan konfirmasi", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p9", name: "Pagination (12 per halaman)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p10", name: "Category select di form (5 kategori)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "p11", name: "Badge status (Ada/Habis)", type: "ui", status: "exists", tier: "free", priority: "done" },
      { id: "p12", name: "Skeleton loading state", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "p13", name: "Empty state dengan CTA", type: "ux", status: "exists", tier: "free", priority: "done" },
      { id: "p14", name: "Drag & drop reorder produk", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "sort_order sudah ada di DB — tinggal UI-nya" },
      { id: "p15", name: "Bulk action (hapus banyak / toggle banyak)", type: "feature", status: "recommended", tier: "juragan", priority: "medium", reason: "Berguna saat toko punya 50+ produk" },
      { id: "p16", name: "Custom kategori (bukan hanya 5 preset)", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "UMKM non-F&B butuh kategori custom" },
      { id: "p17", name: "Produk limit indicator (free: 20 produk)", type: "ux", status: "recommended", tier: "free", priority: "high", reason: "Freemium gate harus visible sebelum user hit limit" },
      { id: "p18", name: "Multi-gambar per produk", type: "feature", status: "recommended", tier: "juragan", priority: "low", reason: "Berguna untuk fashion, craft — bukan MVP" },
      { id: "p19", name: "Stok quantity tracking (bukan hanya toggle)", type: "feature", status: "recommended", tier: "juragan", priority: "low", reason: "Butuh schema change, defer ke v2" },
    ],
  },
  {
    id: "qrcode",
    label: "Dashboard: QR Code",
    route: "/dashboard/qrcode",
    icon: "📱",
    status: "exists",
    features: [
      { id: "q1", name: "QR Code preview realtime", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "q2", name: "Download PNG", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "q3", name: "Generate poster PDF", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "q4", name: "Share / copy link", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "q5", name: "Kustomisasi warna QR + background", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "q6", name: "Toggle tampilkan logo di QR", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "q7", name: "QR Code ukuran berbeda (S/M/L)", type: "feature", status: "recommended", tier: "free", priority: "low", reason: "Untuk cetak di berbagai media" },
      { id: "q8", name: "Template poster pilihan (bukan hanya 1)", type: "feature", status: "recommended", tier: "juragan", priority: "medium", reason: "Diferensiasi premium yang terlihat jelas" },
      { id: "q9", name: "QR scan counter (berapa kali di-scan)", type: "analytics", status: "recommended", tier: "juragan", priority: "medium", reason: "Data yang sangat relevan untuk pemilik toko offline" },
    ],
  },
  {
    id: "settings",
    label: "Dashboard: Pengaturan",
    route: "/dashboard/settings",
    icon: "⚙️",
    status: "exists",
    features: [
      { id: "s1", name: "Upload / ganti logo toko", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s2", name: "Warna aksen (theme color)", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s3", name: "Edit nama toko", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s4", name: "Edit URL slug", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s5", name: "Edit nomor WhatsApp", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s6", name: "Edit deskripsi toko", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s7", name: "Upload QRIS", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s8", name: "Logout akun", type: "feature", status: "exists", tier: "free", priority: "done" },
      { id: "s9", name: "Preview perubahan realtime", type: "ux", status: "recommended", tier: "free", priority: "medium", reason: "User mau lihat dampak sebelum simpan" },
      { id: "s10", name: "Jam operasional toko", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "Pelanggan perlu tahu toko buka/tutup jam berapa" },
      { id: "s11", name: "Alamat / lokasi toko (Google Maps link)", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "Kritis untuk toko offline" },
      { id: "s12", name: "Social media links (IG, TikTok, dll)", type: "feature", status: "recommended", tier: "free", priority: "low", reason: "Lengkapi profil toko" },
      { id: "s13", name: "Tombol aktifkan / nonaktifkan toko", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "is_active ada di schema tapi belum ada UI-nya" },
      { id: "s14", name: "Danger zone: hapus akun", type: "feature", status: "recommended", tier: "free", priority: "medium", reason: "GDPR-friendly, dan user trust builder" },
      { id: "s15", name: "Ganti password", type: "auth", status: "recommended", tier: "free", priority: "high", reason: "Basic account security yang belum ada" },
      { id: "s16", name: "Info paket aktif + tanggal expired", type: "feature", status: "recommended", tier: "juragan", priority: "high", reason: "Dibutuhkan saat monetisasi aktif" },
    ],
  },
  {
    id: "new-pages",
    label: "Halaman Baru (Rekomendasi)",
    route: "—",
    icon: "✨",
    status: "recommended",
    features: [
      { id: "n1", name: "Halaman Upgrade / Pricing (/upgrade)", type: "feature", status: "recommended", tier: "juragan", priority: "high", reason: "In-app upsell — lebih efektif dari landing page" },
      { id: "n2", name: "Onboarding flow wizard (/onboarding)", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "onboarding_completed sudah di schema — tinggal UI" },
      { id: "n3", name: "Halaman reset password (/reset-password)", type: "auth", status: "recommended", tier: "free", priority: "high", reason: "Supabase sudah support, tinggal halaman-nya" },
      { id: "n4", name: "Modal: Product Detail (di katalog publik)", type: "feature", status: "recommended", tier: "free", priority: "high", reason: "Bottom sheet dengan deskripsi + gambar full" },
      { id: "n5", name: "Modal: Konfirmasi hapus akun", type: "ux", status: "recommended", tier: "free", priority: "medium", reason: "Danger action harus ada konfirmasi eksplisit" },
      { id: "n6", name: "Toast / notifikasi pesanan masuk (realtime)", type: "feature", status: "recommended", tier: "juragan", priority: "medium", reason: "Supabase Realtime — wow factor tinggi" },
      { id: "n7", name: "Halaman analytics detail (/dashboard/analytics)", type: "analytics", status: "recommended", tier: "juragan", priority: "medium", reason: "Pisahkan dari overview untuk data yang lebih dalam" },
      { id: "n8", name: "Halaman referral / invite teman", type: "marketing", status: "recommended", tier: "free", priority: "low", reason: "K-factor multiplier — defer ke post-launch" },
      { id: "n9", name: "Status page toko (jam buka, pengumuman)", type: "feature", status: "recommended", tier: "free", priority: "low", reason: "Section kecil di katalog publik" },
    ],
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ui:          { bg: "#F3F4F6", text: "#6B7280", label: "UI" },
  feature:     { bg: "#EFF6FF", text: "#3B82F6", label: "Feature" },
  ux:          { bg: "#F0FDF4", text: "#10B981", label: "UX" },
  auth:        { bg: "#FDF4FF", text: "#A855F7", label: "Auth" },
  analytics:   { bg: "#FFF7ED", text: "#F59E0B", label: "Analytics" },
  performance: { bg: "#F0FDF4", text: "#059669", label: "Perf" },
  security:    { bg: "#FFF1F2", text: "#F43F5E", label: "Security" },
  marketing:   { bg: "#FFF7ED", text: "#EA580C", label: "Marketing" },
  technical:   { bg: "#F8FAFC", text: "#475569", label: "Technical" },
  legal:       { bg: "#FAFAF8", text: "#78716C", label: "Legal" },
};

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  free:    { bg: "#F0FDF4", text: "#15803D", label: "Free" },
  juragan: { bg: "#FFF7ED", text: "#C2410C", label: "Juragan" },
  bos:     { bg: "#FDF4FF", text: "#7E22CE", label: "Bos" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  done:   { bg: "#1C1917", text: "#fff",     label: "Done ✓" },
  high:   { bg: "#FEF2F2", text: "#DC2626",  label: "High" },
  medium: { bg: "#FFFBEB", text: "#D97706",  label: "Medium" },
  low:    { bg: "#F0F9FF", text: "#0284C7",  label: "Low" },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Tag({ style, label }: { style: { bg: string; text: string; label?: string }; label?: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ background: style.bg, color: style.text }}>
      {label || style.label}
    </span>
  );
}

function FeatureRow({ feature, highlight }: { feature: any; highlight: boolean }) {
  const typeStyle = TYPE_COLORS[feature.type] || TYPE_COLORS.feature;
  const tierStyle = TIER_STYLES[feature.tier] || TIER_STYLES.free;
  const prioStyle = PRIORITY_STYLES[feature.priority] || PRIORITY_STYLES.medium;
  const isExisting = feature.status === "exists";

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-black/[0.04] last:border-0 transition-colors
      ${highlight ? "bg-amber-50/50" : isExisting ? "" : "bg-blue-50/30"}`}>
      {/* Status dot */}
      <div className="mt-1 flex-shrink-0">
        {isExisting
          ? <div className="w-2 h-2 rounded-full bg-emerald-400" title="Sudah ada" />
          : <div className="w-2 h-2 rounded-full bg-blue-400 ring-2 ring-blue-200" title="Rekomendasi" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[13px] font-semibold leading-snug ${isExisting ? "text-[#1C1917]" : "text-[#374151]"}`}>
            {feature.name}
          </span>
          <Tag style={prioStyle} />
        </div>
        {feature.reason && (
          <p className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{feature.reason}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Tag style={typeStyle} />
          <Tag style={tierStyle} />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ZeniusFeatureMap() {
  const [activePage, setActivePage] = useState("landing");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");

  const page = PAGES.find(p => p.id === activePage);

  const filtered = (page?.features || []).filter(f => {
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    const matchPrio = filterPriority === "all" || f.priority === filterPriority;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPrio && matchSearch;
  });

  // Global stats
  const allFeatures = PAGES.flatMap(p => p.features);
  const totalExisting = allFeatures.filter(f => f.status === "exists").length;
  const totalRecommended = allFeatures.filter(f => f.status === "recommended").length;
  const highPriority = allFeatures.filter(f => f.status === "recommended" && f.priority === "high").length;

  const pageExists = (page?.features || []).filter(f => f.status === "exists").length;
  const pageRec = (page?.features || []).filter(f => f.status === "recommended").length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAFAF8]/96 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-[8px] text-white text-sm font-black flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}>Z</div>
            <span className="font-black text-[#1C1917] text-sm tracking-tight">Feature Map</span>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari fitur..."
            className="flex-1 max-w-xs bg-[#EEECEA] rounded-xl px-3 py-1.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {/* Global stats */}
          <div className="flex items-center gap-3 text-xs flex-shrink-0 hidden sm:flex">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[#78716C] font-medium">{totalExisting} ada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[#78716C] font-medium">{totalRecommended} rekomendasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[#78716C] font-medium">{highPriority} urgent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

        {/* Sidebar — Page List */}
        <div className="w-full md:w-52 flex-shrink-0">
          <div className="md:sticky md:top-20">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] mb-2 px-1">Halaman</div>
            <div className="space-y-0.5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {PAGES.map(p => {
                const ex = p.features.filter(f => f.status === "exists").length;
                const rc = p.features.filter(f => f.status === "recommended").length;
                const isActive = activePage === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setActivePage(p.id); setFilterStatus("all"); setFilterPriority("all"); setSearch(""); }}
                    className="flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-left transition-all"
                    style={{
                      background: isActive ? "#1C1917" : "transparent",
                      color: isActive ? "#fff" : "#78716C",
                    }}
                  >
                    <span className="text-base leading-none">{p.icon}</span>
                    <div className="flex-1 min-w-0 hidden md:block">
                      <div className="text-xs font-semibold truncate">{p.label}</div>
                      <div className="text-[10px] mt-0.5" style={{ opacity: 0.6 }}>
                        {ex} + {rc} rec
                      </div>
                    </div>
                    {p.status === "recommended" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 hidden md:block" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 px-1 space-y-2 hidden md:block">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] mb-2">Legend</div>
              {[
                { dot: "bg-emerald-400", label: "Sudah ada" },
                { dot: "bg-blue-400 ring-2 ring-blue-200", label: "Rekomendasi" },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-[#78716C]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${l.dot}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{page?.icon}</span>
                <h1 className="text-xl font-black text-[#1C1917]">{page?.label}</h1>
                {page?.status === "recommended" && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-600">Halaman Baru</span>
                )}
              </div>
              {page?.route && page.route !== "—" && (
                <div className="text-xs text-[#A8A29E] mt-0.5 font-mono">{page.route}</div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold">
                {pageExists} ada
              </div>
              <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold">
                +{pageRec} rec
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex gap-1 bg-[#EEECEA] p-1 rounded-xl">
              {[
                { key: "all", label: "Semua" },
                { key: "exists", label: "Sudah Ada" },
                { key: "recommended", label: "Rekomendasi" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setFilterStatus(opt.key)}
                  className="px-2.5 py-1 rounded-[9px] text-[11px] font-bold transition-all"
                  style={{
                    background: filterStatus === opt.key ? "#1C1917" : "transparent",
                    color: filterStatus === opt.key ? "#fff" : "#78716C",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1 bg-[#EEECEA] p-1 rounded-xl">
              {[
                { key: "all", label: "Semua Priority" },
                { key: "high", label: "🔴 High" },
                { key: "medium", label: "🟡 Medium" },
                { key: "low", label: "🔵 Low" },
                { key: "done", label: "✅ Done" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setFilterPriority(opt.key)}
                  className="px-2 py-1 rounded-[9px] text-[11px] font-bold transition-all"
                  style={{
                    background: filterPriority === opt.key ? "#1C1917" : "transparent",
                    color: filterPriority === opt.key ? "#fff" : "#78716C",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature list */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#A8A29E]">Tidak ada fitur yang cocok dengan filter.</div>
            ) : (
              filtered.map((f, i) => (
                <FeatureRow key={f.id} feature={f} highlight={false} />
              ))
            )}
          </div>

          {/* Summary counts per type */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(TYPE_COLORS).map(([type, style]) => {
              const count = filtered.filter(f => f.type === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold"
                  style={{ background: style.bg, color: style.text }}>
                  <span>{style.label}</span>
                  <span className="font-black">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}