import { useState, useEffect, useCallback } from 'react'
import { Factory, Hospital, GraduationCap, Building2, HardHat, Briefcase, Truck, type LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { industries as defaultIndustries } from '@/data/placeholder'
import { useSiteData } from '@/contexts/SiteDataContext'
import { FadeIn } from '@/components/ui/FadeIn'
import { ProductPrice } from '@/components/catalog/ProductPrice'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/supabase'

const AUTOPLAY_MS = 5000
const industryIcons: LucideIcon[] = [Factory, Hospital, GraduationCap, Building2, HardHat, Briefcase, Truck]

interface IndustriesProps { products: Product[] }

const industryCategories: Record<string, string[]> = {
  fabrika: ['endustriyel-cozuculer', 'genel-yuzey-temizlik-urunleri', 'yer-isaretleme-bantlari'],
  hastane: ['dezenfektanlar-ve-antiseptikler', 'tibbi-atik-posetleri', 'bone-galos-dispenserleri'],
  okul: ['genel-yuzey-temizlik-urunleri', 'cop-posetleri', 'paspas'],
  otel: ['oda-parfumleri', 'konsantre-housekeeping-urunleri', 'tuvalet-banyo-temizlik-ve-hijyen-urunleri'],
  insaat: ['trafik-konileri', 'ikaz-seritleri', 'uyari-ve-yonlendirme-tabelalari'],
  ofis: ['krom-yanmaz-ve-masa-alti-cop-kovalari', 'geri-donusum-cop-kovalari', 'oda-parfumleri'],
  lojistik: ['kolon-ve-kose-koruyucular', 'kablo-koruyucular', 'otopark-arac-stoperleri'],
  depo: ['kolon-ve-kose-koruyucular', 'kablo-koruyucular', 'trafik-konileri'],
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i').replaceAll('ş', 's').replaceAll('ğ', 'g').replaceAll('ü', 'u').replaceAll('ö', 'o').replaceAll('ç', 'c')
}

function productsForIndustry(products: Product[], industryTitle: string): Product[] {
  const withImages = products.filter((product) => Boolean(product.image_url))
  const categories = Object.entries(industryCategories).find(([industry]) => normalize(industryTitle).includes(industry))?.[1]
  if (!categories) return []
  const selected = categories.map((slug) => withImages.find((product) => product.category?.slug === slug)).filter((product): product is Product => Boolean(product))
  if (selected.length === 3) return selected
  return [...selected, ...withImages.filter((product) => categories.includes(product.category?.slug ?? '') && !selected.some((item) => item.id === product.id))].slice(0, 3)
}

export function Industries({ products }: IndustriesProps) {
  const { getSection } = useSiteData()
  const section = getSection('home', 'industries') as { eyebrow?: string; title?: string; items?: { title: string; description: string }[] }
  const industries = section.items?.length ? section.items : defaultIndustries
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = industries.length

  const select = useCallback((index: number) => setActive(index), [])

  useEffect(() => {
    if (paused || count <= 1) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % count), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, count])

  return (
    <section className="border-y border-navy-900/8 bg-white py-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <FadeIn><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">{section.eyebrow ?? 'Sektörler'}</p><h2 className="mt-1 font-display text-lg font-bold text-navy-900 md:text-xl">{section.title ?? 'Hizmet verdiğimiz alanlar'}</h2></FadeIn>

        <FadeIn delay={0.04} className="mt-5 min-h-[570px] divide-y divide-navy-900/8 sm:min-h-[390px]">
          {industries.map((item, index) => {
            const Icon = industryIcons[index] ?? Factory
            const isActive = active === index
            return <div key={item.title} className={cn('py-2.5', isActive && 'sm:grid sm:grid-cols-[11rem_1fr] sm:items-start sm:gap-6 sm:py-3')}>
              <button type="button" onClick={() => select(index)} aria-pressed={isActive} className={cn('flex w-full items-center gap-2.5 rounded-md text-left transition-colors', isActive ? 'text-navy-900' : 'text-muted hover:text-navy-900')}>
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors', isActive ? 'bg-navy-900 text-white' : 'bg-surface text-navy-900/40')}><Icon className="h-3.5 w-3.5" strokeWidth={1.75} /></span>
                <span className="text-xs font-medium sm:text-sm">{item.title}</span>
              </button>
              <AnimatePresence initial={false}>
                {isActive && <motion.div key={item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-3 overflow-hidden sm:mt-0">
                  <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">{productsForIndustry(products, item.title).map((product) => <IndustryProductCard key={product.id} product={product} />)}</div>
                </motion.div>}
              </AnimatePresence>
            </div>
          })}
        </FadeIn>

        <FadeIn delay={0.08} className="mt-4 flex gap-1">{industries.map((item, index) => <button key={item.title} type="button" onClick={() => select(index)} aria-label={item.title} className={cn('h-0.5 rounded-full transition-all duration-300', index === active ? 'w-4 bg-navy-900' : 'w-1 bg-navy-900/15')} />)}</FadeIn>
      </div>
    </section>
  )
}

function IndustryProductCard({ product }: { product: Product }) {
  return <Link to={`/e-katalog/${product.slug}`} className="group flex min-w-0 gap-3 rounded-lg border border-navy-900/8 bg-surface/50 p-2 transition hover:border-accent-600/30 hover:bg-white hover:shadow-sm"><img src={product.image_url!} alt={product.name} className="h-16 w-16 shrink-0 rounded-md bg-white object-cover" /><div className="min-w-0 py-0.5">{product.category && <p className="truncate text-[9px] font-bold uppercase tracking-wider text-accent-600">{product.category.name}</p>}<h3 className="line-clamp-2 text-xs font-semibold leading-snug text-navy-900 group-hover:text-accent-600">{product.name}</h3><ProductPrice price={product.price} className="mt-1 block" /></div></Link>
}
