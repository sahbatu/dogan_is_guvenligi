/** Supabase API / storage için gerçek sunucu adresi (proxy değil). */
export function getRemoteSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_REMOTE_URL?.trim() ||
    import.meta.env.VITE_SUPABASE_URL?.trim() ||
    ''
  ).replace(/\/$/, '')
}

/** Yerel geliştirmede REST istekleri Vite proxy üzerinden gider. */
export function resolveSupabaseClientUrl(): string | undefined {
  const remote = getRemoteSupabaseUrl()
  if (!remote) return undefined

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin
    }
  }

  return remote
}

const LOCAL_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i

/** Veritabanındaki localhost storage URL'lerini canlı Supabase adresine çevirir. */
export function resolveStoragePublicUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null

  const trimmed = url.trim()
  const remote = getRemoteSupabaseUrl()
  if (!remote) return trimmed

  if (LOCAL_ORIGIN.test(trimmed)) {
    const path = trimmed.replace(LOCAL_ORIGIN, '')
    if (path.startsWith('/storage/v1/')) {
      return `${remote}${path}`
    }
  }

  if (trimmed.startsWith('/storage/v1/')) {
    return `${remote}${trimmed}`
  }

  return trimmed
}

export function resolveStoragePublicUrls(urls: string[]): string[] {
  return urls
    .map((url) => resolveStoragePublicUrl(url))
    .filter((url): url is string => Boolean(url))
}

export function buildStoragePublicUrl(bucket: string, path: string): string {
  const base = getRemoteSupabaseUrl()
  const cleanPath = path.replace(/^\//, '')
  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`
}
