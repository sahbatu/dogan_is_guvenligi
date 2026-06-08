import { useCallback, useEffect, useState } from 'react'
import {
  getSupabase,
  isSupabaseConfigured,
  withFetchTimeout,
  type Category,
  type Product,
} from '@/lib/supabase'
import { demoProducts } from '@/data/placeholder'
import { applyDemoPriceOverrides } from '@/lib/demo-prices'
import { withSyncedProductImages } from '@/lib/product-images'

function getDemoProducts(): Product[] {
  const products = demoProducts.map((p, i) => ({
    id: `demo-${i}`,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category_id: p.categorySlug,
    image_url: p.image_url,
    image_urls: p.image_url ? [p.image_url] : [],
    price: p.price ?? null,
    meta_title: null,
    meta_description: p.description?.slice(0, 160) ?? null,
    meta_robots: 'index,follow',
    canonical_path: null,
    og_title: null,
    og_description: null,
    og_image_url: p.image_url,
    og_type: 'product',
    twitter_card: 'summary_large_image',
    focus_keyword: null,
    schema_json: null,
    is_active: true,
    sort_order: i,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: p.categorySlug,
      name: p.categorySlug === 'temizlik-malzemeleri'
        ? 'Temizlik Malzemeleri'
        : 'İş Güvenliği Ekipmanları',
      slug: p.categorySlug,
    },
  }))
  return applyDemoPriceOverrides(products).map(withSyncedProductImages)
}

const demoCategories: Category[] = [
  { id: '1', name: 'Temizlik Malzemeleri', slug: 'temizlik-malzemeleri' },
  { id: '2', name: 'İş Güvenliği Ekipmanları', slug: 'is-guvenligi-ekipmanlari' },
]

export function useProducts(options?: { includeInactive?: boolean }) {
  const [products, setProducts] = useState<Product[]>(() =>
    isSupabaseConfigured ? [] : getDemoProducts(),
  )
  const [categories, setCategories] = useState<Category[]>(() =>
    isSupabaseConfigured ? [] : demoCategories,
  )
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [usingDemo, setUsingDemo] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      setProducts(getDemoProducts())
      setCategories(demoCategories)
      setUsingDemo(true)
      setLoading(false)
      return
    }

    const supabase = getSupabase()!
    try {
      const [catRes, prodRes] = await withFetchTimeout(
        Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase
            .from('products')
            .select('*, category:categories(*)')
            .order('sort_order')
            .order('created_at', { ascending: false }),
        ]),
      )

      if (catRes.error) throw catRes.error
      if (prodRes.error) throw prodRes.error

      let prods = ((prodRes.data ?? []) as Product[]).map((p) =>
        withSyncedProductImages({
          ...p,
          price: p.price != null ? Number(p.price) : null,
        }),
      )
      if (!options?.includeInactive) {
        prods = prods.filter((p) => p.is_active)
      }

      if (prods.length === 0 && (catRes.data ?? []).length === 0) {
        setProducts(getDemoProducts())
        setUsingDemo(true)
      } else {
        setProducts(prods)
        setUsingDemo(false)
      }
      setCategories(catRes.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Veriler yüklenemedi')
      setProducts(getDemoProducts())
      setUsingDemo(true)
    } finally {
      setLoading(false)
    }
  }, [options?.includeInactive])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { products, categories, loading, error, usingDemo, refetch: fetchData }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(() => {
    if (!slug || isSupabaseConfigured) return null
    return getDemoProducts().find((p) => p.slug === slug) ?? null
  })
  const [loading, setLoading] = useState(() => isSupabaseConfigured && Boolean(slug))

  useEffect(() => {
    async function load() {
      if (!slug) return

      if (!isSupabaseConfigured) {
        setProduct(getDemoProducts().find((p) => p.slug === slug) ?? null)
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = getSupabase()!
      const { data, error } = await withFetchTimeout(
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle(),
      )

      if (error || !data) {
        const demo = getDemoProducts().find((p) => p.slug === slug) ?? null
        setProduct(demo)
      } else {
        const row = data as Product
        setProduct(
          withSyncedProductImages({
            ...row,
            price: row.price != null ? Number(row.price) : null,
          }),
        )
      }
      setLoading(false)
    }
    load()
  }, [slug])

  return { product, loading }
}
