import { useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setName('')
    setSlug('')
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setModalOpen(true)
  }

  const save = async () => {
    if (!isSupabaseConfigured) { setError('Supabase yapılandırılmamış.'); return }
    const supabase = getSupabase()!
    setError(null)
    if (editing) {
      const { error: err } = await supabase.from('categories').update({ name, slug }).eq('id', editing.id)
      if (err) { setError(err.message); return }
    } else {
      const { error: err } = await supabase.from('categories').insert({ name, slug })
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Kategoriler</h1>
          <p className="mt-1 text-sm text-muted">Ürün kategorilerini yönetin.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />Yeni Kategori</Button>
      </div>
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-900/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-surface/50">
              <th className="px-6 py-3 font-semibold">Ad</th>
              <th className="px-6 py-3 font-semibold">Slug</th>
              <th className="px-6 py-3 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b last:border-0">
                <td className="px-6 py-3">{cat.name}</td>
                <td className="px-6 py-3 text-muted">{cat.slug}</td>
                <td className="px-6 py-3">
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Kategori Düzenle' : 'Yeni Kategori'}>
        <div className="space-y-4">
          <Input label="Ad" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }} />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button onClick={save}>Kaydet</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
