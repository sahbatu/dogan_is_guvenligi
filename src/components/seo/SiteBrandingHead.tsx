import { Helmet } from 'react-helmet-async'

interface SiteBrandingHeadProps {
  faviconUrl?: string | null
}

export function SiteBrandingHead({ faviconUrl }: SiteBrandingHeadProps) {
  const href = faviconUrl || '/favicon.png'
  const iconType = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png'

  return (
    <Helmet>
      <link rel="icon" type={iconType} href={href} />
      <link rel="apple-touch-icon" href={href} />
    </Helmet>
  )
}
