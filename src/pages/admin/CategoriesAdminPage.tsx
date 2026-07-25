import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Category } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'

export function CategoriesAdminPage() {
  const { categories, refetch } = useProducts({ includeInactive: true })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<string>('0')
  const [error, setError] = useState<string | null>(null)

  const parents = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  )

  const grouped = useMemo(() => {
    const byParent = new Map<string, Category[]>()
    for (const c of categories) {
      if (!c.parent_id) continue
      const list = byParent.get(c.parent_id) ?? []
      list.push(c)
      byParent.set(c.parent_id, list)
    }
    for (const list of byParent.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    return parents.map((p) => ({ parent: p, children: byParent.get(p.id) ?? [] }))
  }, [categories, parents])

  const orphans = useMemo(
    () =>
      categories.filter(
        (c) => c.parent_id && !parents.some((p) => p.id === c.parent_id),
      ),
    [categories, parents],
  )

  const openCreate = () => {
    setEditing(null)
    setName('')
    setSlug('')
    setParentId('')
    setSortOrder('0')
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setParentId(cat.parent_id ?? '')
    setSortOrder(String(cat.sort_order ?? 0))
    setModalOpen(true)
  }

  const save = async () => {
    if (!isSupabaseConfigured) { setError('Supabase yapılandırılmamış.'); return }
    const supabase = getSupabase()!
    setError(null)
    const payload = {
      name,
      slug,
      parent_id: parentId ? parentId : null,
      sort_order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    }
    if (editing) {
      if (payload.parent_id === editing.id) {
        setError('Kategori kendi kendisinin üstü olamaz.')
        return
      }
      const { error: err } = await supabase.from('categories').update(payload).eq('id', editing.id)
      if (err) { setError(err.message); return }
    } else {
      const { error: err } = await supabase.from('categories').insert(payload)
      if (err) { setError(err.message); return }
    }
    setModalOpen(false)
    refetch()
  }

  const remove = async (cat: Category) => {
    if (!confirm(`"${cat.name}" silinsin mi?`)) return
    if (!isSupabaseConfigured) return
    await getSupabase()!.from('categories').delete().eq('id', cat.id)
    refetch()
  }

  const parentOptions = editing
    ? parents.filter((p) => p.id !== editing.id)
    : parents

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Kategoriler</h1>
          <p className="mt-1 text-sm text-muted">
            Ana kategoriler ve alt kategoriler. Ana kategori oluşturmak için üst kategori seçimini boş bırakın.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />Yeni Kategori</Button>
      </div>
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="mt-8 space-y-6">
        {grouped.map(({ parent, children }) => (
          <div key={parent.id} className="overflow-hidden rounded-2xl border border-navy-900/5 bg-white">
            <div className="flex items-center justify-between border-b bg-surface/50 px-6 py-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-accent-600">Ana Kategori</div>
                <div className="mt-0.5 flex items-center gap-3">
                  <span className="text-base font-semibold text-navy-900">{parent.name}</span>
                  <span className="text-xs text-muted">{parent.slug}</span>
                  <span className="text-xs text-muted">• sıra: {parent.sort_order}</span>
                  <span className="text-xs text-muted">• {children.length} alt</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(parent)} className="p-2 text-muted hover:text-accent-600" title="Düzenle"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(parent)} className="p-2 text-muted hover:text-red-600" title="Sil"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {children.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wider text-muted">
                    <th className="px-6 py-2 font-semibold">Alt Kategori</th>
                    <th className="px-6 py-2 font-semibold">Slug</th>
                    <th className="px-6 py-2 font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0">
                      <td className="px-6 py-2.5">{cat.name}</td>
                      <td className="px-6 py-2.5 text-muted">{cat.slug}</td>
                      <td className="px-6 py-2.5">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(cat)} className="p-2 text-muted hover:text-accent-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => remove(cat)} className="p-2 text-muted hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-4 text-sm text-muted">Bu ana kategoride alt kategori yok.</div>
            )}
          </div>
        ))}

        {orphans.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-yellow-300 bg-yellow-50">
            <div className="border-b bg-yellow-100 px-6 py-3 text-sm font-semibold text-yellow-900">
              Yetim kategoriler (parent silinmiş) — {orphans.length}
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {orphans.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0">
                    <td className="px-6 py-2.5">{cat.name}</td>
                    <td className="px-6 py-2.5 text-muted">{cat.slug}</td>
                    <td className="px-6 py-2.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cat)} className="p-2 text-muted hover:text-accent-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(cat)} className="p-2 text-muted hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Kategori Düzenle' : 'Yeni Kategori'}>
        <div className="space-y-4">
          <Input label="Ad" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }} />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Üst Kategori</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-navy-900"
            >
              <option value="">— Ana kategori (üst yok) —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Sıra (küçük = önce)"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button onClick={save}>Kaydet</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
