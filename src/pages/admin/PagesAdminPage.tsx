import { useState } from 'react'
import { usePageSections } from '@/hooks/usePageSections'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

const PAGE_TABS = [
  { id: 'home', label: 'Ana Sayfa' },
  { id: 'about', label: 'Hakkımızda' },
  { id: 'contact', label: 'İletişim' },
]

export function PagesAdminPage() {
  const [activePage, setActivePage] = useState('home')
  const { sections, refetch } = usePageSections(activePage)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const startEdit = (key: string, data: Record<string, unknown>) => {
    setEditingKey(key)
    setJsonText(JSON.stringify(data, null, 2))
    setSaved(false)
  }

  const save = async () => {
    if (!editingKey || !isSupabaseConfigured) return
    let data: Record<string, unknown>
    try {
      data = JSON.parse(jsonText)
    } catch {
      setError('Geçersiz JSON formatı.')
      return
    }
    const supabase = getSupabase()!
    const existing = sections.find((s) => s.section_key === editingKey)
    setError(null)
    if (existing && !existing.id.startsWith('demo-')) {
      const { error: err } = await supabase
        .from('page_sections')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (err) { setError(err.message); return }
    } else {
      const { error: err } = await supabase.from('page_sections').upsert(
        { page: activePage, section_key: editingKey, data },
        { onConflict: 'page,section_key' },
      )
      if (err) { setError(err.message); return }
    }
    setSaved(true)
    refetch()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Sayfa içerikleri</h1>
      <p className="mt-1 text-sm text-muted">Ana sayfa, hakkımızda ve iletişim bölümlerini düzenleyin.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {PAGE_TABS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setActivePage(p.id); setEditingKey(null) }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${activePage === p.id ? 'bg-navy-900 text-white' : 'bg-white text-muted ring-1 ring-navy-900/10'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {saved && <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Kaydedildi.</div>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {sections.map((s) => (
            <button
              key={s.section_key}
              type="button"
              onClick={() => startEdit(s.section_key, s.data)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${editingKey === s.section_key ? 'border-navy-900 bg-navy-900/5' : 'border-navy-900/10 bg-white'}`}
            >
              <span className="font-medium text-navy-900">{s.section_key}</span>
            </button>
          ))}
        </div>
        <div>
          {editingKey ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-navy-900">Bölüm: {editingKey}</p>
              <Textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={16} className="font-mono text-xs" />
              <Button onClick={save}>Kaydet</Button>
            </div>
          ) : (
            <p className="text-sm text-muted">Düzenlemek için soldan bir bölüm seçin.</p>
          )}
        </div>
      </div>
    </div>
  )
}
