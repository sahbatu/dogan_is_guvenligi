import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield } from 'lucide-react'
import { images } from '@/data/images'
import { useSiteData } from '@/contexts/SiteDataContext'
import { FadeIn } from '@/components/ui/FadeIn'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import type { Category, Product } from '@/lib/supabase'

interface CategoryShowcaseProps {
  categories: Category[]
  products: Product[]
  loading?: boolean
}

function getShowcaseCategories(categories: Category[], products: Product[]) {
  const countByCategoryId = new Map<string, number>()
  const countBySlug = new Map<string, number>()

  for (const product of products) {
    if (product.category_id) countByCategoryId.set(product.category_id, (countByCategoryId.get(product.category_id) ?? 0) + 1)
    if (product.category?.slug) countBySlug.set(product.category.slug, (countBySlug.get(product.category.slug) ?? 0) + 1)
  }

  const countForCategory = (category: Category) => {
    const childIds = new Set(categories.filter((item) => item.parent_id === category.id).map((item) => item.id))
    childIds.add(category.id)
    const directCount = Array.from(childIds).reduce((total, id) => total + (countByCategoryId.get(id) ?? 0), 0)
    return directCount || (countBySlug.get(category.slug) ?? 0)
  }

  const parents = categories
    .filter((category) => !category.parent_id)
    .map((category) => ({ category, count: countForCategory(category) }))
    .filter((item) => products.length === 0 || item.count > 0)

  const source = parents.length >= 2
    ? parents
    : categories
      .map((category) => ({ category, count: countForCategory(category) }))
      .filter((item) => products.length === 0 || item.count > 0)

  return source
    .sort((left, right) => left.category.sort_order - right.category.sort_order || right.count - left.count)
    .slice(0, 2)
}

function categoryImage(name: string, index: number): string {
  const normalized = name
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')

  if (normalized.includes('havlu') || normalized.includes('dispenser')) {
    return '/images/categories/category-towel-dispenser.png'
  }
  if (normalized.includes('cop') || normalized.includes('atik') || normalized.includes('kova')) {
    return '/images/categories/category-waste-bins.png'
  }

  return index % 2 === 0 ? images.services.cleaning : images.services.safety
}

const initialCategories: { category: Category; count: number }[] = [
  {
    category: { id: 'initial-towel-dispensers', name: 'Havlu Dispenserleri', slug: 'havlu-dispenserleri', parent_id: null, sort_order: 0 },
    count: 61,
  },
  {
    category: { id: 'initial-waste-bins', name: 'Çöp Kovaları', slug: 'cop-kovalari', parent_id: null, sort_order: 1 },
    count: 60,
  },
]

export function CategoryShowcase({ categories, products, loading = false }: CategoryShowcaseProps) {
  const { getSection } = useSiteData()
  const section = getSection('home', 'categories') as { eyebrow?: string; title?: string }
  const showcaseCategories = useMemo(() => getShowcaseCategories(categories, products), [categories, products])

  const displayedCategories = showcaseCategories.length > 0
    ? showcaseCategories
    : loading ? initialCategories : []

  if (displayedCategories.length === 0) return null

  return (
    <section className="border-y border-navy-900/5 bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">{section.eyebrow ?? 'Ürün Kategorileri'}</p>
            <h2 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">{section.title ?? 'İhtiyacınıza göre keşfedin'}</h2>
          </div>
          <Link to="/e-katalog" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-accent-600">Tüm katalog<ArrowRight className="h-4 w-4" /></Link>
        </FadeIn>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {displayedCategories.map(({ category, count }, index) => {
            const Icon = index % 2 === 0 ? Sparkles : Shield
            const image = categoryImage(category.name, index)
            return (
              <FadeIn key={category.id} delay={index * 0.08}>
                <Link to={`/e-katalog?kategori=${encodeURIComponent(category.slug)}`} className="group relative flex min-h-[280px] overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl">
                  <OptimizedImage
                    src={image}
                    alt={category.name}
                    width={640}
                    height={280}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="photo-overlay absolute inset-0" />
                  <div className="relative flex w-full flex-col justify-between p-8">
                    <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><Icon className="h-5 w-5 text-white" /></div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">{count} ürün</span></div>
                    <div><h3 className="text-2xl font-bold text-white">{category.name}</h3><p className="mt-2 max-w-sm text-sm text-white/75">{category.name} kategorisindeki ürünleri keşfedin.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-all group-hover:gap-3">Kategoriye git<ArrowRight className="h-4 w-4" /></span></div>
                  </div>
                </Link>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
