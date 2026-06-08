import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { LEGAL_PATHS } from '@/lib/legal-defaults'
import { Button } from '@/components/ui/Button'

export function CookieConsent() {
  const { settings } = useSiteSettings()
  const { consent, acceptAll, acceptNecessary } = useCookieConsent()

  const hasAnalytics = !!(settings.ga4_measurement_id || settings.gtm_container_id)
  if (!hasAnalytics || consent) return null

  return (
    <div
      role="dialog"
      aria-label="Çerez tercihleri"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-navy-900/10 bg-white p-4 shadow-[0_-8px_30px_rgba(11,29,58,0.12)] sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-600/10 text-accent-600">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="text-sm text-muted">
            <p className="font-semibold text-navy-900">Çerez kullanımı</p>
            <p className="mt-1 leading-relaxed">
              Deneyiminizi iyileştirmek ve site trafiğini analiz etmek için çerezler kullanıyoruz.
              Analitik çerezler yalnızca onay vermeniz halinde yüklenir.{' '}
              <Link to={LEGAL_PATHS.cookie} className="text-accent-600 hover:underline">
                Çerez Politikası
              </Link>
              {' · '}
              <Link to={LEGAL_PATHS.kvkk} className="text-accent-600 hover:underline">
                KVKK
              </Link>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={acceptNecessary}>
            Sadece gerekli
          </Button>
          <Button type="button" size="sm" onClick={acceptAll}>
            Tümünü kabul et
          </Button>
        </div>
      </div>
    </div>
  )
}
