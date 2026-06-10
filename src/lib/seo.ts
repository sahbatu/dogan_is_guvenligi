import type { ResolvedSeo, SeoFields } from '@/types/seo'
import type { SiteSettings } from '@/types/cms'
import { resolveStoragePublicUrl } from '@/lib/storage-url'

function absUrl(base: string | null | undefined, path: string): string {
  const site = (base ?? import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (!site) return p
  return `${site}${p}`
}

export function resolveSeo(opts: {
  settings: SiteSettings
  path: string
  entity?: SeoFields | null
  pageSeo?: SeoFields | null
  fallbackTitle: string
  fallbackDescription: string
  fallbackImage?: string | null
  ogType?: string
}): ResolvedSeo {
  const { settings, path, entity, pageSeo, fallbackTitle, fallbackDescription, fallbackImage, ogType } =
    opts

  const suffix = settings.default_meta_title_suffix ?? settings.company_name
  const rawTitle =
    entity?.meta_title ?? pageSeo?.meta_title ?? entity?.og_title ?? fallbackTitle
  const title = rawTitle.includes(suffix) ? rawTitle : `${rawTitle} | ${suffix}`

  const description =
    entity?.meta_description ??
    pageSeo?.meta_description ??
    entity?.og_description ??
    fallbackDescription ??
    settings.default_meta_description ??
    ''

  const canonicalPath = entity?.canonical_path ?? pageSeo?.canonical_path ?? path
  const canonicalUrl = absUrl(settings.site_url, canonicalPath)

  const ogImage =
    resolveStoragePublicUrl(entity?.og_image_url) ??
    resolveStoragePublicUrl(pageSeo?.og_image_url) ??
    resolveStoragePublicUrl(fallbackImage) ??
    resolveStoragePublicUrl(settings.default_og_image_url) ??
    ''

  const ogImageAbs = ogImage.startsWith('http') ? ogImage : absUrl(settings.site_url, ogImage)

  return {
    title,
    description,
    canonicalUrl,
    robots:
      entity?.meta_robots ?? pageSeo?.meta_robots ?? settings.default_meta_robots ?? 'index,follow',
    ogTitle: entity?.og_title ?? pageSeo?.og_title ?? rawTitle,
    ogDescription: entity?.og_description ?? pageSeo?.og_description ?? description,
    ogImage: ogImageAbs,
    ogType: entity?.og_type ?? pageSeo?.og_type ?? ogType ?? 'website',
    twitterCard:
      entity?.twitter_card ?? pageSeo?.twitter_card ?? 'summary_large_image',
    meta_title: rawTitle,
    meta_description: description,
    meta_robots: entity?.meta_robots ?? pageSeo?.meta_robots,
    canonical_path: canonicalPath,
    og_title: entity?.og_title,
    og_description: entity?.og_description,
    og_image_url: ogImage,
    focus_keyword: entity?.focus_keyword,
    schema_json: entity?.schema_json ?? pageSeo?.schema_json,
  }
}

export const STATIC_PAGE_PATHS = ['/', '/hakkimizda', '/e-katalog', '/blog', '/iletisim'] as const
