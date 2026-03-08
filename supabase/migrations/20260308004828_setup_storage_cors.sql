
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
