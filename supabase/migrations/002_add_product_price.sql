-- Ürün fiyat alanı
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

UPDATE products SET price = CASE slug
  WHEN 'endustriyel-yuzey-temizleyici-5l' THEN 289.90
  WHEN 'profesyonel-cam-temizleme-seti' THEN 349.00
  WHEN 'antibakteriyel-el-dezenfektani-1l' THEN 129.50
  WHEN 'endustriyel-zemin-paspasi' THEN 199.00
  WHEN 'ce-onayli-baret' THEN 185.00
  WHEN 'is-guvenligi-ayakkabisi-s3' THEN 1249.00
  WHEN 'reflektorlu-yuksek-gorunurluk-yelegi' THEN 95.00
  WHEN 'koruyucu-is-eldiveni' THEN 78.50
  ELSE price
END
WHERE price IS NULL;
