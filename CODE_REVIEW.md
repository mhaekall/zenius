# Code Review: OpenMenu - QR Catalog SaaS

## Executive Summary

Setelah melakukan analisis menyeluruh terhadap codebase ini, saya menemukan beberapa **celah keamanan**, **masalah performa**, **bug potensial**, dan **best practice violations**. Berikut adalah penilaian lengkapnya:

---

## 🔴 Critical Issues (Harus Segera Diperbaiki)

### 1. **SQL Injection & Row Level Security (RLS) Tidak Ada**

**Lokasi:** [`src/pages/Catalog.tsx:33-41`](src/pages/Catalog.tsx:33), [`src/pages/dashboard/Products.tsx:54-64`](src/pages/dashboard/Products.tsx:54)

**Masalah:**
```typescript
// Catalog.tsx - Query langsung tanpa validasi ownership
const { data: storeData, error } = await supabase
  .from('stores')
  .select(`*, products (*)`)
  .eq('slug', slug)  // slug dari URL params - bisa dimanipulasi
  .eq('is_active', true)
  .single();
```

Tidak ada **Row Level Security (RLS)** policies yang terdeteksi di database. Semua user bisa melihat/mengubah data toko orang lain.

**Saran:** 
- Buat RLS policies untuk tabel `stores`, `products`, dan `analytics_events`
- Validasi ownership sebelum operasi update/delete

---

### 2. **Input Validation Lemah pada Slug**

**Lokasi:** [`src/lib/utils.ts:40-47`](src/lib/utils.ts:40)

**Masalah:**
```typescript
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')  // Hanya alphanumeric dan dash
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

Meskipun `sanitizeSlug` sudah cukup baik, **tidak ada validasi duplicate slug** saat register. Dua user bisa register dengan nama toko yang sama.

**Saran:**
- Tambahkan unique constraint di database level
- Cek slug availability sebelum insert

---

### 3. **URL.createObjectURL Memory Leak**

**Lokasi:** [`src/pages/dashboard/Products.tsx:121`](src/pages/dashboard/Products.tsx:121), [`src/pages/dashboard/Settings.tsx:59,74`](src/pages/dashboard/Settings.tsx:59)

**Masalah:**
```typescript
// Products.tsx
setImagePreview(URL.createObjectURL(compressedFile));  // Tidak di-revoke

// Settings.tsx
setLogoPreview(URL.createObjectURL(compressed));  // Tidak di-revoke
setQrisPreview(URL.createObjectURL(compressed));  // Tidak di-revoke
```

`URL.createObjectURL()` membuat blob URL yang harus di-revoke secara manual dengan `URL.revokeObjectURL()` untuk mencegah memory leak.

**Saran:**
```typescript
useEffect(() => {
  return () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
  };
}, [imagePreview]);
```

---

### 4. **Error Handling yang Tidak Aman - Information Disclosure**

**Lokasi:** [`src/pages/Login.tsx:40`](src/pages/Login.tsx:40), [`src/pages/Register.tsx:60`](src/pages/Register.tsx:60)

**Masalah:**
```typescript
// Login.tsx
setError('Email atau password salah. Silakan coba lagi.');

// Register.tsx
setError(authError.message);  // ❌ RAW ERROR MESSAGE
setError(`Gagal membuat toko: ${storeError.message}`);  // ❌ RAW ERROR MESSAGE
```

Menampilkan error message asli dari Supabase bisa expose informasi sensitif seperti:
- Email sudah terdaftar
- Koneksi gagal
- Validasi error details

**Saran:**
```typescript
setError('Terjadi kesalahan. Silakan coba lagi.');
// Log error asli ke console untuk debugging
console.error('Auth error:', authError);
```

---

## 🟠 Performance Issues

### 5. **Multiple Supabase Calls di Catalog Page**

**Lokasi:** [`src/pages/Catalog.tsx:57-61,92-95,314-318,338-342`](src/pages/Catalog.tsx:57)

**Masalah:**
```typescript
// Tiga call terpisah untuk analytics
supabase.from('analytics_events').insert({...}); // page_view
supabase.from('analytics_events').insert({...}); // add_to_cart (2x)
supabase.from('analytics_events').insert({...}); // add_to_cart (2x)
```

Setiap event analytics membuat request terpisah. Ini tidak efisien dan bisa gagal tanpa notifikasi.

**Saran:**
- Batch insert analytics events
- Atau gunakan edge function untuk batch processing

---

### 6. **Tanpa Pagination - Potential DoS**

**Lokasi:** [`src/pages/Catalog.tsx:51`](src/pages/Catalog.tsx:51), [`src/pages/dashboard/Products.tsx:57-64`](src/pages/dashboard/Products.tsx:57)

**Masalah:**
```typescript
// Semua produk di-load sekaligus
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', store.id)
  // ❌ Tidak ada .limit() atau pagination
  .order('sort_order');
