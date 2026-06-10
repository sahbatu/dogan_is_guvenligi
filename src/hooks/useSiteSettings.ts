import { useCallback, useEffect, useState } from 'react'
import { getDefaultSiteSettings } from '@/lib/cms-defaults'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { resolveStoragePublicUrl } from '@/lib/storage-url'
import type { NavLink, SiteSettings } from '@/types/cms'

function parseSettings(row: Record<string, unknown>): SiteSettings {
  const defaults = getDefaultSiteSettings()
  return {
    ...defaults,
    ...row,
    nav_links: (row.nav_links as NavLink[]) ?? defaults.nav_links,
    logo_url: resolveStoragePublicUrl(row.logo_url as string) || defaults.logo_url,
    favicon_url: resolveStoragePublicUrl(row.favicon_url as string) || defaults.favicon_url,
    default_og_image_url:
      resolveStoragePublicUrl(row.default_og_image_url as string) || defaults.default_og_image_url,
  } as SiteSettings
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getDefaultSiteSettings())
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [usingDemo, setUsingDemo] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    if (!isSupabaseConfigured) {
      setSettings(getDefaultSiteSettings())
      setUsingDemo(true)
      setLoading(false)
      return
    }
    const supabase = getSupabase()!
    const { data, error } = await supabase.from('site_settings').select('*').maybeSingle()
    if (error || !data) {
      setSettings(getDefaultSiteSettings())
      setUsingDemo(true)
    } else {
      setSettings(parseSettings(data))
      setUsingDemo(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, loading, usingDemo, refetch: fetchSettings }
}
