import { useCallback, useEffect, useState } from 'react'
import { getDefaultPageSections } from '@/lib/cms-defaults'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { PageSection } from '@/types/cms'

export function usePageSections(page?: string) {
  const [sections, setSections] = useState<PageSection[]>(getDefaultPageSections())
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [usingDemo, setUsingDemo] = useState(false)

  const fetchSections = useCallback(async () => {
    setLoading(true)
    const defaults = getDefaultPageSections()
    if (!isSupabaseConfigured) {
      setSections(page ? defaults.filter((s) => s.page === page) : defaults)
      setUsingDemo(true)
      setLoading(false)
      return
    }
    const supabase = getSupabase()!
    let query = supabase.from('page_sections').select('*').order('sort_order')
    if (page) query = query.eq('page', page)
    const { data, error } = await query
    if (error || !data?.length) {
      setSections(page ? defaults.filter((s) => s.page === page) : defaults)
      setUsingDemo(true)
    } else {
      setSections(data as PageSection[])
      setUsingDemo(false)
    }
    setLoading(false)
  }, [page])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const getSection = useCallback(
    (sectionKey: string) => sections.find((s) => s.section_key === sectionKey)?.data ?? {},
    [sections],
  )

  return { sections, getSection, loading, usingDemo, refetch: fetchSections }
}