```

Jika toko memiliki 1000+ produk, ini akan membuat halaman sangat lambat.

**Saran:**
```typescript
// Gunakan pagination
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', store.id)
  .range(offset, offset + limit - 1)  // Pagination
  .order('sort_order');
```

---

### 7. **Unnecessary Re-renders di Zustand**

**Lokasi:** [`src/pages/Catalog.tsx:25`](src/pages/Catalog.tsx:25)

**Masalah:**
```typescript
const { items, addItem, removeItem, updateQty, clearCart, getTotalItems, getTotalPrice } = useCartStore();
```

Memanggil semua function dan getter di component level menyebabkan re-render tidak perlu. Getter seperti `getTotalItems` dan `getTotalPrice` akan selalu membuat component re-render karena mereka adalah function baru setiap render.

**Saran:**
```typescript
// Gunakan selector yang lebih spesifik
const items = useCartStore((state) => state.items);
const totalItems = useCartStore((state) => state.getTotalItems());
// Atau gunakan shallow equal
import { shallow } from 'zustand/shallow';
const { items, totalItems } = useCartStore(
  (state) => ({ items: state.items, totalItems: state.getTotalItems() }),
  shallow
);
```

---

## 🟡 Best Practice Violations

### 8. **Tanpa Loading State untuk Analytics**

**Lokasi:** [`src/pages/Catalog.tsx:57-61`](src/pages/Catalog.tsx:57)

**Masalah:**
```typescript
supabase.from('analytics_events').insert({
  store_id: storeData.id,
  event_type: 'page_view',
  referrer: document.referrer || null,
});  // ❌ Tidak ada error handling
```

Analytics events dikirim tanpa error handling. Jika gagal, tidak ada feedback ke user dan tidak ada retry mechanism.

**Saran:**
```typescript
const { error } = await supabase.from('analytics_events').insert({...});
if (error) console.error('Analytics error:', error);
```

---

### 9. **Hardcoded Bucket Names**

**Lokasi:** [`src/pages/dashboard/Products.tsx:139`](src/pages/dashboard/Products.tsx:139), [`src/pages/dashboard/Settings.tsx:83`](src/pages/dashboard/Settings.tsx:83)

**Masalah:**
```typescript
// hardcoded bucket name
.from('store-assets')
```

Jika bucket name salah ketik, akan error. Tidak ada konstanta yang centralized.

**Saran:**
```typescript
// src/lib/constants.ts
export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  STORE_ASSETS: 'store-assets',
} as const;
```

---

### 10. **Tanpa Type Safety untuk Supabase Responses**

**Lokasi:** [`src/pages/dashboard/Products.tsx:57-64`](src/pages/dashboard/Products.tsx:57)

**Masalah:**
```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', store.id)
  .order('sort_order');
setProducts(data || []);  // ❌ Implicit any
```

Response dari Supabase tidak memiliki type safety yang ketat.

**Saran:**
```typescript
import type { Product } from '../types';
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', store.id)
  .order('sort_order');

if (error) {
  toast.error(error.message);
  return;
}

