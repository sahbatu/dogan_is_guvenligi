import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, PackageSearch } from 'lucide-react'
import type { Product } from '@/lib/supabase'
import { ProductPrice } from '@/components/catalog/ProductPrice'

interface ProductGridProps {
  products: Product[]
  searchQuery?: string
}

export function ProductGrid({ products, searchQuery }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-navy-900/8 bg-white py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
          <PackageSearch className="h-6 w-6 text-muted" />
        </div>
        <p className="mt-5 font-display text-lg font-semibold text-navy-900">Ürün bulunamadı</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {searchQuery
            ? `"${searchQuery}" için sonuç yok. Farklı bir kelime deneyin.`
            : 'Bu kategoride henüz ürün bulunmuyor.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-3 sm:gap-y-6 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-4">
      {products.map((product) => (
          <Link key={product.id} to={`/e-katalog/${product.slug}`} className="group block">
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <div className="relative aspect-square overflow-hidden bg-surface ring-1 ring-navy-900/[0.06] transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-navy-900/10">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    Görsel yok
                  </div>
                )}

                {product.category && (
                  <span className="absolute left-1 top-1 max-w-[calc(100%-0.5rem)] truncate bg-white/90 px-1 py-px text-[7px] font-semibold uppercase tracking-wide text-navy-900 backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2 sm:py-0.5 sm:text-[10px] sm:tracking-[0.14em]">
                    {product.category.name}
                  </span>
                )}

                <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-500 group-hover:bg-navy-950/10" />

                <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white text-navy-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-1.5 flex items-start justify-between gap-1 sm:mt-3 sm:gap-3">
                <h3 className="line-clamp-2 font-display text-[10px] font-semibold leading-tight text-navy-900 transition-colors group-hover:text-accent-600 sm:text-[15px] sm:leading-snug">
                  {product.name}
                </h3>
              </div>
              <div className="mt-0.5 sm:mt-1.5">
                <ProductPrice price={product.price} className="text-[10px] sm:text-sm" />
              </div>
            </motion.article>
          </Link>
      ))}
    </div>
  )
}
