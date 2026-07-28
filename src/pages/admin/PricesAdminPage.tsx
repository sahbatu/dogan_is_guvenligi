import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, ChevronLeft, ChevronRight, Save, Search, SlidersHorizontal } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { getSupabase, isSupabaseConfigured, type Product } from '@/lib/supabase'
import { updateDemoPrices } from '@/lib/demo-prices'
import { updateDemoStock } from '@/lib/demo-stock'
import { parsePriceInput, priceToInputValue } from '@/lib/price'
import { parseStockInput, stockToInputValue } from '@/lib/stock'
import { Button } from '@/components/ui/Button'

const PAGE_SIZE = 30

function isProductDirty(product: Product, priceValue: string, stockValue: string): boolean {
  return (
    (parsePriceInput(priceValue) ?? null) !== (product.price ?? null) ||
    (parseStockInput(stockValue) ?? null) !== (product.stock ?? null)
  )
}

export function PricesAdminPage() {
  const { products, categories, loading, refetch, usingDemo } = useProducts({ includeInactive: true })
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [stocks, setStocks] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [onlyDirty, setOnlyDirty] = useState(false)
  const [page, setPage] = useState(1)
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const nextPrices: Record<string, string> = {}
    const nextStocks: Record<string, string> = {}
    products.forEach((product) => {
      nextPrices[product.id] = priceToInputValue(product.price)
      nextStocks[product.id] = stockToInputValue(product.stock)
    })
    setPrices(nextPrices)
    setStocks(nextStocks)
    setDirtyIds(new Set())
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')
    return products.filter((product) => {
      if (onlyDirty && !dirtyIds.has(product.id)) return false
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
  }, [products, categories, search, categoryId, onlyDirty, dirtyIds])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const dirtyCount = dirtyIds.size

  useEffect(() => {
    setPage(1)
  }, [search, categoryId, onlyDirty])

  const syncDirty = (id: string, priceValue: string, stockValue: string) => {
    const product = products.find((item) => item.id === id)
    if (!product) return
    setDirtyIds((previous) => {
      const next = new Set(previous)
      if (isProductDirty(product, priceValue, stockValue)) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const setPrice = (id: string, value: string) => {
    setPrices((previous) => ({ ...previous, [id]: value }))
    setSaved(false)
    syncDirty(id, value, stocks[id] ?? '')
  }

  const setStock = (id: string, value: string) => {
    setStocks((previous) => ({ ...previous, [id]: value }))
    setSaved(false)
    syncDirty(id, prices[id] ?? '', value)
  }

  const discardChanges = () => {
    setPrices((previous) => {
      const next = { ...previous }
      products.forEach((product) => {
        if (dirtyIds.has(product.id)) next[product.id] = priceToInputValue(product.price)
      })
      return next
    })
    setStocks((previous) => {
      const next = { ...previous }
      products.forEach((product) => {
        if (dirtyIds.has(product.id)) next[product.id] = stockToInputValue(product.stock)
      })
      return next
    })
    setDirtyIds(new Set())
    setSaved(false)
  }

  const handleSave = async () => {
    if (dirtyCount === 0) return
    setSaving(true)
    setError(null)
    setSaved(false)
    const priceUpdates: Record<string, number | null> = {}
    const stockUpdates: Record<string, number | null> = {}
    for (const id of dirtyIds) {
      priceUpdates[id] = parsePriceInput(prices[id] ?? '')
      stockUpdates[id] = parseStockInput(stocks[id] ?? '')
    }

    try {
      if (!isSupabaseConfigured || usingDemo) {
        updateDemoPrices(priceUpdates)
        updateDemoStock(stockUpdates)
      } else {
        const supabase = getSupabase()!
        const results = await Promise.all(
          Array.from(dirtyIds).map((id) =>
            supabase
              .from('products')
              .update({ price: priceUpdates[id], stock: stockUpdates[id], updated_at: new Date().toISOString() })
              .eq('id', id),
          ),
        )
        const failed = results.find((result) => result.error)
        if (failed?.error) throw failed.error
      }
      setDirtyIds(new Set())
      setSaved(true)
      refetch()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Fiyat ve stok bilgileri kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900"><Banknote className="h-6 w-6 text-accent-600" />Hızlı fiyat ve stok</h1>
          <p className="mt-1 text-sm text-muted">Fiyat ve stok bilgisini doğrudan hücreden güncelleyin. Değişiklikler kaydedene kadar taslak kalır.</p>
        </div>
        <Link to="/admin/panel/urunler" className="text-sm font-medium text-accent-600 hover:underline">Ürün yönetimine dön</Link>
      </div>

      {usingDemo && <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">Demo mod: değişiklikler bu tarayıcıda saklanır.</div>}
      {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {saved && <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Fiyat ve stok bilgileri kaydedildi.</div>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Filtre sonucu" value={filteredProducts.length} />
        <SummaryCard label="Bekleyen değişiklik" value={dirtyCount} accent={dirtyCount > 0} />
        <SummaryCard label="Bu sayfadaki ürün" value={visibleProducts.length} />
        <div className="rounded-xl border border-navy-900/8 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">İpucu</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-800">Kaydetme işlemi yalnız butonla yapılır; yazarken veriler yanlışlıkla gönderilmez.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-navy-900/8 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
          <label className="relative"><span className="sr-only">Ürün ara</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ürün, slug, stok kodu veya kategori ara..." className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20" /></label>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-xl border border-navy-900/10 px-3 py-2.5 text-sm outline-none focus:border-accent-600"><option value="all">Tüm kategoriler</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          <button type="button" onClick={() => setOnlyDirty((value) => !value)} className={onlyDirty ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white' : 'inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/10 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-surface'}><SlidersHorizontal className="h-4 w-4" />Sadece değişenler</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-navy-900/15 py-16 text-center text-sm text-muted">Eşleşen ürün bulunamadı.</div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-900/8 bg-white shadow-sm">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead><tr className="border-b border-navy-900/8 bg-surface/60"><th className="px-5 py-3 font-semibold text-navy-900">Ürün</th><th className="w-48 px-4 py-3 font-semibold text-navy-900">Fiyat (₺)</th><th className="w-40 px-4 py-3 font-semibold text-navy-900">Stok</th></tr></thead>
              <tbody>{visibleProducts.map((product) => {
                const isDirty = dirtyIds.has(product.id)
                return <tr key={product.id} className={isDirty ? 'border-b border-navy-900/5 bg-accent-600/[0.05] last:border-0' : 'border-b border-navy-900/5 last:border-0'}>
                  <td className="px-5 py-3"><div className="flex items-center gap-3">{product.image_url ? <img src={product.image_url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" /> : <div className="h-11 w-11 shrink-0 rounded-lg bg-surface" />}<div className="min-w-0"><p className="truncate font-semibold text-navy-900">{product.name}</p><p className="mt-0.5 flex gap-2 truncate text-xs text-muted"><span>{product.category?.name ?? 'Kategorisiz'}</span>{product.sku && <span>#{product.sku}</span>}{isDirty && <span className="font-semibold text-accent-600">Değiştirildi</span>}</p></div></div></td>
                  <td className="px-4 py-3"><input type="text" inputMode="decimal" value={prices[product.id] ?? ''} onChange={(event) => setPrice(product.id, event.target.value)} placeholder="Fiyat girin" className="w-full rounded-lg border border-navy-900/12 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-navy-900 outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20" aria-label={`${product.name} fiyatı`} /></td>
                  <td className="px-4 py-3"><input type="number" min={0} step={1} value={stocks[product.id] ?? ''} onChange={(event) => setStock(product.id, event.target.value)} placeholder="Boş bırakılabilir" className="w-full rounded-lg border border-navy-900/12 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-navy-900 outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20" aria-label={`${product.name} stok`} /></td>
                </tr>
              })}</tbody>
            </table>
          </div>

          {totalPages > 1 && <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-muted">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} / {filteredProducts.length} ürün</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-lg border border-navy-900/10 bg-white p-2 text-navy-900 disabled:opacity-40" aria-label="Önceki sayfa"><ChevronLeft className="h-4 w-4" /></button><span className="text-xs font-semibold tabular-nums text-muted">{currentPage} / {totalPages}</span><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-navy-900/10 bg-white p-2 text-navy-900 disabled:opacity-40" aria-label="Sonraki sayfa"><ChevronRight className="h-4 w-4" /></button></div></div>}
        </>
      )}

      {dirtyCount > 0 && <div className="sticky bottom-4 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-navy-900/10 bg-white/95 p-4 shadow-xl shadow-navy-900/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-navy-900"><span className="text-accent-600">{dirtyCount}</span> ürünün fiyat veya stok bilgisi değiştirildi.</p><div className="flex gap-2"><Button variant="outline" onClick={discardChanges} disabled={saving}>Vazgeç</Button><Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4" />{saving ? 'Kaydediliyor...' : `${dirtyCount} değişikliği kaydet`}</Button></div></div>}
    </div>
  )
}

function SummaryCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return <div className={accent ? 'rounded-xl border border-accent-600/20 bg-accent-600/8 px-4 py-3' : 'rounded-xl border border-navy-900/8 bg-white px-4 py-3'}><p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p><p className={accent ? 'mt-1 text-2xl font-bold tabular-nums text-accent-600' : 'mt-1 text-2xl font-bold tabular-nums text-navy-900'}>{value}</p></div>
}
