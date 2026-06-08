import { Helmet } from 'react-helmet-async'
import type { ResolvedSeo } from '@/types/seo'

interface SeoHeadProps {
  seo: ResolvedSeo
  googleSiteVerification?: string | null
}

export function SeoHead({ seo, googleSiteVerification }: SeoHeadProps) {
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.robots} />
      {googleSiteVerification && (
        <meta name="google-site-verification" content={googleSiteVerification} />
      )}
      <link rel="canonical" href={seo.canonicalUrl} />
      <meta property="og:title" content={seo.ogTitle} />
      <meta property="og:description" content={seo.ogDescription} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:locale" content="tr_TR" />
      <meta name="twitter:card" content={seo.twitterCard} />
      <meta name="twitter:title" content={seo.ogTitle} />
      <meta name="twitter:description" content={seo.ogDescription} />
      <meta name="twitter:image" content={seo.ogImage} />
    </Helmet>
  )
}
