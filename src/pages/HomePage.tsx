import { PageSeo } from '@/components/seo/PageSeo'
import { useSiteData } from '@/contexts/SiteDataContext'
import { Hero } from '@/components/home/Hero'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { Services } from '@/components/home/Services'
import { WhyUs } from '@/components/home/WhyUs'
import { Stats } from '@/components/home/Stats'
import { Industries } from '@/components/home/Industries'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { CTA } from '@/components/home/CTA'
import { useProducts } from '@/hooks/useProducts'

export function HomePage() {
  const { products } = useProducts()
  const { settings } = useSiteData()
  const siteUrl = settings.site_url?.replace(/\/$/, '') ?? ''

  return (
    <>
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
      <CategoryShowcase />
      <Services />
      <WhyUs />
      <Stats />
      <Industries />
      <FeaturedProducts products={products} />
      <CTA />
    </>
  )
}
