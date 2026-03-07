-- ====================================
-- 1. TABLE: stores (Multi-tenant core)
-- ====================================
CREATE TABLE IF NOT EXISTS stores (
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
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS analytics_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL,                  -- 'page_view', 'product_view', 'wa_click'
  product_id   UUID REFERENCES products(id),   -- Nullable
  referrer     TEXT,                            -- Dari mana traffic datang
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Stores Policies
CREATE POLICY "Owners can manage own store" ON stores
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public can read active stores" ON stores
  FOR SELECT USING (is_active = true);

-- Products Policies
CREATE POLICY "Owners can manage own products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can read available products" ON products
  FOR SELECT USING (
    is_available = true AND
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.is_active = true)
  );

-- Analytics Policies
CREATE POLICY "Owners can read own store analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);
