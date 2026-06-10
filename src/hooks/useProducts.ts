import { useCallback, useEffect, useState } from 'react'

import {

  getSupabase,

  isSupabaseConfigured,

  withFetchTimeout,

  type Category,

  type Product,

} from '@/lib/supabase'

import { normalizeProductStock } from '@/lib/stock'

import { withSyncedProductImages } from '@/lib/product-images'



function mapProduct(row: Product): Product {

  return withSyncedProductImages({

    ...row,

    price: row.price != null ? Number(row.price) : null,

    stock: normalizeProductStock(row.stock),

  })

}



export function useProducts(options?: { includeInactive?: boolean }) {

  const [products, setProducts] = useState<Product[]>([])

  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(isSupabaseConfigured)

  const [error, setError] = useState<string | null>(null)



  const fetchData = useCallback(async () => {

    setLoading(true)

    setError(null)



    if (!isSupabaseConfigured) {

      setProducts([])

      setCategories([])

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

            .order('created_at', { ascending: false })

            .order('sort_order', { ascending: true }),

        ]),

      )



      if (catRes.error) throw catRes.error

      if (prodRes.error) throw prodRes.error



      let prods = ((prodRes.data ?? []) as Product[]).map(mapProduct)

      if (!options?.includeInactive) {

        prods = prods.filter((p) => p.is_active)

      }



      setProducts(prods)

      setCategories(catRes.data ?? [])

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Veriler yüklenemedi')

      setProducts([])

      setCategories([])

    } finally {

      setLoading(false)

    }

  }, [options?.includeInactive])



  useEffect(() => {

    fetchData()

  }, [fetchData])



  return {

    products,

    categories,

    loading,

    error,

    usingDemo: !isSupabaseConfigured,

    refetch: fetchData,

  }

}



export function useProduct(slug: string) {

  const [product, setProduct] = useState<Product | null>(null)

  const [loading, setLoading] = useState(Boolean(slug))



  useEffect(() => {

    async function load() {

      if (!slug) return



      if (!isSupabaseConfigured) {

        setProduct(null)

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

        setProduct(null)

      } else {

        setProduct(mapProduct(data as Product))

      }

      setLoading(false)

    }

    load()

  }, [slug])



  return { product, loading }

}


