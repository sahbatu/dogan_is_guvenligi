export interface SeoFields {
  meta_title?: string | null
  meta_description?: string | null
  meta_robots?: string | null
  canonical_path?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image_url?: string | null
  og_type?: string | null
  twitter_card?: string | null
  focus_keyword?: string | null
  schema_json?: Record<string, unknown> | null
}

export interface ResolvedSeo extends SeoFields {
  title: string
  description: string
  canonicalUrl: string
  robots: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  twitterCard: string
}
