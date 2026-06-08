-- Blog galerisi: birden fazla görsel
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE blog_posts
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL
  AND (image_urls IS NULL OR image_urls = '[]'::jsonb);
