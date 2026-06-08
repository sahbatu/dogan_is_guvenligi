import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { PageSeo } from '@/types/cms'

const defaultSeo: Record<string, PageSeo> = {
  '/': { path: '/', meta_title: 'Ana Sayfa', meta_description: 'Temizlik ve iş güvenliği ürünleri.', updated_at: '' },
  '/hakkimizda': { path: '/hakkimizda', meta_title: 'Hakkımızda', meta_description: 'Doğan İş Güvenliği hakkında.', updated_at: '' },
  '/e-katalog': { path: '/e-katalog', meta_title: 'E-Katalog', meta_description: 'Ürün kataloğu.', updated_at: '' },
  '/blog': { path: '/blog', meta_title: 'Blog', meta_description: 'Blog yazıları.', updated_at: '' },
  '/iletisim': { path: '/iletisim', meta_title: 'İletişim', meta_description: 'İletişim bilgileri.', updated_at: '' },
  '/kvkk': { path: '/kvkk', meta_title: 'KVKK Aydınlatma Metni', meta_description: 'Kişisel verilerin korunması aydınlatma metni.', updated_at: '' },
  '/cerez-politikasi': { path: '/cerez-politikasi', meta_title: 'Çerez Politikası', meta_description: 'Çerez kullanımı hakkında bilgilendirme.', updated_at: '' },
}

export function usePageSeo(path?: string) {
  const [allSeo, setAllSeo] = useState<PageSeo[]>(Object.values(defaultSeo))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const fetchSeo = useCallback(async () => {
    setLoading(true)
    if (!isSupabaseConfigured) {
      setAllSeo(Object.values(defaultSeo))
      setLoading(false)
      return
    }
    const supabase = getSupabase()!
    const { data, error } = await supabase.from('page_seo').select('*')
    if (error || !data?.length) {
      setAllSeo(Object.values(defaultSeo))
    } else {
      setAllSeo(data as PageSeo[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSeo()
  }, [fetchSeo])

  const pageSeo = path ? allSeo.find((s) => s.path === path) ?? defaultSeo[path] : undefined

  return { allSeo, pageSeo, loading, refetch: fetchSeo }
}
