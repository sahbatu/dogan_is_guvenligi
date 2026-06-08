import { useState } from 'react'
import { usePageSeo } from '@/hooks/usePageSeo'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { SeoFieldsForm, seoFromEntity, type SeoFormValues } from '@/components/admin/SeoFieldsForm'
import { Button } from '@/components/ui/Button'
import { SiteImageUpload } from '@/components/admin/SiteImageUpload'
import { Link } from 'react-router-dom'

export function SeoAdminPage() {
  const { allSeo, refetch } = usePageSeo()
  const [selectedPath, setSelectedPath] = useState('/')
  const current = allSeo.find((s) => s.path === selectedPath)
  const [seo, setSeo] = useState<SeoFormValues>(seoFromEntity(current))
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const select = (path: string) => {
    setSelectedPath(path)
    const row = allSeo.find((s) => s.path === path)
    setSeo(seoFromEntity(row))
    setSaved(false)
  }

  const save = async () => {
    if (!isSupabaseConfigured) { setError('Supabase yapılandırılmamış.'); return }
    const supabase = getSupabase()!
    const payload = {
      path: selectedPath,
      meta_title: seo.meta_title || null,
      meta_description: seo.meta_description || null,
      meta_robots: seo.meta_robots || 'index,follow',
      canonical_path: seo.canonical_path || null,
      og_title: seo.og_title || null,
      og_description: seo.og_description || null,
      og_image_url: seo.og_image_url || null,
      og_type: 'website',
      twitter_card: seo.twitter_card || 'summary_large_image',
      focus_keyword: seo.focus_keyword || null,
      updated_at: new Date().toISOString(),
    }
    const { error: err } = await supabase.from('page_seo').upsert(payload, { onConflict: 'path' })
    if (err) { setError(err.message); return }
    setSaved(true); refetch()
  }

  const score = (s: SeoFormValues) => {
    let pts = 0
    if (s.meta_title) pts += 1
    if (s.meta_description && s.meta_description.length >= 50) pts += 1
    if (s.og_image_url) pts += 1
    return pts
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">SEO yönetimi</h1>
      <p className="mt-1 text-sm text-muted">
        Statik sayfa SEO ayarları. Ürün ve blog SEO&apos;su ilgili bölümlerde düzenlenir.{' '}
        <Link to="/admin/panel/ayarlar" className="text-accent-600 hover:underline">Global ayarlar →</Link>
      </p>
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {saved && <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Kaydedildi.</div>}
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="space-y-1">
          {allSeo.map((row) => (
            <button
              key={row.path}
              type="button"
              onClick={() => select(row.path)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${selectedPath === row.path ? 'bg-navy-900 text-white' : 'text-muted hover:bg-white'}`}
            >
              <span>{row.path}</span>
              <span className="text-xs opacity-70">{score(seoFromEntity(row))}/3</span>
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <p className="font-medium text-navy-900">{selectedPath}</p>
          <SiteImageUpload label="OG görsel" value={seo.og_image_url || null} onChange={(v) => setSeo({ ...seo, og_image_url: v ?? '' })} />
          <SeoFieldsForm values={seo} onChange={setSeo} />
          <Button onClick={save}>Kaydet</Button>
        </div>
      </div>
    </div>
  )
}
