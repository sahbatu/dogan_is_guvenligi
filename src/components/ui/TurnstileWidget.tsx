import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileOnLoad&render=explicit'
let scriptLoading: Promise<void> | null = null

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: (errorCode?: string) => void | boolean
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact' | 'flexible'
          language?: string
          appearance?: 'always' | 'execute' | 'interaction-only'
          retry?: 'auto' | 'never'
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    __turnstileOnLoad?: () => void
  }
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptLoading) return scriptLoading
  scriptLoading = new Promise<void>((resolve, reject) => {
    window.__turnstileOnLoad = () => resolve()
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC.split('?')[0]}"]`)
    if (existing) {
      if (window.turnstile) resolve()
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onerror = () => reject(new Error('turnstile-script-load-failed'))
    document.head.appendChild(s)
  })
  return scriptLoading
}

interface TurnstileWidgetProps {
  siteKey: string
  onToken: (token: string) => void
  onExpired?: () => void
  onError?: (errorCode?: string) => void
  theme?: 'light' | 'dark' | 'auto'
  className?: string
}

export function TurnstileWidget({
  siteKey,
  onToken,
  onExpired,
  onError,
  theme = 'auto',
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onToken, onExpired, onError })
  callbacksRef.current = { onToken, onExpired, onError }

  useEffect(() => {
    if (!siteKey || !containerRef.current) return
    let cancelled = false
    let mountedWidgetId: string | null = null

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        mountedWidgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          retry: 'auto',
          callback: (token) => callbacksRef.current.onToken(token),
          'expired-callback': () => callbacksRef.current.onExpired?.(),
          'error-callback': (code) => {
            callbacksRef.current.onError?.(code)
            return true
          },
        })
        widgetIdRef.current = mountedWidgetId
      })
      .catch(() => {
        callbacksRef.current.onError?.('script-load-failed')
      })

    return () => {
      cancelled = true
      if (mountedWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(mountedWidgetId)
        } catch {
          // ignore — widget may already be gone
        }
      }
      widgetIdRef.current = null
    }
  }, [siteKey, theme])

  return <div ref={containerRef} className={className} />
}

export function resetTurnstile(container: HTMLDivElement | null) {
  if (!container || typeof window === 'undefined' || !window.turnstile) return
  try {
    window.turnstile.reset()
  } catch {
    // ignore
  }
}
