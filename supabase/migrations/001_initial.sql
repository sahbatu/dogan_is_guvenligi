-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Public read access for active products
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all products (for admin)
CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Seed categories
INSERT INTO categories (name, slug) VALUES
  ('Temizlik Malzemeleri', 'temizlik-malzemeleri'),
  ('İş Güvenliği Ekipmanları', 'is-guvenligi-ekipmanlari')
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO products (name, slug, description, category_id, image_url, sort_order) VALUES
  (
    'Endüstriyel Yüzey Temizleyici 5L',
    'endustriyel-yuzey-temizleyici-5l',
    'Ağır kir ve yağ lekelerine karşı etkili, konsantre formül. Fabrika ve depo zeminleri için ideal.',
    (SELECT id FROM categories WHERE slug = 'temizlik-malzemeleri'),
    '/images/products/surface-cleaner.jpg',
    1
  ),
  (
    'Profesyonel Cam Temizleme Seti',
    'profesyonel-cam-temizleme-seti',
    'Cam, ayna ve vitrin yüzeyleri için iz bırakmayan profesyonel temizlik seti.',
    (SELECT id FROM categories WHERE slug = 'temizlik-malzemeleri'),
    '/images/products/window-set.jpg',
    2
  ),
  (
    'Antibakteriyel El Dezenfektanı 1L',
    'antibakteriyel-el-dezenfektani-1l',
    '%70 alkol bazlı, hızlı etkili el hijyeni ürünü. Kurumsal kullanıma uygun.',
    (SELECT id FROM categories WHERE slug = 'temizlik-malzemeleri'),
    '/images/products/disinfectant.jpg',
    3
  ),
  (
    'Endüstriyel Zemin Paspası',
    'endustriyel-zemin-paspasi',
    'Yoğun trafikli alanlar için dayanıklı mikrofiber zemin paspası.',
    (SELECT id FROM categories WHERE slug = 'temizlik-malzemeleri'),
    '/images/products/floor-mop.jpg',
    4
  ),
  (
    'CE Onaylı Baret',
    'ce-onayli-baret',
    'EN 397 standardına uygun, darbe emici endüstriyel güvenlik bareti.',
    (SELECT id FROM categories WHERE slug = 'is-guvenligi-ekipmanlari'),
    '/images/products/helmet.jpg',
    5
  ),
  (
    'İş Güvenliği Ayakkabısı S3',
    'is-guvenligi-ayakkabisi-s3',
    'Çelik burunlu, kaymaz tabanlı, su geçirmez iş ayakkabısı. S3 koruma sınıfı.',
    (SELECT id FROM categories WHERE slug = 'is-guvenligi-ekipmanlari'),
    '/images/products/safety-boots.jpg',
    6
  ),
  (
    'Reflektörlü Yüksek Görünürlük Yeleği',
    'reflektorlu-yuksek-gorunurluk-yelegi',
    'Gece ve gündüz saha çalışmaları için EN ISO 20471 uyumlu yelek.',
    (SELECT id FROM categories WHERE slug = 'is-guvenligi-ekipmanlari'),
    '/images/products/hi-vis-vest.jpg',
    7
  ),
  (
    'Koruyucu İş Eldiveni',
    'koruyucu-is-eldiveni',
    'Kesilmeye ve aşınmaya karşı dayanıklı, ergonomik iş eldiveni.',
    (SELECT id FROM categories WHERE slug = 'is-guvenligi-ekipmanlari'),
    '/images/products/work-gloves.jpg',
    8
  )
ON CONFLICT (slug) DO NOTHING;
