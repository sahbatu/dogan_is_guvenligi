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
