import { useEffect, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import { Banknote, Save, Search } from 'lucide-react'

import { useProducts } from '@/hooks/useProducts'

import { getSupabase, isSupabaseConfigured, type Product } from '@/lib/supabase'

import { updateDemoPrices } from '@/lib/demo-prices'

import { updateDemoStock } from '@/lib/demo-stock'

import { formatPrice } from '@/lib/utils'

import { parsePriceInput, priceToInputValue } from '@/lib/price'

import { parseStockInput, stockToInputValue, formatStock } from '@/lib/stock'

import { Button } from '@/components/ui/Button'

import { Input } from '@/components/ui/Input'



function isProductDirty(

  product: Product,

  priceValue: string,

  stockValue: string,

): boolean {

  const nextPrice = parsePriceInput(priceValue)

  const nextStock = parseStockInput(stockValue)

  const priceChanged = (nextPrice ?? null) !== (product.price ?? null)

  const stockChanged = (nextStock ?? null) !== (product.stock ?? null)

  return priceChanged || stockChanged

}



export function PricesAdminPage() {

  const { products, categories, loading, refetch, usingDemo } = useProducts({ includeInactive: true })

  const [prices, setPrices] = useState<Record<string, string>>({})

  const [stocks, setStocks] = useState<Record<string, string>>({})

  const [search, setSearch] = useState('')

  const [categoryId, setCategoryId] = useState('all')

  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())

  const [saving, setSaving] = useState(false)

  const [saved, setSaved] = useState(false)

  const [error, setError] = useState<string | null>(null)



  useEffect(() => {

    const nextPrices: Record<string, string> = {}

    const nextStocks: Record<string, string> = {}

    products.forEach((p) => {

      nextPrices[p.id] = priceToInputValue(p.price)

      nextStocks[p.id] = stockToInputValue(p.stock)

    })

    setPrices(nextPrices)

    setStocks(nextStocks)

    setDirtyIds(new Set())

  }, [products])



  const filtered = useMemo(() => {

    const q = search.trim().toLowerCase()

    return products.filter((p) => {

      if (categoryId !== 'all') {

        const cat = categories.find((c) => c.id === categoryId)

        const matchesCategory =

          p.category_id === categoryId ||

          (cat != null && (p.category_id === cat.slug || p.category?.slug === cat.slug))

        if (!matchesCategory) return false

      }

      if (!q) return true

      return (

        p.name.toLowerCase().includes(q) ||

        p.slug.toLowerCase().includes(q) ||

        (p.category?.name ?? '').toLowerCase().includes(q)

      )

    })

  }, [products, search, categoryId])



  const dirtyCount = dirtyIds.size



  const syncDirty = (id: string, priceValue: string, stockValue: string) => {

    const product = products.find((p) => p.id === id)

    if (!product) return



    setDirtyIds((prev) => {

      const next = new Set(prev)

      if (isProductDirty(product, priceValue, stockValue)) next.add(id)

      else next.delete(id)

      return next

    })

  }



  const setPrice = (id: string, value: string) => {

    setPrices((prev) => ({ ...prev, [id]: value }))

    setSaved(false)

    syncDirty(id, value, stocks[id] ?? '')

  }



  const setStock = (id: string, value: string) => {

    setStocks((prev) => ({ ...prev, [id]: value }))

    setSaved(false)

    syncDirty(id, prices[id] ?? '', value)

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

              .update({

                price: priceUpdates[id],

                stock: stockUpdates[id],

                updated_at: new Date().toISOString(),

              })

              .eq('id', id),

          ),

        )

        const failed = results.find((r) => r.error)

        if (failed?.error) throw failed.error

      }

      setDirtyIds(new Set())

      setSaved(true)

      refetch()

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Fiyat ve stok bilgileri kaydedilemedi.')

    } finally {

      setSaving(false)

    }

  }



  return (

    <div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">

            <Banknote className="h-6 w-6 text-accent-600" />

            Hızlı Fiyat ve Stok Güncelleme

          </h1>

          <p className="mt-1 text-sm text-muted">

            Tüm ürün fiyatlarını ve opsiyonel stok bilgilerini tek ekrandan güncelleyin.

          </p>

        </div>

        <Link to="/admin/panel/urunler" className="text-sm font-medium text-accent-600 hover:underline">

          ← Ürün yönetimine dön

        </Link>

      </div>



      {usingDemo && (

        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">

          Demo mod — fiyat ve stok bilgileri tarayıcıda saklanır ve sitede görünür.

        </div>

      )}



      {error && (

        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>

      )}

      {saved && (

        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">

          {dirtyCount === 0 ? 'Fiyat ve stok bilgileri kaydedildi.' : ''}

        </div>

      )}



      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">

        <div className="relative flex-1">

          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <input

            type="search"

            value={search}

            onChange={(e) => setSearch(e.target.value)}

            placeholder="Ürün ara..."

            className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20"

          />

        </div>

        <select

          value={categoryId}

          onChange={(e) => setCategoryId(e.target.value)}

          className="rounded-xl border border-navy-900/10 px-4 py-2.5 text-sm outline-none focus:border-accent-600"

        >

          <option value="all">Tüm kategoriler</option>

          {categories.map((c) => (

            <option key={c.id} value={c.id}>

              {c.name}

            </option>

          ))}

        </select>

        <Button onClick={handleSave} disabled={saving || dirtyCount === 0}>

          <Save className="h-4 w-4" />

          {saving ? 'Kaydediliyor...' : `Kaydet${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}

        </Button>

      </div>



      {loading ? (

        <div className="flex justify-center py-20">

          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />

        </div>

      ) : filtered.length === 0 ? (

        <p className="mt-12 text-center text-muted">Eşleşen ürün bulunamadı.</p>

      ) : (

        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-900/5 bg-white shadow-sm">

          <table className="w-full text-left text-sm">

            <thead>

              <tr className="border-b border-navy-900/5 bg-surface/50">

                <th className="px-4 py-3 font-semibold text-navy-900">Ürün</th>

                <th className="hidden px-4 py-3 font-semibold text-navy-900 sm:table-cell">Kategori</th>

                <th className="px-4 py-3 font-semibold text-navy-900">Mevcut fiyat</th>

                <th className="px-4 py-3 font-semibold text-navy-900">Yeni fiyat (₺)</th>

                <th className="px-4 py-3 font-semibold text-navy-900">Mevcut stok</th>

                <th className="px-4 py-3 font-semibold text-navy-900">Yeni stok</th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((product) => {

                const isDirty = dirtyIds.has(product.id)

                return (

                  <tr

                    key={product.id}

                    className={`border-b border-navy-900/5 last:border-0 ${

                      isDirty ? 'bg-accent-50/50' : ''

                    }`}

                  >

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-3">

                        {product.image_url ? (

                          <img

                            src={product.image_url}

                            alt=""

                            className="h-10 w-10 shrink-0 rounded-lg object-cover"

                          />

                        ) : (

                          <div className="h-10 w-10 shrink-0 rounded-lg bg-surface" />

                        )}

                        <div className="min-w-0">

                          <p className="truncate font-medium text-navy-900">{product.name}</p>

                          <p className="truncate text-xs text-muted">{product.slug}</p>

                        </div>

                      </div>

                    </td>

                    <td className="hidden px-4 py-3 text-muted sm:table-cell">

                      {product.category?.name ?? '—'}

                    </td>

                    <td className="px-4 py-3 tabular-nums text-muted">

                      {formatPrice(product.price) ?? '—'}

                    </td>

                    <td className="px-4 py-3">

                      <Input

                        type="text"

                        inputMode="decimal"

                        value={prices[product.id] ?? ''}

                        onChange={(e) => setPrice(product.id, e.target.value)}

                        onKeyDown={(e) => {

                          if (e.key === 'Enter') {

                            e.preventDefault()

                            handleSave()

                          }

                        }}

                        placeholder="0"

                        className="max-w-[120px] tabular-nums"

                        aria-label={`${product.name} fiyatı`}

                      />

                    </td>

                    <td className="px-4 py-3 tabular-nums text-muted">

                      {formatStock(product.stock) ?? '—'}

                    </td>

                    <td className="px-4 py-3">

                      <Input

                        type="number"

                        min={0}

                        step={1}

                        value={stocks[product.id] ?? ''}

                        onChange={(e) => setStock(product.id, e.target.value)}

                        onKeyDown={(e) => {

                          if (e.key === 'Enter') {

                            e.preventDefault()

                            handleSave()

                          }

                        }}

                        placeholder="Opsiyonel"

                        className="max-w-[120px] tabular-nums"

                        aria-label={`${product.name} stok`}

                      />

                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

      )}



      {dirtyCount > 0 && (

        <div className="sticky bottom-4 mt-6 flex justify-end">

          <Button size="lg" onClick={handleSave} disabled={saving}>

            <Save className="h-4 w-4" />

            {saving ? 'Kaydediliyor...' : `${dirtyCount} ürünü kaydet`}

          </Button>

        </div>

      )}

    </div>

  )

}


