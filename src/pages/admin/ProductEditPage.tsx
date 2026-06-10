import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm'
import { buildProductPayload, resolveCategoryId } from '@/lib/product-payload'

export function ProductEditPage() {
  const { productId } = useParams<{ productId?: string }>()
  const navigate = useNavigate()
  const isNew = !productId
  const { products, categories, loading } = useProducts({ includeInactive: true })
  const product = productId ? products.find((p) => p.id === productId) : null
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ProductFormData) => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmamış. Demo modda ürün kaydı yapılamaz.')
      return
    }

    const supabase = getSupabase()!
    setError(null)

    const categoryId = resolveCategoryId(data.category_id ?? '', categories)
    if (!categoryId) {
      setError('Lütfen bir kategori seçin. Kategori yoksa önce Kategoriler bölümünden ekleyin.')
      return
    }

    const payload = buildProductPayload(data, categoryId)

    if (isNew) {
      const { error: err } = await supabase.from('products').insert(payload)
      if (err) {
        setError(err.message)
        return
      }
    } else {
      const { error: err } = await supabase
        .from('products')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', productId)
      if (err) {
        setError(err.message)
        return
      }
    }

    navigate('/admin/panel/urunler')
  }

  if (!isNew && !loading && !product) {
    return <Navigate to="/admin/panel/urunler" replace />
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        backTo="/admin/panel/urunler"
        backLabel="Ürünlere dön"
        title={isNew ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
        description={isNew ? 'E-kataloga yeni ürün ekleyin.' : product?.name}
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm lg:p-8">
        <ProductForm
          categories={categories}
          initial={product}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/panel/urunler')}
        />
      </div>
    </div>
  )
}
