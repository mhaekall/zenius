-- Fix: Menambahkan Policy agar user bisa membaca (SELECT) toko mereka sendiri
-- Menyelesaikan issue HTTP 406 pada pengguna Google baru.

DO $$
BEGIN
    -- Menghapus policy jika sudah ada untuk menghindari duplikat error
    DROP POLICY IF EXISTS "Users can view their own store" ON stores;
    
    -- Membuat policy SELECT khusus untuk owner
    CREATE POLICY "Users can view their own store"
    ON stores
    FOR SELECT
    USING (auth.uid() = owner_id);
END $$;
