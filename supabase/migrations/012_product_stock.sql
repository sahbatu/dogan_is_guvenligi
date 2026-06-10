-- Opsiyonel stok takibi (NULL = stok bilgisi girilmemiş)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT CHECK (stock IS NULL OR stock >= 0);
