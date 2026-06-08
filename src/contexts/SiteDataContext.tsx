import { createContext, useContext, type ReactNode } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { usePageSections } from '@/hooks/usePageSections'
import { usePageSeo } from '@/hooks/usePageSeo'
import type { PageSection, PageSeo, SiteSettings } from '@/types/cms'

interface SiteDataContextValue {
  settings: SiteSettings
  sections: PageSection[]
  allPageSeo: PageSeo[]
  loading: boolean
  getSection: (page: string, key: string) => Record<string, unknown>
  getPageSeo: (path: string) => PageSeo | undefined
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null)

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const { sections, loading: sectionsLoading } = usePageSections()
  const { allSeo, loading: seoLoading } = usePageSeo()

  const getSection = (page: string, key: string) =>
    sections.find((s) => s.page === page && s.section_key === key)?.data ?? {}

  const getPageSeo = (path: string) => allSeo.find((s) => s.path === path)

  return (
    <SiteDataContext.Provider
      value={{
        settings,
        sections,
        allPageSeo: allSeo,
        loading: settingsLoading || sectionsLoading || seoLoading,
        getSection,
        getPageSeo,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  )
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider')
  return ctx
}
