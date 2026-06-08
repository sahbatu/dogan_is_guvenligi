import { useCallback, useState } from 'react'

const STORAGE_KEY = 'dogan-cookie-consent'

export type CookieConsentLevel = 'all' | 'necessary'

function readConsent(): CookieConsentLevel | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'all' || value === 'necessary') return value
  } catch {
    /* ignore */
  }
  return null
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentLevel | null>(readConsent)

  const acceptAll = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'all')
    setConsent('all')
  }, [])

  const acceptNecessary = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'necessary')
    setConsent('necessary')
  }, [])

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setConsent(null)
  }, [])

  return { consent, acceptAll, acceptNecessary, resetConsent }
}
