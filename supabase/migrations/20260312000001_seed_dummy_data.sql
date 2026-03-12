-- Seed Dummy Data for Zenius (OpenMenu)
-- Using owner_id: 2da653a1-9fba-45b2-921f-f458c82516c0

-- 1. Insert a new Dummy Store (Hacker Cafe)
-- Kita pakai ON CONFLICT agar tidak error jika dijalankan berulang kali
INSERT INTO stores (id, owner_id, slug, name, description, wa_number, theme_color)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  '2da653a1-9fba-45b2-921f-f458c82516c0', 
  'hacker-cafe', 
  'Hacker Cafe ☕', 
  'Tempat nongkrong para tech enthusiast.', 
  '6281234567890', 
  '#10b981'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Products for Hacker Cafe
INSERT INTO products (id, store_id, name, price, category, description)
VALUES 
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Binary Brew (Cold)', 18000, 'Kopi', 'Espresso dengan susu segar dan rahasia biner.'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Full Stack Toast', 22000, 'Makanan', 'Roti bakar dengan topping keju, coklat, dan kental manis.'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'CSS Cascade Tea', 8000, 'Minuman', 'Teh manis dengan efek gradasi warna alami.')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Dummy Analytics Events (Last 3 days)
-- Page Views (Contoh: 100 views)
INSERT INTO analytics_events (store_id, event_type, created_at)
SELECT 
  '11111111-1111-1111-1111-111111111111', 
  'page_view', 
  NOW() - (random() * interval '72 hours')
FROM generate_series(1, 100);

-- Product Views
INSERT INTO analytics_events (store_id, event_type, product_id, created_at)
SELECT 
  '11111111-1111-1111-1111-111111111111', 
  'product_view', 
  '22222222-2222-2222-2222-222222222221',
  NOW() - (random() * interval '72 hours')
FROM generate_series(1, 40);

-- WhatsApp Checkouts (Conversions - Contoh: 12 orders)
INSERT INTO analytics_events (store_id, event_type, created_at)
SELECT 
  '11111111-1111-1111-1111-111111111111', 
  'wa_checkout', 
  NOW() - (random() * interval '48 hours')
FROM generate_series(1, 12);

-- 4. Insert Dummy Orders for Revenue Tracking (Tabel baru kita)
INSERT INTO orders (store_id, customer_name, total_amount, status, items_snapshot, utm_source, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Hacker Andi', 40000, 'confirmed', '[{"name": "Binary Brew", "qty": 2, "price": 18000}]', 'instagram', NOW() - interval '2 hours'),
  ('11111111-1111-1111-1111-111111111111', 'Hacker Budi', 22000, 'pending', '[{"name": "Full Stack Toast", "qty": 1, "price": 22000}]', 'wa_group', NOW() - interval '5 hours'),
  ('11111111-1111-1111-1111-111111111111', 'Hacker Citra', 30000, 'confirmed', '[{"name": "Binary Brew", "qty": 1, "price": 18000}, {"name": "CSS Cascade Tea", "qty": 1, "price": 8000}]', 'tiktok', NOW() - interval '1 day');
