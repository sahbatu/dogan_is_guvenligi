-- Hakkımızda: kuruluş 2017, dijital dönüşüm 2026
UPDATE site_settings SET founded = 2017 WHERE founded = 2009 OR founded IS NULL;

UPDATE page_sections
SET data = '{"intro":"Doğan İş Güvenliği, 2017 yılından bu yana temizlik ve iş güvenliği alanında hizmet vermektedir.","mission":"Çalışan sağlığını korumak ve hijyen standartlarını yükseltmek.","vision":"Türkiye genelinde referans tedarikçi olmak.","values":[{"title":"Güvenilirlik","description":"Zamanında teslimat."},{"title":"Kalite","description":"Sertifikalı ürün portföyü."},{"title":"Sürdürülebilirlik","description":"Sorumlu tedarik."},{"title":"İnovasyon","description":"Dinamik ürün gamı."}],"timeline":[{"year":"2017","title":"Kuruluş","description":"İstanbul merkezli faaliyet."},{"year":"2019","title":"Genişleme","description":"İş güvenliği portföyü."},{"year":"2023","title":"Büyüme","description":"100+ ürün."},{"year":"2026","title":"Dijital Dönüşüm","description":"Kurumsal web sitesi ve e-katalog."}]}'::jsonb,
    updated_at = now()
WHERE page = 'about' AND section_key = 'main';

UPDATE page_sections
SET data = jsonb_set(
  data,
  '{trustItems}',
  '["CE / TSE uyumlu", "48 saat sevkiyat", "9+ yıl deneyim"]'::jsonb
),
updated_at = now()
WHERE page = 'home' AND section_key = 'hero';

UPDATE page_sections
SET data = '{"items":[{"value":100,"suffix":"+","label":"Ürün Çeşidi"},{"value":9,"suffix":"+","label":"Yıllık Deneyim"},{"value":1200,"suffix":"+","label":"Mutlu Müşteri"},{"value":48,"suffix":" Saat","label":"Hızlı Tedarik"}]}'::jsonb,
    updated_at = now()
WHERE page = 'home' AND section_key = 'stats';
