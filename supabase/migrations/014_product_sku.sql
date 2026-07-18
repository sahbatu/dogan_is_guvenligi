-- Ürüne stok kodu (SKU) alanı — opsiyonel, admin panelinden girilir, detay sayfasında gösterilir.
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
