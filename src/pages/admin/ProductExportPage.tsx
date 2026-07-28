import { useEffect, useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Search, CheckSquare, Square } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { stripHtml } from '@/lib/rich-text'
import type { Product } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const PAGE_SIZE = 25

type DescriptionFormat = 'text' | 'html'
type StatusFilter = 'all' | 'active' | 'inactive'
type ExportFieldKey =
  | 'id' | 'name' | 'slug' | 'category' | 'categorySlug' | 'description' | 'price' | 'currency'
  | 'stock' | 'sku' | 'imageUrl' | 'imageUrls' | 'status' | 'sortOrder' | 'createdAt' | 'updatedAt'
  | 'metaTitle' | 'metaDescription' | 'focusKeyword' | 'canonicalPath' | 'ogTitle' | 'ogDescription' | 'ogImageUrl'

type ExportField = { key: ExportFieldKey; label: string }

const EXPORT_FIELD_GROUPS: { title: string; fields: ExportField[] }[] = [
  {
    title: 'Temel ürün bilgileri',
    fields: [
      { key: 'id', label: 'ID' }, { key: 'name', label: 'Ürün adı' }, { key: 'slug', label: 'Slug' },
      { key: 'category', label: 'Kategori' }, { key: 'categorySlug', label: 'Kategori slug' },
      { key: 'sku', label: 'Stok kodu' }, { key: 'status', label: 'Durum' }, { key: 'sortOrder', label: 'Sıra' },
    ],
  },
  {
    title: 'Ticari bilgiler ve açıklama',
    fields: [
      { key: 'description', label: 'Açıklama' }, { key: 'price', label: 'Fiyat' },
      { key: 'currency', label: 'Para_Birimi' }, { key: 'stock', label: 'Stok' },
    ],
  },
  {
    title: 'Görseller ve SEO',
    fields: [
      { key: 'imageUrl', label: 'Ana görsel URL' }, { key: 'imageUrls', label: 'Tüm görsel URLleri' },
      { key: 'metaTitle', label: 'SEO başlığı' }, { key: 'metaDescription', label: 'SEO açıklaması' },
      { key: 'focusKeyword', label: 'Odak anahtar kelime' }, { key: 'canonicalPath', label: 'Canonical yol' },
      { key: 'ogTitle', label: 'OG başlığı' }, { key: 'ogDescription', label: 'OG açıklaması' },
      { key: 'ogImageUrl', label: 'OG görsel URL' },
    ],
  },
  {
    title: 'Kayıt bilgileri',
    fields: [
      { key: 'createdAt', label: 'Oluşturulma tarihi' }, { key: 'updatedAt', label: 'Güncellenme tarihi' },
    ],
  },
]

const EXPORT_FIELDS = EXPORT_FIELD_GROUPS.flatMap((group) => group.fields)
const DEFAULT_FIELD_KEYS = EXPORT_FIELDS.map((field) => field.key)

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('tr-TR')
}

function buildExportRows(products: Product[], descriptionFormat: DescriptionFormat) {
  return products.map((product) => ({
    ID: product.id,
    'Ürün adı': product.name,
    Slug: product.slug,
    Kategori: product.category?.name ?? '',
    'Kategori slug': product.category?.slug ?? '',
    Açıklama: descriptionFormat === 'html' ? product.description ?? '' : stripHtml(product.description ?? ''),
    Fiyat: product.price ?? '',
    Para_Birimi: 'TRY',
    Stok: product.stock ?? '',
    'Stok kodu': product.sku ?? '',
    'Ana görsel URL': product.image_url ?? '',
    'Tüm görsel URLleri': product.image_urls.join('\n'),
    Durum: product.is_active ? 'Aktif' : 'Pasif',
    Sıra: product.sort_order,
    'Oluşturulma tarihi': formatDate(product.created_at),
    'Güncellenme tarihi': formatDate(product.updated_at),
    'SEO başlığı': product.meta_title ?? '',
    'SEO açıklaması': product.meta_description ?? '',
    'Odak anahtar kelime': product.focus_keyword ?? '',
    'Canonical yol': product.canonical_path ?? '',
    'OG başlığı': product.og_title ?? '',
    'OG açıklaması': product.og_description ?? '',
    'OG görsel URL': product.og_image_url ?? '',
  }))
}

function selectExportColumns(
  products: Product[],
  descriptionFormat: DescriptionFormat,
  fieldKeys: Set<ExportFieldKey>,
) {
  const labels = new Set(
    EXPORT_FIELDS.filter((field) => fieldKeys.has(field.key)).map((field) => field.label),
  )

  return buildExportRows(products, descriptionFormat).map((row) =>
    Object.fromEntries(Object.entries(row).filter(([label]) => labels.has(label))),
  )
}

