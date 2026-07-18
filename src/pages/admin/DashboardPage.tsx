import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Package, Banknote, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { formatStock } from '@/lib/stock'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const PAGE_SIZE = 20

export function DashboardPage() {
  const { products, categories, loading, refetch } = useProducts({ includeInactive: true })
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR')
    if (!q) return products
    return products.filter((p) => {
      const name = (p.name ?? '').toLocaleLowerCase('tr-TR')
      const slug = (p.slug ?? '').toLocaleLowerCase('tr-TR')
      const cat = (p.category?.name ?? '').toLocaleLowerCase('tr-TR')
      const sku = (p.sku ?? '').toLocaleLowerCase('tr-TR')
      return name.includes(q) || slug.includes(q) || cat.includes(q) || sku.includes(q)
    })
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pagedProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteConfirm || !isSupabaseConfigured) return
    const supabase = getSupabase()!
    const { error: err } = await supabase.from('products').delete().eq('id', deleteConfirm.id)
    if (err) {
      setError(err.message)
      return
    }
    setDeleteConfirm(null)
    refetch()
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-muted">
            E-katalog ürünlerini ekleyin, düzenleyin veya silin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/panel/fiyatlar">
            <Button variant="outline">
              <Banknote className="h-4 w-4" />
              Hızlı Fiyat
            </Button>
          </Link>
          <Link to="/admin/panel/urunler/yeni">
            <Button disabled={categories.length === 0}>
              <Plus className="h-4 w-4" />
              Yeni Ürün
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-900/10 py-20">
          <Package className="h-12 w-12 text-muted/40" />
          <p className="mt-4 text-muted">Henüz ürün eklenmemiş.</p>
          <Link to="/admin/panel/urunler/yeni">
            <Button className="mt-4">
              <Plus className="h-4 w-4" />
              İlk Ürünü Ekle
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20"
              />
            </div>
            <p className="text-xs text-muted">
              {filteredProducts.length} ürün · Sayfa {currentPage} / {totalPages}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-900/10 py-16">
              <Search className="h-10 w-10 text-muted/40" />
              <p className="mt-3 text-sm text-muted">
                &ldquo;{search}&rdquo; ile eşleşen ürün bulunamadı.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/5 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-navy-900/5 bg-surface/50">
                      <th className="px-6 py-4 font-semibold text-navy-900">Görsel</th>
                      <th className="px-6 py-4 font-semibold text-navy-900">Ürün</th>
                      <th className="px-6 py-4 font-semibold text-navy-900">Kategori</th>
                      <th className="px-6 py-4 font-semibold text-navy-900">Fiyat</th>
                      <th className="px-6 py-4 font-semibold text-navy-900">Stok</th>
                      <th className="px-6 py-4 font-semibold text-navy-900">Durum</th>
                      <th className="px-6 py-4 font-semibold text-navy-900">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map((product) => (
                      <tr key={product.id} className="border-b border-navy-900/5 last:border-0">
                        <td className="px-6 py-4">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-xs text-muted">
                              —
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-navy-900">{product.name}</p>
                          <p className="text-xs text-muted">{product.slug}</p>
                        </td>
                        <td className="px-6 py-4 text-muted">
                          {product.category?.name ?? '—'}
                        </td>
                        <td className="px-6 py-4 font-medium tabular-nums text-navy-900">
                          {formatPrice(product.price) ?? '—'}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-muted">
                          {formatStock(product.stock) ?? '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {product.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/panel/urunler/${product.id}/duzenle`}
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-accent-600"
                              aria-label="Düzenle"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(product)}
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">
                    {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredProducts.length)} arası, toplam {filteredProducts.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-xs font-medium text-navy-900 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Önceki sayfa"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Önceki
                    </button>
                    <span className="text-xs text-muted tabular-nums">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-xs font-medium text-navy-900 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Sonraki sayfa"
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Ürünü Sil"
      >
        <p className="text-muted">
          <strong className="text-navy-900">{deleteConfirm?.name}</strong> ürününü silmek istediğinize emin misiniz?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>İptal</Button>
          <Button variant="danger" onClick={handleDelete}>Sil</Button>
        </div>
      </Modal>
    </div>
  )
}
