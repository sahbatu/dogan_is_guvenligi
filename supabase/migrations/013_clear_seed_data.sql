-- Migration sırasında eklenen örnek içerikleri temizler.
-- Supabase SQL Editor'de bir kez çalıştırın.

DELETE FROM products;
DELETE FROM blog_posts;
DELETE FROM page_sections;
DELETE FROM categories;

-- İsteğe bağlı: örnek site ayarlarını da sıfırlamak için yorumu kaldırın
-- DELETE FROM site_settings;
