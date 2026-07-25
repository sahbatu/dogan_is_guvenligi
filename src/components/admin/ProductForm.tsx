import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Category, Product } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { stripHtml } from '@/lib/rich-text'
import { Button } from '@/components/ui/Button'
import { MultiImageUpload } from './MultiImageUpload'
import { normalizeProductImages } from '@/lib/product-images'
import { SeoFieldsForm, seoFromEntity, type SeoFormValues } from './SeoFieldsForm'
import { resolveCategoryId } from '@/lib/product-payload'
import { parseStockInput } from '@/lib/stock'
import { slugify } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface ProductFormData {
  name: string
  slug: string
  description: string
  category_id: string | null
  image_url: string | null
  image_urls: string[]
  price: number | null
  stock: number | null
  sku: string | null
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
  const parents = useMemo(
    () =>
      categories
        .filter((c) => !c.parent_id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, 'tr')),
    [categories],
  )
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>()
    for (const c of categories) {
      if (!c.parent_id) continue
      const list = map.get(c.parent_id) ?? []
      list.push(c)
      map.set(c.parent_id, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    return map
  }, [categories])

  const initialCategoryId = initial?.category_id ?? ''
  const initialParentId = useMemo(() => {
    if (!initialCategoryId) return parents[0]?.id ?? ''
    const cat = categories.find((c) => c.id === initialCategoryId)
    if (!cat) return parents[0]?.id ?? ''
    return cat.parent_id ?? cat.id
  }, [initialCategoryId, categories, parents])

  const [tab, setTab] = useState<'content' | 'seo'>('content')
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [parentCategoryId, setParentCategoryId] = useState(initialParentId)
  const [categoryId, setCategoryId] = useState(initialCategoryId || initialParentId)
  const [imageUrls, setImageUrls] = useState<string[]>(() =>
    initial ? normalizeProductImages(initial) : [],
  )
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '')
  const [stock, setStock] = useState(initial?.stock != null ? String(initial.stock) : '')
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0)
  const [autoSlug, setAutoSlug] = useState(!initial)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
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

  useEffect(() => {
    if (!categories.length) return
    const resolved = resolveCategoryId(categoryId, categories)
    if (resolved && resolved !== categoryId) {
      setCategoryId(resolved)
    }
  }, [categories, categoryId])

  const selectedCategoryId =
    resolveCategoryId(categoryId, categories) ?? ''

  const currentChildren = useMemo(
    () => (parentCategoryId ? childrenByParent.get(parentCategoryId) ?? [] : []),
    [parentCategoryId, childrenByParent],
  )

  const handleParentChange = (nextParentId: string) => {
    setParentCategoryId(nextParentId)
    const kids = childrenByParent.get(nextParentId) ?? []
    if (kids.length === 0) {
      setCategoryId(nextParentId)
    } else {
      const currentCat = categories.find((c) => c.id === categoryId)
      const stillValid = currentCat && currentCat.parent_id === nextParentId
      if (!stillValid) setCategoryId('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const resolvedCategoryId = resolveCategoryId(categoryId, categories)
    if (!resolvedCategoryId) {
      setFormError('Lütfen bir kategori seçin.')
      return
    }

    setSaving(true)
    await onSubmit({
      name,
      slug,
      description,
      category_id: resolvedCategoryId,
      image_url: imageUrls[0] ?? null,
      image_urls: imageUrls,
      price: price.trim() ? Number(price) : null,
      stock: parseStockInput(stock),
      sku: sku.trim() || null,
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
      {formError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>
      )}
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
            {categories.length === 0 ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
                Ürün eklemek için önce{' '}
                <Link to="/admin/panel/kategoriler" className="font-semibold underline">
                  kategori oluşturun
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
                    Ana Kategori
                  </label>
                  <select
                    value={parentCategoryId}
                    onChange={(e) => handleParentChange(e.target.value)}
                    className="w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-navy-950"
                    required
                  >
                    <option value="">— Seçin —</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
                    Alt Kategori
                  </label>
                  {currentChildren.length === 0 ? (
                    <div className="rounded-xl border border-navy-900/10 bg-surface/50 px-4 py-3 text-sm text-muted">
                      Bu ana kategoride alt kategori yok — ürün doğrudan ana kategoriye kaydedilir.
                    </div>
                  ) : (
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-navy-950"
                      required
                    >
                      <option value="">— Seçin —</option>
                      {currentChildren.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
          <MultiImageUpload value={imageUrls} onChange={setImageUrls} />
          <div>
            <Input
              label="Stok Kodu"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Örn. IG-1001"
            />
            <p className="mt-1 text-xs text-muted">Opsiyonel. Ürün detay sayfasında görüntülenir.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Fiyat (₺)" type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} />
            <div>
              <Input
                label="Stok (adet)"
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Opsiyonel"
              />
              <p className="mt-1 text-xs text-muted">Boş bırakılırsa stok takibi yapılmaz.</p>
            </div>
          </div>
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
        <Button type="submit" disabled={saving || categories.length === 0}>
          {saving ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Ekle'}
        </Button>
      </div>
    </form>
  )
}
