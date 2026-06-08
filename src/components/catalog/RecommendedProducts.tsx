import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { FadeIn } from '@/components/ui/FadeIn'
import type { Product } from '@/lib/supabase'

function pickRandomProducts(products: Product[], excludeSlug: string, count = 4): Product[] {
  const pool = products.filter((p) => p.slug !== excludeSlug)
  if (pool.length === 0) return []

  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

interface RecommendedProductsProps {
  currentSlug: string
  limit?: number
}

export function RecommendedProducts({ currentSlug, limit = 4 }: RecommendedProductsProps) {
  const { products, loading } = useProducts()

  const recommended = useMemo(
    () => pickRandomProducts(products, currentSlug, limit),
    [products, currentSlug, limit],
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
