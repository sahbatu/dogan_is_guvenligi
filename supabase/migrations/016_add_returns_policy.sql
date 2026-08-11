-- Existing Supabase installations need this migration because 007 may already be applied.
INSERT INTO legal_pages (slug, title, content) VALUES
  ('iade-politikasi', 'İade ve Cayma Politikası', '')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO page_seo (path, meta_title, meta_description, meta_robots) VALUES
  ('/iade-politikasi', 'İade ve Cayma Politikası', 'İade, cayma hakkı, geri ödeme ve iade süreci hakkında bilgilendirme.', 'index,follow')
ON CONFLICT (path) DO NOTHING;
