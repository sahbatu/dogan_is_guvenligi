import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/supabase'
import { ProductPrice } from '@/components/catalog/ProductPrice'
import { FadeIn } from '@/components/ui/FadeIn'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 4500
const SLIDE_EASE = [0.32, 0.72, 0, 1] as const

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = products.slice(0, 8)
  const count = featured.length
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const activeRef = useRef(active)
  activeRef.current = active

  const goTo = useCallback(
    (index: number, forcedDirection?: number) => {
      if (count === 0) return
      const nextIndex = (index + count) % count
      const current = activeRef.current

      if (forcedDirection !== undefined) {
        setDirection(forcedDirection)
      } else if (nextIndex !== current) {
        const forward = (nextIndex - current + count) % count
        const backward = (current - nextIndex + count) % count
        setDirection(forward <= backward ? 1 : -1)
      }

      setActive(nextIndex)
    },
    [count],
  )

  const next = useCallback(() => goTo(active + 1, 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1, -1), [active, goTo])

  useEffect(() => {
    if (count === 0) return
    setActive((a) => (a >= count ? 0 : a))
  }, [count])

  useEffect(() => {
    if (paused || count <= 1) return
    const timer = setInterval(() => {
      setDirection(1)
      setActive((a) => (a + 1) % count)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, count])

  if (count === 0) return null

  const prevIdx = (active - 1 + count) % count
  const nextIdx = (active + 1) % count
  const showSides = count > 1

  return (
    <section
      className="border-y border-navy-900/5 bg-surface/50 py-10 lg:py-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-navy-900">Öne çıkan ürünler</h2>
          <Link
            to="/e-katalog"
            className="flex items-center gap-1 text-sm font-semibold text-accent-600 hover:text-accent-500"
          >
            Tüm katalog
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="relative px-2 sm:px-10">
          {showSides && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-navy-900/10 bg-white text-navy-900 shadow-sm transition hover:bg-surface"
                aria-label="Önceki ürün"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-navy-900/10 bg-white text-navy-900 shadow-sm transition hover:bg-surface"
                aria-label="Sonraki ürün"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {showSides && (
                <CarouselSlot
                  product={featured[prevIdx]}
                  slot="left"
                  direction={direction}
                  onClick={() => goTo(prevIdx, -1)}
                  className="hidden sm:block"
                />
              )}

              <CarouselSlot
                product={featured[active]}
                slot="center"
                direction={direction}
              />

              {showSides && count > 2 && (
                <CarouselSlot
                  product={featured[nextIdx]}
                  slot="right"
                  direction={direction}
                  onClick={() => goTo(nextIdx, 1)}
                  className="hidden sm:block"
                />
              )}
            </div>
          </div>
        </div>

        {showSides && (
          <div className="mt-6 flex justify-center gap-1.5">
            {featured.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-4 bg-accent-600' : 'w-1.5 bg-navy-900/15',
                )}
                aria-label={`Ürün ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const centerVariants = {
  enter: (dir: number) => ({
    x: dir * 120,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir * -120,
    opacity: 0,
    scale: 0.92,
  }),
}

const sideVariants = {
  enter: (dir: number) => ({
    x: dir * 48,
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir * -48,
    opacity: 0,
  }),
}

function CarouselSlot({
  product,
  slot,
  direction,
  onClick,
  className,
}: {
  product: Product
  slot: 'left' | 'center' | 'right'
  direction: number
  onClick?: () => void
  className?: string
}) {
  const isCenter = slot === 'center'

  return (
    <div
      className={cn(
        'relative shrink-0',
        isCenter
          ? 'z-10 w-[min(72vw,300px)]'
          : 'z-0 w-[180px] blur-[4px] transition-[filter] duration-500 hover:blur-[2px]',
        !isCenter && onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={product.id}
          custom={direction}
          variants={isCenter ? centerVariants : sideVariants}
          initial="enter"
          animate={isCenter ? 'center' : 'visible'}
          exit="exit"
          transition={{ duration: 0.42, ease: SLIDE_EASE }}
          className={cn(!isCenter && 'opacity-50 hover:opacity-70')}
        >
          <ProductCard product={product} focused={isCenter} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ProductCard({ product, focused }: { product: Product; focused: boolean }) {
  return (
    <Link
      to={`/e-katalog/${product.slug}`}
      onClick={(e) => {
        if (!focused) e.preventDefault()
      }}
      className={cn(
        'group block overflow-hidden rounded-xl bg-white transition-shadow duration-300',
        focused
          ? 'shadow-lg shadow-navy-900/10 ring-1 ring-navy-900/8 hover:shadow-xl'
          : 'shadow-sm ring-1 ring-navy-900/5',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={cn(
              'h-full w-full object-cover transition-transform duration-500',
              focused && 'group-hover:scale-105',
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">Görsel yok</div>
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600">
            {product.category.name}
          </span>
        )}
        <h3
          className={cn(
            'mt-1 font-bold leading-snug text-navy-900',
            focused ? 'text-base group-hover:text-accent-600' : 'text-sm line-clamp-2',
          )}
        >
          {product.name}
        </h3>
        <div className="mt-1.5">
          <ProductPrice price={product.price} />
        </div>
      </div>
    </Link>
  )
}
