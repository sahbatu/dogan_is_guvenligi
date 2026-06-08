import { useLocation } from 'react-router-dom'
import { useSiteData } from '@/contexts/SiteDataContext'
import { resolveSeo } from '@/lib/seo'
import type { SeoFields } from '@/types/seo'
import { SeoHead } from './SeoHead'
import { JsonLd } from './JsonLd'
import { company } from '@/data/placeholder'

interface PageSeoProps {
  path?: string
  fallbackTitle: string
  fallbackDescription: string
  fallbackImage?: string | null
  entity?: SeoFields | null
  ogType?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  breadcrumbs?: { name: string; path: string }[]
}

export function PageSeo({
  path: pathProp,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  entity,
  ogType,
  jsonLd,
  breadcrumbs,
}: PageSeoProps) {
  const location = useLocation()
  const path = pathProp ?? location.pathname
  const { settings, getPageSeo } = useSiteData()
  const pageSeo = getPageSeo(path)

  const seo = resolveSeo({
    settings,
    path,
    entity,
    pageSeo,
    fallbackTitle,
    fallbackDescription,
    fallbackImage,
    ogType,
  })

  const org = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.company_name || company.name,
    url: settings.site_url || undefined,
    email: settings.email || undefined,
    telephone: settings.phone_raw || settings.phone || undefined,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressLocality: settings.city || undefined,
          addressCountry: 'TR',
        }
      : undefined,
  }

  const breadcrumbLd =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: `${settings.site_url?.replace(/\/$/, '') ?? ''}${b.path}`,
          })),
        }
      : null

  const schemas = [org, ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []), breadcrumbLd].filter(
    Boolean,
  ) as Record<string, unknown>[]

  return (
    <>
      <SeoHead seo={seo} googleSiteVerification={settings.google_site_verification} />
      <JsonLd data={schemas} />
    </>
  )
}
