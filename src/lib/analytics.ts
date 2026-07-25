import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

const VISITOR_KEY = 'ds_visitor_id'
const SESSION_KEY = 'ds_session_id'
const RECENT_HITS_KEY = 'ds_recent_hits'
const DEDUPE_WINDOW_MS = 30_000

function safeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback (very old browsers) — pseudo-uuid; not cryptographically strong.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = safeUuid()
      window.localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return safeUuid()
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = safeUuid()
      window.sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return safeUuid()
  }
}

/**
 * Aynı visitor + path 30 saniye içinde tekrar tetiklenmesin (React StrictMode
 * çift render'ı ve hızlı yönlendirme dalgaları için).
 */
function shouldSkipDuplicate(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.sessionStorage.getItem(RECENT_HITS_KEY)
    const map: Record<string, number> = raw ? JSON.parse(raw) : {}
    const now = Date.now()
    // GC
    for (const k of Object.keys(map)) {
      if (now - map[k] > DEDUPE_WINDOW_MS) delete map[k]
    }
    if (map[key] && now - map[key] < DEDUPE_WINDOW_MS) return true
    map[key] = now
    window.sessionStorage.setItem(RECENT_HITS_KEY, JSON.stringify(map))
    return false
  } catch {
    return false
  }
}

function shouldTrackPath(path: string): boolean {
  if (!path) return false
  if (path.startsWith('/admin')) return false
  return true
}

export interface TrackPageOptions {
  productId?: string | null
  productSlug?: string | null
}

export function trackPageView(path: string, opts: TrackPageOptions = {}): void {
  if (!isSupabaseConfigured) return
  if (!shouldTrackPath(path)) return

  const visitor_id = getVisitorId()
  const session_id = getSessionId()
  if (!visitor_id || !session_id) return

  const key = `${visitor_id}|${path}`
  if (shouldSkipDuplicate(key)) return

  const referrer = typeof document !== 'undefined' ? document.referrer || null : null
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null

  const supabase = getSupabase()
  if (!supabase) return

  void supabase
    .from('page_views')
    .insert({
      visitor_id,
      session_id,
      path,
      product_id: opts.productId ?? null,
      product_slug: opts.productSlug ?? null,
      referrer,
      ua,
    })
    .then(() => {
      /* fire-and-forget */
    })
}
