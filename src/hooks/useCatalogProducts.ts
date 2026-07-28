import { useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured, withFetchTimeout, type Category, type Product } from '@/lib/supabase'
import { normalizeProductStock } from '@/lib/stock'
import { withSyncedProductImages } from '@/lib/product-images'

export type CatalogSort = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

interface Options {
  categorySlug: string | null
  search: string
  page: number
  pageSize: number
  sort: CatalogSort
}

function descendantIds(categoryId: string, categories: Category[]): string[] {
  const ids = new Set([categoryId])
  const queue = [categoryId]
  while (queue.length) {
    const parentId = queue.shift()!
    for (const category of categories) {
      if (category.parent_id === parentId && !ids.has(category.id)) {
        ids.add(category.id)
        queue.push(category.id)
      }
    }
  }
  return [...ids]
}

export function useCatalogProducts({ categorySlug, search, page, pageSize, sort }: Options) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      setLoading(true)
      const supabase = getSupabase()!
      const categoryResult = await withFetchTimeout(supabase.from('categories').select('*').order('name', { ascending: true }))
      if (categoryResult.error || cancelled) { if (!cancelled) setLoading(false); return }
      const loadedCategories = (categoryResult.data ?? []) as Category[]
      setCategories(loadedCategories)

      let query = supabase
        .from('products')
        .select('id,name,slug,price,stock,is_active,image_url,image_urls,category_id,created_at,sort_order,category:categories(id,name,slug,parent_id,sort_order)', { count: 'exact' })
        .eq('is_active', true)

      const selected = categorySlug ? loadedCategories.find((category) => category.slug === categorySlug) : null
      if (selected) query = query.in('category_id', descendantIds(selected.id, loadedCategories))
      if (search.trim()) query = query.ilike('name', `%${search.trim().replaceAll('%', '\\%').replaceAll('_', '\\_')}%`)

      if (sort === 'name-asc') query = query.order('name', { ascending: true })
      else if (sort === 'name-desc') query = query.order('name', { ascending: false })
      else if (sort === 'price-asc') query = query.order('price', { ascending: true, nullsFirst: false })
      else if (sort === 'price-desc') query = query.order('price', { ascending: false, nullsFirst: false })
      else query = query.order('created_at', { ascending: false }).order('sort_order', { ascending: true })

      const from = Math.max(0, (page - 1) * pageSize)
      const result = await withFetchTimeout(query.range(from, from + pageSize - 1))
      if (cancelled) return
      setProducts((result.data ?? []).map((row) => withSyncedProductImages({ ...(row as unknown as Product), price: row.price != null ? Number(row.price) : null, stock: normalizeProductStock(row.stock) })))
      setTotal(result.count ?? 0)
      setLoading(false)
    }
    load().catch(() => { if (!cancelled) { setProducts([]); setTotal(0); setLoading(false) } })
    return () => { cancelled = true }
  }, [categorySlug, page, pageSize, search, sort])

  return { categories, products, total, loading }
}
