import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SiteDataProvider } from '@/contexts/SiteDataContext'
import { AnalyticsScripts } from '@/components/seo/AnalyticsScripts'
import { SiteBrandingHead } from '@/components/seo/SiteBrandingHead'
import { CookieConsent } from '@/components/legal/CookieConsent'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { trackPageView } from '@/lib/analytics'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

function MainLayoutInner() {
  const location = useLocation()
  const { settings } = useSiteSettings()
  const { consent } = useCookieConsent()
  const hasAnalytics = !!(settings.ga4_measurement_id || settings.gtm_container_id)
  const allowAnalytics = hasAnalytics && consent === 'all'

  useEffect(() => {
    // Ürün detay sayfası kendi productId ile ayrıca çağırır — burada ana sayfa hitleri gider.
    if (location.pathname.startsWith('/e-katalog/')) return
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteBrandingHead faviconUrl={settings.favicon_url} />
      {allowAnalytics && (
        <AnalyticsScripts
          ga4Id={settings.ga4_measurement_id}
          gtmId={settings.gtm_container_id}
        />
      )}
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CookieConsent />
    </div>
  )
}

export function MainLayout() {
  return (
    <SiteDataProvider>
      <MainLayoutInner />
    </SiteDataProvider>
  )
}
