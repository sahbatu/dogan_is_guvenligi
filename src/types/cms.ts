import type { SeoFields } from './seo'

export interface NavLink {
  label: string
  href: string
}

export interface SiteSettings {
  id: string
  company_name: string
  company_short_name: string
  slogan: string | null
  tagline: string | null
  founded: number | null
  email: string | null
  phone: string | null
  phone_raw: string | null
  address: string | null
  city: string | null
  working_hours: string | null
  map_embed_url: string | null
  site_url: string | null
  logo_url: string | null
  logo_subtitle: string | null
  favicon_url: string | null
  footer_tagline: string | null
  footer_copyright: string | null
  instagram_url: string | null
  linkedin_url: string | null
  ga4_measurement_id: string | null
  gtm_container_id: string | null
  google_site_verification: string | null
  default_meta_title_suffix: string | null
  default_meta_description: string | null
  default_og_image_url: string | null
  default_meta_robots: string | null
  nav_links: NavLink[]
  updated_at: string
}

export interface PageSection {
  id: string
  page: string
  section_key: string
  data: Record<string, unknown>
  sort_order: number
  updated_at: string
}

export interface PageSeo extends SeoFields {
  path: string
  updated_at: string
}

export interface BlogPostRow extends SeoFields {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string[]
  image_url: string | null
  image_urls: string[]
  category: string | null
  published_at: string | null
  read_time: number
  is_published: boolean
  og_type: string | null
  created_at: string
  updated_at: string
}

export interface LegalPage {
  slug: string
  title: string
  content: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  kvkk_consent?: boolean
  kvkk_consent_at?: string | null
  message: string
  is_read: boolean
  created_at: string
}

export type ProductSeoFields = SeoFields
