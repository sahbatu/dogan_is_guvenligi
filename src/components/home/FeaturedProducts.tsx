import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/lib/supabase'
import { ProductPrice } from '@/components/catalog/ProductPrice'
import { FadeIn } from '@/components/ui/FadeIn'

interface FeaturedProductsProps {
  products: Product[]
}

const AUTOPLAY_MS = 4800

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled.slice(0, count)
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = useMemo(
    () => pickRandom(products.filter((product) => Boolean(product.image_url) && product.price != null), 8),
    [products],
  )

  const cardCount = Math.min(4, featured.length)
  const pageCount = Math.max(1, Math.ceil(featured.length / Math.max(1, cardCount)))
  const [activePage, setActivePage] = useState(0)

  useEffect(() => {
    setActivePage((page) => page % pageCount)
  }, [pageCount])

  useEffect(() => {
    if (pageCount <= 1) return
    const timer = window.setInterval(() => setActivePage((page) => (page + 1) % pageCount), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [pageCount])

  if (featured.length === 0) return null

  const visibleProducts = Array.from(
    { length: cardCount },
    (_, index) => featured[(activePage * cardCount + index) % featured.length],
  )

  return (
    <section className="border-y border-navy-900/5 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="flex flex-col gap-5 border-b border-navy-900/8 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-600">Katalogdan seçtiklerimiz</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">Öne çıkan ürünler</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">İşletmenizin günlük temizlik, hijyen ve iş güvenliği ihtiyaçları için öne çıkan ürünleri inceleyin.</p>
          </div>
          <Link to="/e-katalog" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-900 transition-colors hover:text-accent-600">Tüm ürünleri görüntüle <ArrowRight className="h-4 w-4" /></Link>
        </FadeIn>

        <div className="mt-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-4"
            >
              {visibleProducts.map((product, index) => <FeaturedProductCard key={product.id} product={product} delay={index * 0.06} />)}
            </motion.div>
          </AnimatePresence>
        </div>
        {pageCount > 1 && <div className="mt-7 flex justify-center gap-1.5">{Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" onClick={() => setActivePage(index)} aria-label={`Ürün grubu ${index + 1}`} className={index === activePage ? 'h-1.5 w-5 rounded-full bg-accent-600 transition-all' : 'h-1.5 w-1.5 rounded-full bg-navy-900/15 transition-all hover:bg-navy-900/35'} />)}</div>}
      </div>
    </section>
  )
}

function FeaturedProductCard({ product, delay }: { product: Product; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <Link to={`/e-katalog/${product.slug}`} className="group block">
        <div className="relative aspect-[4/4.6] overflow-hidden rounded-xl bg-surface ring-1 ring-navy-900/[0.06] transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-navy-900/10">
          <img src={product.image_url!} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {product.category && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-navy-900 shadow-sm backdrop-blur-sm">{product.category.name}</span>}
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
        </div>
        <div className="pt-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 transition-colors group-hover:text-accent-600 sm:text-[15px]">{product.name}</h3>
          <ProductPrice price={product.price} className="mt-1.5 block" />
        </div>
      </Link>
    </FadeIn>
  )
}
