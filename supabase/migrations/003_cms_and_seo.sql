-- CMS + SEO migration

-- Product SEO columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index,follow';
ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_path TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'product';
ALTER TABLE products ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image';
ALTER TABLE products ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS schema_json JSONB;

-- Site settings (singleton)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE CHECK (singleton = true),
  company_name TEXT NOT NULL DEFAULT 'Doğan İş Güvenliği',
  company_short_name TEXT DEFAULT 'Doğan',
  slogan TEXT,
  tagline TEXT,
  founded INT,
  email TEXT,
  phone TEXT,
  phone_raw TEXT,
  address TEXT,
  city TEXT,
  working_hours TEXT,
  map_embed_url TEXT,
  site_url TEXT,
  ga4_measurement_id TEXT,
  gtm_container_id TEXT,
  google_site_verification TEXT,
  default_meta_title_suffix TEXT DEFAULT 'Doğan İş Güvenliği',
  default_meta_description TEXT,
  default_og_image_url TEXT,
  default_meta_robots TEXT DEFAULT 'index,follow',
  nav_links JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Page sections (home, about, contact content blocks)
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section_key)
);

-- Per-route SEO for static pages
CREATE TABLE IF NOT EXISTS page_seo (
  path TEXT PRIMARY KEY,
  meta_title TEXT,
  meta_description TEXT,
  meta_robots TEXT DEFAULT 'index,follow',
  canonical_path TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  focus_keyword TEXT,
  schema_json JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  category TEXT,
  published_at DATE,
  read_time INT DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  meta_robots TEXT DEFAULT 'index,follow',
  canonical_path TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'article',
  twitter_card TEXT DEFAULT 'summary_large_image',
  focus_keyword TEXT,
  schema_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Auth manage site_settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read page_sections" ON page_sections FOR SELECT USING (true);
CREATE POLICY "Auth manage page_sections" ON page_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read page_seo" ON page_seo FOR SELECT USING (true);
CREATE POLICY "Auth manage page_seo" ON page_seo FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read published blog_posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Auth read all blog_posts" ON blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth manage blog_posts" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read contact_submissions" ON contact_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update contact_submissions" ON contact_submissions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete contact_submissions" ON contact_submissions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Site images public read" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Auth upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "Auth update site images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images');
CREATE POLICY "Auth delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images');

-- Seed site_settings
INSERT INTO site_settings (
  company_name, company_short_name, slogan, tagline, founded,
  email, phone, phone_raw, address, city, working_hours, map_embed_url,
  default_meta_description, nav_links
) VALUES (
  'Doğan İş Güvenliği', 'Doğan',
  'Temizlik ve iş güvenliğinde güvenilir çözüm ortağınız',
  'Profesyonel temizlik malzemeleri ve iş güvenliği ekipmanları',
  2009,
  'info@doganisguvenligi.com', '+90 (212) 555 00 00', '+902125550000',
  'Organize Sanayi Bölgesi, 4. Cadde No: 12', 'İstanbul, Türkiye',
  'Pazartesi – Cuma: 08:30 – 18:00',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.278489783!2d28.9784!3d41.0082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1700000000000',
  'Doğan İş Güvenliği - Temizlik malzemeleri ve iş güvenliği ekipmanları tedarikçisi.',
  '[{"label":"Ana Sayfa","href":"/"},{"label":"Hakkımızda","href":"/hakkimizda"},{"label":"E-Katalog","href":"/e-katalog"},{"label":"Blog","href":"/blog"},{"label":"İletişim","href":"/iletisim"}]'::jsonb
) ON CONFLICT (singleton) DO NOTHING;

-- Seed page SEO
INSERT INTO page_seo (path, meta_title, meta_description) VALUES
  ('/', 'Ana Sayfa', 'Temizlik ve iş güvenliği ürünleri — kurumsal tedarik çözümleri.'),
  ('/hakkimizda', 'Hakkımızda', 'Doğan İş Güvenliği hakkında bilgi edinin.'),
  ('/e-katalog', 'E-Katalog', 'Temizlik ve iş güvenliği ürün kataloğu.'),
  ('/blog', 'Blog', 'İş güvenliği ve temizlik rehberleri.'),
  ('/iletisim', 'İletişim', 'Bizimle iletişime geçin.')
ON CONFLICT (path) DO NOTHING;

-- Seed page sections (minimal — admin can expand)
INSERT INTO page_sections (page, section_key, data, sort_order) VALUES
  ('home', 'hero', '{"badge":"Kurumsal tedarik","trustItems":["CE / TSE uyumlu ürünler","48 saat içinde sevkiyat","15+ yıl sektör deneyimi"]}'::jsonb, 1),
  ('home', 'stats', '{"items":[{"value":500,"suffix":"+","label":"Ürün Çeşidi"},{"value":15,"suffix":"+","label":"Yıllık Deneyim"},{"value":1200,"suffix":"+","label":"Mutlu Müşteri"},{"value":48,"suffix":" Saat","label":"Hızlı Tedarik"}]}'::jsonb, 2),
  ('home', 'services', '{"eyebrow":"Hizmetlerimiz","title":"İhtiyacınıza uygun tedarik alanları"}'::jsonb, 3),
  ('home', 'why_us', '{"eyebrow":"Neden Doğan?","title":"Kurumsal tedarikte güvenilir ortak","description":"Temizlik ve iş güvenliği ihtiyaçlarınızı tek noktadan karşılıyoruz.","points":["Geniş stok ve hızlı sevkiyat","CE / TSE uyumlu ürün gamı","Kurumsal özel fiyatlandırma","Teknik danışmanlık"]}'::jsonb, 4),
  ('home', 'industries', '{"eyebrow":"Sektörler","title":"Hizmet verdiğimiz alanlar"}'::jsonb, 5),
  ('home', 'cta', '{"title":"Kurumsal tedarik için hemen iletişime geçin","description":"Ürün kataloğumuzu inceleyin veya teklif alın.","primaryLabel":"Kataloğu İncele","secondaryLabel":"İletişime Geç"}'::jsonb, 6),
  ('about', 'main', '{"intro":"Doğan İş Güvenliği, 2009 yılından bu yana temizlik ve iş güvenliği alanında hizmet vermektedir.","mission":"Çalışan sağlığını korumak ve hijyen standartlarını yükseltmek.","vision":"Türkiye genelinde referans tedarikçi olmak.","values":[{"title":"Güvenilirlik","description":"Zamanında teslimat."},{"title":"Kalite","description":"Sertifikalı ürün portföyü."},{"title":"Sürdürülebilirlik","description":"Sorumlu tedarik."},{"title":"İnovasyon","description":"Dinamik ürün gamı."}],"timeline":[{"year":"2009","title":"Kuruluş","description":"İstanbul merkezli faaliyet."},{"year":"2014","title":"Genişleme","description":"İş güvenliği portföyü."},{"year":"2019","title":"Büyüme","description":"500+ ürün."},{"year":"2024","title":"Dijital","description":"E-katalog."}]}'::jsonb, 1),
  ('contact', 'main', '{"subtitle":"Sorularınız ve teklif talepleriniz için bize ulaşın.","successMessage":"Mesajınız alındı. En kısa sürede dönüş yapacağız."}'::jsonb, 1)
ON CONFLICT (page, section_key) DO NOTHING;

-- Seed blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, image_url, category, published_at, read_time, is_published, meta_title, meta_description) VALUES
  (
    'is-guvenligi-ekipmanlarinda-dogru-secim',
    'İş Güvenliği Ekipmanlarında Doğru Seçim Nasıl Yapılır?',
    'Saha koşullarına uygun KKD seçimi kritik öneme sahiptir.',
    '["İş güvenliği ekipmanları seçilirken risk analizi yapılmalıdır.","CE ve EN standartlarına uyum zorunludur.","Departman bazlı ihtiyaç analizi önerilir.","Teknik danışmanlık için bize ulaşın."]'::jsonb,
    '/images/hero-ppe.jpg', 'İş Güvenliği', '2025-11-12', 5, true,
    'İş Güvenliği Ekipmanlarında Doğru Seçim', 'KKD seçimi rehberi.'
  ),
  (
    'endustriyel-temizlikte-verimlilik',
    'Endüstriyel Temizlikte Verimliliği Artıran 4 Adım',
    'Doğru ürün ve dozaj ile maliyetleri düşürün.',
    '["Temizlik üretim sürekliliği ile ilişkilidir.","Yüzey tipine uygun kimyasal seçin.","Doğru dozaj kritiktir.","Ekipman standardizasyonu uygulayın."]'::jsonb,
    '/images/service-cleaning.jpg', 'Temizlik', '2025-10-28', 4, true,
    'Endüstriyel Temizlikte Verimlilik', 'Temizlik verimliliği rehberi.'
  ),
  (
    'hastane-hijyeninde-tedarik-standartlari',
    'Hastane Hijyeninde Tedarik Standartları',
    'Sağlık kuruluşlarında hijyen ürün kriterleri.',
    '["Hijyen ürünleri farklı kriterlere tabidir.","Dezenfektan etkinlik spektrumu önemlidir.","Personel eğitimi kritiktir.","Kurumsal tedarikçi seçimi önemlidir."]'::jsonb,
    '/images/products/disinfectant.jpg', 'Sağlık', '2025-09-15', 6, true,
    'Hastane Hijyeninde Tedarik', 'Hastane hijyen standartları.'
  ),
  (
    'depo-ve-lojistikte-is-guvenligi',
    'Depo ve Lojistik Merkezlerinde İş Güvenliği',
    'Depo ortamlarında riskler ve önlemler.',
    '["Depolarda kaza riski yüksektir.","KKD seti zorunludur.","Zemin temizliği güvenlik için şarttır.","Risk değerlendirmesi yapın."]'::jsonb,
    '/images/cta-warehouse.jpg', 'Lojistik', '2025-08-02', 5, true,
    'Depo ve Lojistikte İş Güvenliği', 'Depo iş güvenliği rehberi.'
  )
ON CONFLICT (slug) DO NOTHING;