const products = data as Product[];
setProducts(products);
```

---

### 11. **Console.log Debug yang Tertinggal**

**Lokasi:** [`src/App.tsx:107`](src/App.tsx:107), [`src/pages/dashboard/Settings.tsx:85`](src/pages/dashboard/Settings.tsx:85), [`src/pages/Register.tsx:86`](src/pages/Register.tsx:86)

**Masalah:**
```typescript
console.log('[Auth]', event, session?.user?.email);
console.error('Store Insert Error:', storeError);
console.error('Upload Error:', error);
```

Console logs harusnya tidak ada di production code.

**Saran:** Hapus atau gunakan proper logging library dengan environment check.

---

### 12. **Tanpa Error Boundary**

**Masalah:** Tidak ada React Error Boundary untuk menangkap render errors. Jika ada error di component tree, whole app crash.

**Saran:**
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

---

### 13. **Missing Key Props di Lists**

**Lokasi:** Potentially di beberapa tempat dengan dynamic lists.

**Best Practice:** Selalu gunakan unique key yang stable (ID), bukan index.

---

## 🔵 Bug Potensial

### 14. **Google OAuth - Redirect URL Hardcoded**

**Lokasi:** [`src/pages/Login.tsx:57`](src/pages/Login.tsx:57), [`src/pages/Register.tsx:44`](src/pages/Register.tsx:44)

**Masalah:**
```typescript
redirectTo: `${window.location.origin}/dashboard`,
```

Ini bisa bermasalah jika:
- Ada multiple deployment environments (staging, production)
- User membuka di subdomain berbeda

**Saran:** Gunakan environment variable untuk redirect URL.

---

### 15. **Store tidak fetch setelah OAuth login**

**Lokasi:** [`src/pages/Login.tsx:44-49`](src/pages/Login.tsx:44)

**Masalah:**
```typescript
if (authData.session) {
  navigate('/dashboard');
}
```

Setelah OAuth login berhasil, store tidak langsung di-fetch. User akan melihat loading spinner di dashboard karena menunggu `onAuthStateChange`.

Ini sudah ditangani dengan benar di `AuthInit` tapi ada race condition potensial.

---

### 16. **Zod Schema Validasi WA Number Lemah**

**Lokasi:** [`src/pages/Register.tsx:15`](src/pages/Register.tsx:15), [`src/pages/dashboard/Settings.tsx:20`](src/pages/dashboard/Settings.tsx:20)

**Masalah:**
```typescript
waNumber: z.string().min(8).regex(/^[0-9]+$/, 'Hanya angka')
```

Tidak ada validasi format nomor Indonesia yang benar. Contoh: `1234567890` (10 digit) valid tapi tidak ada prefix negara.

**Saran:**
```typescript
waNumber: z.string()
  .min(8, 'Nomor WhatsApp minimal 8 digit')
  .regex(/^(0|62)?[0-9]{8,12}$/, 'Format nomor tidak valid')
  .transform(val => val.startsWith('0') ? '62' + val.slice(1) : val)
