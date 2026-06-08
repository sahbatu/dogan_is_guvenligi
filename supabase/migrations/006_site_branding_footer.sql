-- Logo, favicon ve footer metinleri
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_subtitle TEXT DEFAULT 'İş Güvenliği';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_tagline TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_copyright TEXT;
