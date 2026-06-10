import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { PageSection } from '@/types/cms'

export function usePageSections(page?: string) {
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      setSections([])
      setLoading(false)
      return
    }

    const supabase = getSupabase()!
    let query = supabase.from('page_sections').select('*').order('sort_order')
    if (page) query = query.eq('page', page)

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
      setSections([])
    } else {
      setSections((data ?? []) as PageSection[])
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

  return {
    sections,
    getSection,
    loading,
    error,
    usingDemo: !isSupabaseConfigured,
    refetch: fetchSections,
  }
}