```

---

### 17. **Theme Color - XSS Potensial**

**Lokasi:** [`src/pages/Catalog.tsx:101`](src/pages/Catalog.tsx:101), [`src/components/ui/index.tsx`](src/components/ui/index.tsx)

**Masalah:**
```typescript
const themeColor = store?.theme_color || '#F59E0B';
// Digunakan langsung di inline styles
style={{ background: themeColor }}
```

User bisa inject arbitrary CSS melalui theme_color field jika tidak ada validasi.

**Saran:**
```typescript
// Validasi hex color
const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(themeColor);
const safeColor = isValidHex ? themeColor : '#F59E0B';
```

---

### 18. **Tanpa Rate Limiting di Auth**

**Masalah:** Tidak ada rate limiting untuk:
- Login attempts
- Registration
- Password reset

Ini bisa exploited untuk brute force attacks.

**Saran:** Gunakan Supabase Auth rate limiting atau edge function untuk additional protection.

---

## 🟢 Recommendations Summary

| Priority | Issue | Effort |
|----------|-------|--------|
| 🔴 Critical | RLS Policies | Medium |
| 🔴 Critical | URL.createObjectURL leak | Low |
| 🔴 Critical | Input validation | Low |
| 🟠 High | Pagination | Medium |
| 🟠 High | Analytics batching | Medium |
| 🟡 Medium | Type safety | Medium |
| 🟡 Medium | Error Boundary | Low |
| 🟡 Medium | Console cleanup | Low |
| 🟢 Low | Constants extraction | Low |
| 🟢 Low | Theme color validation | Low |

---

## 🚨 BUG KHUSUS: Login Tidak Bisa ke Dashboard

Berdasarkan request spesifik, berikut analisis mendalam tentang bug ini:

### Alur Login Saat Ini:
1. User input email/password → `signInWithPassword`
2. Jika berhasil → `navigate('/dashboard')`
3. `ProtectedRoute` cek `user` dan `loading`
4. Jika `loading === true` → tampilkan `PageLoader`
5. Jika `user === null` → redirect ke `/login`

### Root Cause yang Mungkin:

#### 1. Race Condition: onRehydrateStorage vs onAuthStateChange 🔴

**File:** `src/store/authStore.tsx:56-61`

```typescript
onRehydrateStorage: () => (state) => {
  if (state) {
    state.setLoading(false);  // ❌ Masalah: dipanggil segera setelah rehydration
  }
},
```

**Masalah:**
- Zustand persist melakukan rehydration dari localStorage
- `onRehydrateStorage` langsung set `loading(false)` 
- Ini bisa terjadi SEBELUM `onAuthStateChange` dari Supabase fires
- Hasil: `loading = false` tapi `user = null` (karena belum ada session di state)

**Solusi:**
```typescript
// Jangan set loading=false di onRehydrateStorage
// Biarkan AuthInit yang handle ini
onRehydrateStorage: () => (state) => {
  // Kosongkan saja
},
```

#### 2. onAuthStateChange tidak ter-trigger dengan benar

**File:** `src/App.tsx:103-130`

**Kemungkinan masalah:**
- `INITIAL_SESSION` event mungkin tidak fires jika session tidak terdeteksi
- Atau ada issue dengan Supabase auth configuration

#### 3. PKCE Flow Configuration

**File:** `src/lib/supabase.ts:12`

```typescript
flowType: 'pkce',  // ❌ Mungkin bermasalah
```

**Masalah:** PKCE memerlukan konfigurasi tambahan di Supabase Dashboard

**Solusi sementara:**
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    // flowType: 'pkce',  // Comment out atau hapus
  }
});
```

### Rekomendasi Perbaikan:

#### Fix 1: Hapus loading=false dari onRehydrateStorage
```typescript
// authStore.tsx
onRehydrateStorage: () => (state) => {
  // Biarkan loading tetap true, AuthInit yang akan set false
},
```

#### Fix 2: Tambahkan explicit session check di AuthInit
```typescript
// App.tsx - AuthInit
useEffect(() => {
  let mounted = true;
  
  // Check session langsung, tidak hanya tunggu onAuthStateChange
  const initAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!mounted) return;
    
    if (session?.user) {
      setUser(session.user);
      const currentStore = useAuthStore.getState().store;
      if (!currentStore || currentStore.owner_id !== session.user.id) {
        await fetchStore(session.user.id);
      }
    }
    setLoading(false);
  };
  
  initAuth();
  // ... rest of onAuthStateChange code
}, []);
```

#### Fix 3: ProtectedRoute lebih robust
```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, store } = useAuthStore();

  if (loading && !user) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

### Langkah Debugging:

1. **Cek console.log** - Ada tidak event yang ter-trigger di `onAuthStateChange`?
2. **Cek localStorage** - Apakah session tersimpan setelah login?
3. **Cek network tab** - Apakah ada request ke Supabase auth setelah login?
4. **Cek Supabase Dashboard** - Apakah redirect URL sudah dikonfigurasi?

---

## Kesimpulan

Secara keseluruhan, codebase ini memiliki **struktur yang baik** dengan:
- ✅ TypeScript yang konsisten
- ✅ Component organization yang baik
- ✅ State management dengan Zustand
- ✅ Form validation dengan Zod
- ✅ UI yang modern dengan Tailwind + Framer Motion

Namun ada beberapa **critical security issues** yang harus segera diperbaiki, terutama:
1. **Row Level Security** di database
2. **Memory leaks** dari blob URLs
3. **Input validation** yang lemah

Untuk bug login, kemungkinan terbesar adalah **race condition** antara `onRehydrateStorage` dan `onAuthStateChange`.

Performance issues juga perlu diperhatikan untuk scalability aplikasi.