export function ProductExportPage() {
  const { products, categories, loading } = useProducts({ includeInactive: true })
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [descriptionFormat, setDescriptionFormat] = useState<DescriptionFormat>('text')
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<Set<ExportFieldKey>>(
    () => new Set(DEFAULT_FIELD_KEYS),
  )
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')

    return products.filter((product) => {
      if (status === 'active' && !product.is_active) return false
      if (status === 'inactive' && product.is_active) return false

      if (categoryId !== 'all') {
        const category = categories.find((item) => item.id === categoryId)
        const matchesCategory =
          product.category_id === categoryId ||
          (category != null && (product.category_id === category.slug || product.category?.slug === category.slug))
        if (!matchesCategory) return false
      }

      if (!query) return true
      return [product.name, product.slug, product.sku ?? '', product.category?.name ?? ''].some((value) =>
        value.toLocaleLowerCase('tr-TR').includes(query),
      )
    })
  }, [products, categories, search, categoryId, status])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedProducts = products.filter((product) => selectedIds.has(product.id))
  const exportProducts = selectedProducts.length > 0 ? selectedProducts : filteredProducts
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selectedIds.has(product.id))

  useEffect(() => {
    setPage(1)
  }, [search, categoryId, status])

  const toggleProduct = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleVisibleProducts = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (allVisibleSelected) visibleProducts.forEach((product) => next.delete(product.id))
      else visibleProducts.forEach((product) => next.add(product.id))
      return next
    })
  }

  const toggleField = (key: ExportFieldKey) => {
    setSelectedFieldKeys((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAllFields = () => setSelectedFieldKeys(new Set(DEFAULT_FIELD_KEYS))
  const clearFields = () => setSelectedFieldKeys(new Set())

  const exportXlsx = async () => {
    if (exportProducts.length === 0 || selectedFieldKeys.size === 0) return

    setExporting(true)
    setError(null)
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(
        selectExportColumns(exportProducts, descriptionFormat, selectedFieldKeys),
      )
      worksheet['!cols'] = EXPORT_FIELDS.filter((field) => selectedFieldKeys.has(field.key)).map(({ key }) =>
        key === 'description' || key === 'imageUrls' || key === 'metaDescription' || key === 'ogDescription'
          ? { wch: 70 }
          : key === 'imageUrl' || key === 'ogImageUrl' ? { wch: 56 } : { wch: 24 },
      )
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler')

      const date = new Date().toISOString().slice(0, 10)
      XLSX.writeFileXLSX(workbook, `urun-listesi-${date}.xlsx`, { compression: true })
      setExportModalOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Excel dosyası oluşturulamadı.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
            <FileSpreadsheet className="h-6 w-6 text-accent-600" />
            Ürünleri Excel'e Aktar
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Seçtiğiniz ürünlerin katalog, fiyat, stok, görsel ve SEO bilgilerini .xlsx dosyası olarak indirin.
          </p>
        </div>
        <Button onClick={() => setExportModalOpen(true)} disabled={loading || exporting || exportProducts.length === 0}>
          <Download className="h-4 w-4" />
          {exporting ? 'Excel hazırlanıyor...' : `${exportProducts.length} ürün için seçim yap`}
        </Button>
      </div>

      {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 rounded-2xl border border-navy-900/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem_11rem]">
          <label className="relative block">
            <span className="sr-only">Ürün ara</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ürün adı, slug, stok kodu veya kategori ara..."
              className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20"
            />
          </label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-xl border border-navy-900/10 px-3 py-2.5 text-sm outline-none focus:border-accent-600"
          >
            <option value="all">Tüm kategoriler</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="rounded-xl border border-navy-900/10 px-3 py-2.5 text-sm outline-none focus:border-accent-600"
          >
            <option value="all">Tüm durumlar</option>
            <option value="active">Yalnız aktifler</option>
            <option value="inactive">Yalnız pasifler</option>
          </select>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-navy-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-navy-900">Açıklama biçimi</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FormatOption checked={descriptionFormat === 'text'} onChange={() => setDescriptionFormat('text')}>
                Düz metin
              </FormatOption>
              <FormatOption checked={descriptionFormat === 'html'} onChange={() => setDescriptionFormat('html')}>
                HTML kodunu koru
              </FormatOption>
            </div>
          </div>
          <div className="text-sm text-muted sm:text-right">
            <p><strong className="text-navy-900">{filteredProducts.length}</strong> filtre sonucu</p>
            <p>{selectedProducts.length > 0 ? `${selectedProducts.length} tekil ürün seçili` : 'Seçim yok: filtre sonucunun tamamı indirilecek'}</p>
          </div>
        </div>
      </div>

      <Modal open={exportModalOpen} onClose={() => setExportModalOpen(false)} title="Excel dışa aktarma" className="max-w-4xl">
        <section>
        <div className="flex flex-col gap-3 border-b border-navy-900/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Excel'de yer alacak alanlar</h2>
            <p className="mt-1 text-sm text-muted">İstediğin sütunları seç; sadece bunlar Excel dosyasına yazılır.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={selectAllFields} className="rounded-lg border border-navy-900/10 px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-surface">Tümünü seç</button>
            <button type="button" onClick={clearFields} className="rounded-lg border border-navy-900/10 px-3 py-2 text-xs font-semibold text-muted hover:bg-surface">Temizle</button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {EXPORT_FIELD_GROUPS.map((group) => (
            <fieldset key={group.title}>
              <legend className="text-xs font-bold uppercase tracking-wider text-navy-900">{group.title}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {group.fields.map((field) => {
                  const checked = selectedFieldKeys.has(field.key)
                  return (
                    <label
                      key={field.key}
                      className={checked ? 'flex cursor-pointer items-center gap-2 rounded-lg bg-accent-600/8 px-3 py-2 text-sm font-medium text-navy-900' : 'flex cursor-pointer items-center gap-2 rounded-lg bg-surface/70 px-3 py-2 text-sm text-muted'}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleField(field.key)} className="h-4 w-4 rounded border-navy-900/20 accent-accent-600" />
                      {field.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <p className={selectedFieldKeys.size > 0 ? 'mt-5 text-xs text-muted' : 'mt-5 text-xs font-semibold text-red-600'}>
          {selectedFieldKeys.size > 0 ? `${selectedFieldKeys.size} alan seçili.` : 'Excel indirmek için en az bir alan seçmelisin.'}
        </p>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-navy-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">{exportProducts.length} ürün ve {selectedFieldKeys.size} alan Excel'e yazılacak.</p>
            <Button onClick={exportXlsx} disabled={exporting || exportProducts.length === 0 || selectedFieldKeys.size === 0}>
              <Download className="h-4 w-4" />
              {exporting ? 'Excel hazırlanıyor...' : 'Excel dosyasını indir'}
            </Button>
          </div>
        </section>
      </Modal>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-navy-900/15 py-16 text-center text-sm text-muted">
          Bu filtrelerle eşleşen ürün bulunamadı.
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-900/8 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead><tr className="border-b border-navy-900/8 bg-surface/60">
                <th className="w-12 px-4 py-3">
                  <button type="button" onClick={toggleVisibleProducts} className="rounded p-1 text-navy-900 hover:bg-white" aria-label="Sayfadaki ürünlerin tümünü seç">
                    {allVisibleSelected ? <CheckSquare className="h-4 w-4 text-accent-600" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-navy-900">Ürün</th>
                <th className="px-4 py-3 font-semibold text-navy-900">Kategori</th>
                <th className="px-4 py-3 font-semibold text-navy-900">Stok kodu</th>
                <th className="px-4 py-3 font-semibold text-navy-900">Durum</th>
              </tr></thead>
              <tbody>{visibleProducts.map((product) => (
                <tr key={product.id} className="border-b border-navy-900/5 last:border-0">
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleProduct(product.id)} className="h-4 w-4 rounded border-navy-900/20 accent-accent-600" aria-label={`${product.name} ürününü seç`} /></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-3">{product.image_url ? <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-surface" />}<div><p className="font-medium text-navy-900">{product.name}</p><p className="text-xs text-muted">{product.slug}</p></div></div></td>
                  <td className="px-4 py-3 text-muted">{product.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{product.sku ?? '—'}</td>
                  <td className="px-4 py-3"><span className={product.is_active ? 'text-xs font-semibold text-green-700' : 'text-xs font-semibold text-muted'}>{product.is_active ? 'Aktif' : 'Pasif'}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted">Sayfa {currentPage} / {totalPages}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40">Önceki</button>
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40">Sonraki</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FormatOption({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: string }) {
  return (
    <label className={checked ? 'cursor-pointer rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white' : 'cursor-pointer rounded-lg border border-navy-900/10 px-3 py-2 text-xs font-semibold text-muted'}>
      <input type="radio" name="description-format" checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}
