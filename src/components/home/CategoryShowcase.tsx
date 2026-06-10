import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield } from 'lucide-react'
import { images } from '@/data/images'
import { useSiteData } from '@/contexts/SiteDataContext'
import { FadeIn } from '@/components/ui/FadeIn'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { resolveStoragePublicUrl } from '@/lib/storage-url'

const defaultCategories = [
  {
    title: 'Temizlik Malzemeleri',
    slug: 'temizlik-malzemeleri',
    description: 'Endüstriyel deterjan, hijyen ve zemin bakım ürünleri',
    image: images.services.cleaning,
    icon: 'Sparkles' as const,
    count: '250+ ürün',
  },
  {
    title: 'İş Güvenliği Ekipmanları',
    slug: 'is-guvenligi-ekipmanlari',
    description: 'KKD, baret, eldiven, yelek ve iş ayakkabıları',
    image: images.services.safety,
    icon: 'Shield' as const,
    count: '250+ ürün',
  },
]

const iconMap = { Sparkles, Shield }

export function CategoryShowcase() {
  const { getSection } = useSiteData()
  const section = getSection('home', 'categories') as {
    eyebrow?: string
    title?: string
    items?: typeof defaultCategories
  }
  const categories = section.items?.length ? section.items : defaultCategories

  return (
    <section className="border-y border-navy-900/5 bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
              {section.eyebrow ?? 'Ürün Kategorileri'}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">
              {section.title ?? 'İhtiyacınıza göre keşfedin'}
            </h2>
          </div>
          <Link
            to="/e-katalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-accent-600"
          >
            Tüm katalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap] ?? Sparkles
            return (
              <FadeIn key={cat.slug} delay={i * 0.08}>
                <Link
                  to={`/e-katalog?kategori=${cat.slug}`}
                  className="group relative flex min-h-[280px] overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
                >
                  <OptimizedImage
                    src={resolveStoragePublicUrl(cat.image) ?? cat.image}
                    alt={cat.title}
                    width={640}
                    height={280}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="photo-overlay absolute inset-0" />
                  <div className="relative flex w-full flex-col justify-between p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {cat.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{cat.title}</h3>
                      <p className="mt-2 max-w-sm text-sm text-white/75">{cat.description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-400 group-hover:gap-3 transition-all">
                        Kategoriye Git
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
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
