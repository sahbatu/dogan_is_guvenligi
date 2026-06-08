-- KVKK ve çerez politikası sayfaları
CREATE TABLE IF NOT EXISTS legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read legal_pages" ON legal_pages FOR SELECT USING (true);
CREATE POLICY "Auth manage legal_pages" ON legal_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- İletişim formu KVKK onayı
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS kvkk_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS kvkk_consent_at TIMESTAMPTZ;

-- Seed yasal sayfalar (içerik admin'den güncellenebilir)
INSERT INTO legal_pages (slug, title, content) VALUES
  ('kvkk', 'KVKK Aydınlatma Metni', ''),
  ('cerez-politikasi', 'Çerez Politikası', '')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO page_seo (path, meta_title, meta_description, meta_robots) VALUES
  ('/kvkk', 'KVKK Aydınlatma Metni', 'Kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.', 'index,follow'),
  ('/cerez-politikasi', 'Çerez Politikası', 'Web sitemizde kullanılan çerezler hakkında bilgilendirme.', 'index,follow')
ON CONFLICT (path) DO NOTHING;
