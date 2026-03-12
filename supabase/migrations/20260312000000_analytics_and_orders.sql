-- Migration for Analytics and Orders
-- ====================================
-- 1. TABLE: orders (Revenue Tracking)
-- ====================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_whatsapp TEXT,
  items_snapshot JSONB NOT NULL,
  total_amount DECIMAL(12, 0) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  utm_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);
