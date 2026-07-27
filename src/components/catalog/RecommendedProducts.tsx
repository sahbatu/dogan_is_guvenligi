import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { FadeIn } from '@/components/ui/FadeIn'
import type { Category, Product } from '@/lib/supabase'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickRelatedProducts(
  products: Product[],
  categories: Category[],
  currentSlug: string,
  currentCategoryId: string | null,
  count: number,
): Product[] {
  const pool = products.filter((p) => p.slug !== currentSlug)
  if (pool.length === 0) return []

  if (!currentCategoryId) return shuffle(pool).slice(0, count)

  const currentCategory = categories.find((c) => c.id === currentCategoryId) ?? null
  const parentId = currentCategory?.parent_id ?? null

  const siblingCategoryIds = new Set<string>()
  if (parentId) {
    for (const c of categories) {
      if (c.parent_id === parentId && c.id !== currentCategoryId) {
        siblingCategoryIds.add(c.id)
      }
    }
  }

  const sameCategory: Product[] = []
  const sameParent: Product[] = []
  const others: Product[] = []
  for (const p of pool) {
    if (p.category_id === currentCategoryId) sameCategory.push(p)
    else if (p.category_id && siblingCategoryIds.has(p.category_id)) sameParent.push(p)
    else others.push(p)
  }

  const picked: Product[] = []
  for (const bucket of [sameCategory, sameParent, others]) {
    if (picked.length >= count) break
    for (const p of shuffle(bucket)) {
      picked.push(p)
      if (picked.length >= count) break
    }
  }
  return picked
}

interface RecommendedProductsProps {
  currentSlug: string
  currentCategoryId?: string | null
  limit?: number
}

export function RecommendedProducts({
  currentSlug,
  currentCategoryId = null,
  limit = 4,
}: RecommendedProductsProps) {
  const { products, categories, loading } = useProducts()

  const recommended = useMemo(
    () => pickRelatedProducts(products, categories, currentSlug, currentCategoryId, limit),
    [products, categories, currentSlug, currentCategoryId, limit],
  )

  if (loading || recommended.length === 0) return null

  return (
    <section className="border-t border-navy-900/8 bg-surface/40 py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <FadeIn className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              Keşfetmeye devam edin
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-navy-900 sm:text-2xl">
              Önerilen Ürünler
            </h2>
          </div>
          <Link
            to="/e-katalog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500"
          >
            Tüm katalog
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <ProductGrid products={recommended} />
      </div>
    </section>
  )
}
