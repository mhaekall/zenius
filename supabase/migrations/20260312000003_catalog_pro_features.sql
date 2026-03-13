-- Migration V3: Product Options & Customization
-- =============================================
-- 1. Tambah kolom options ke products
ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- 2. Update Produk Hacker Cafe dengan Varian (Contoh)
UPDATE products 
SET options = '[
  {"name": "Sugar Level", "required": true, "values": ["Normal", "Less Sugar", "No Sugar"]},
  {"name": "Extra Toppings", "required": false, "values": ["Oat Milk (+5k)", "Espresso Shot (+5k)", "Caramel (+3k)"]}
]'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222221'; -- Binary Brew

UPDATE products 
SET options = '[
  {"name": "Level Pedas", "required": true, "values": ["Normal", "Pedas", "Extra Pedas"]},
  {"name": "Add-ons", "required": false, "values": ["Extra Egg (+5k)", "Keju Slice (+3k)"]}
]'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222222'; -- Full Stack Toast
