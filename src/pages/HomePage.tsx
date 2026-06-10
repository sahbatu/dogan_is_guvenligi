import { lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { PageSeo } from '@/components/seo/PageSeo'
import { images } from '@/data/images'
import { lcpImagePreloadSrc } from '@/lib/image-src'
import { useSiteData } from '@/contexts/SiteDataContext'
import { Hero } from '@/components/home/Hero'

const HomeBelowFold = lazy(() =>
  import('@/components/home/HomeBelowFold').then((m) => ({ default: m.HomeBelowFold })),
)

export function HomePage() {
  const { settings } = useSiteData()
  const siteUrl = settings.site_url?.replace(/\/$/, '') ?? ''

  return (
    <>
      <Helmet>
        <link
          rel="preload"
          as="image"
          href={lcpImagePreloadSrc(images.hero.warehouse)}
          fetchPriority="high"
        />
      </Helmet>
      <PageSeo
        path="/"
        fallbackTitle="Ana Sayfa"
        fallbackDescription={`${settings.company_name} - ${settings.slogan ?? ''}`}
        ogType="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: settings.company_name,
          url: siteUrl || undefined,
          potentialAction: siteUrl
            ? {
                '@type': 'SearchAction',
                target: `${siteUrl}/e-katalog?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              }
            : undefined,
        }}
      />
      <Hero />
      <Suspense fallback={null}>
        <HomeBelowFold />
      </Suspense>
    </>
  )
}
