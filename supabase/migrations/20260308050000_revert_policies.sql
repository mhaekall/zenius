-- Drop the modified policies
DROP POLICY IF EXISTS "Owners can manage own store" ON stores;
DROP POLICY IF EXISTS "Public can read active stores" ON stores;
DROP POLICY IF EXISTS "Owners can manage own products" ON products;
DROP POLICY IF EXISTS "Public can read available products" ON products;
DROP POLICY IF EXISTS "Owners can read own store analytics" ON analytics_events;
DROP POLICY IF EXISTS "Public can insert analytics" ON analytics_events;

-- Recreate the original policies
CREATE POLICY "Owners can manage own store" ON stores
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public can read active stores" ON stores
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can read available products" ON products
  FOR SELECT USING (
    is_available = true AND
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.is_active = true)
  );

CREATE POLICY "Owners can read own store analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);
