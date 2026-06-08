import { useState, useEffect } from 'react'
import type { Category, Product } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { stripHtml } from '@/lib/rich-text'
import { Button } from '@/components/ui/Button'
import { MultiImageUpload } from './MultiImageUpload'
import { normalizeProductImages } from '@/lib/product-images'
import { SeoFieldsForm, seoFromEntity, type SeoFormValues } from './SeoFieldsForm'
import { slugify } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface ProductFormData {
  name: string
  slug: string
  description: string
  category_id: string
  image_url: string | null
  image_urls: string[]
  price: number | null
  is_active: boolean
  sort_order: number
  meta_title: string | null
  meta_description: string | null
  meta_robots: string | null
  canonical_path: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  og_type: string | null
  twitter_card: string | null
  focus_keyword: string | null
}

interface ProductFormProps {
  categories: Category[]
  initial?: Product | null
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ categories, initial, onSubmit, onCancel }: ProductFormProps) {
  const [tab, setTab] = useState<'content' | 'seo'>('content')
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(() =>
    initial ? normalizeProductImages(initial) : [],
  )
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0)
  const [autoSlug, setAutoSlug] = useState(!initial)
  const [saving, setSaving] = useState(false)
  const [seo, setSeo] = useState<SeoFormValues>(() =>
    seoFromEntity(initial, {
      title: initial?.name,
      description: initial?.description ? stripHtml(initial.description) : undefined,
      image: normalizeProductImages(initial ?? {})[0],
    }),
  )

  useEffect(() => {
    if (autoSlug && name) setSlug(slugify(name))
  }, [name, autoSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      name,
      slug,
      description,
      category_id: categoryId,
      image_url: imageUrls[0] ?? null,
      image_urls: imageUrls,
      price: price.trim() ? Number(price) : null,
      is_active: isActive,
      sort_order: sortOrder,
      meta_title: seo.meta_title || null,
      meta_description: seo.meta_description || null,
      meta_robots: seo.meta_robots || 'index,follow',
      canonical_path: seo.canonical_path || null,
      og_title: seo.og_title || null,
      og_description: seo.og_description || null,
      og_image_url: seo.og_image_url || imageUrls[0] || null,
      og_type: 'product',
      twitter_card: seo.twitter_card || 'summary_large_image',
      focus_keyword: seo.focus_keyword || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-2 border-b border-navy-900/10 pb-2">
        {(['content', 'seo'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              tab === t ? 'bg-navy-900 text-white' : 'text-muted hover:text-navy-900',
            )}
          >
            {t === 'content' ? 'İçerik' : 'SEO'}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <>
          <Input label="Ürün Adı" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setAutoSlug(false) }}
              required
            />
            {!initial && (
              <button type="button" className="mt-1 text-xs text-accent-600 hover:underline" onClick={() => setAutoSlug(true)}>
                Otomatik oluştur
              </button>
            )}
          </div>
          <RichTextEditor
            label="Açıklama"
            value={description}
            onChange={setDescription}
            placeholder="Ürün özellikleri, kullanım alanı, teknik bilgiler…"
            minHeight="220px"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-navy-900">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-navy-950"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <MultiImageUpload value={imageUrls} onChange={setImageUrls} />
          <Input label="Fiyat (₺)" type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sıralama" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            <div className="flex items-end pb-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded" />
                <span className="text-sm font-medium text-navy-900">Aktif</span>
              </label>
            </div>
          </div>
        </>
      )}

      {tab === 'seo' && <SeoFieldsForm values={seo} onChange={setSeo} />}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Ekle'}</Button>
      </div>
    </form>
  )
}
