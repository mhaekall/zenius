-- 🚀 PREMIUM SEED: HACKER CAFE (Benchmark: Fore Coffee / Starbucks Style)

-- 1. Update Store with Logo, QRIS, and Metadata
UPDATE stores 
SET 
  logo_url = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop&q=80',
  qris_url = 'https://utfs.io/f/58d7e0d3-376a-4950-9d04-370c0c0d165c-1z.png', -- Generic QRIS Dummy
  description = 'High-performance caffeine for developers and creatives. Brewed with precision, served with style.',
  address = 'Digital Hub, BSD City, Lantai 404',
  city = 'Tangerang Selatan',
  operating_hours = 'Senin - Minggu (08:00 - 22:00)',
  theme_color = '#0D9488' -- Teal Modern
WHERE id = '11111111-1111-1111-1111-111111111111';

-- 2. Update Products with High-Quality Images & Descriptions
-- Binary Brew (Cold)
UPDATE products 
SET 
  image_url = 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800&q=80',
  description = 'Signature cold brew dengan campuran oat milk creamy dan sedikit sentuhan vanilla. Best seller untuk coding marathon semalaman.'
WHERE id = '22222222-2222-2222-2222-222222222221';

-- Full Stack Toast
UPDATE products 
SET 
  image_url = 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
  description = 'Roti gandum panggang dengan tumpukan alpukat segar, telur mata sapi, dan taburan chili flakes. Nutrisi lengkap untuk otak.'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- CSS Cascade Tea
UPDATE products 
SET 
  image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
  description = 'Teh bunga telang yang berubah warna dari biru ke ungu saat dicampur lemon. Segar, estetik, dan kaya antioksidan.'
WHERE id = '22222222-2222-2222-2222-222222222223';

-- 3. Add more premium products to fill the grid
INSERT INTO products (id, store_id, name, price, category, description, image_url, sort_order)
VALUES 
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Deployment Donut', 12000, 'Cemilan', 'Donat glazes dengan topping sprinkles warna-warni seperti status bar deployment yang sukses.', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', 4),
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'Git Push Espresso', 15000, 'Kopi', 'Double shot espresso yang kuat untuk memberikan energi instan sebelum deadline.', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80', 5),
  ('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111111', 'Cloud Matcha', 25000, 'Minuman', 'Premium Uji Matcha dengan lapisan cheese foam lembut di atasnya. Ringan seperti serverless.', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80', 6)
ON CONFLICT (id) DO NOTHING;
