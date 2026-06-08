import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageMeta'
import { PageSeo } from '@/components/seo/PageSeo'
import { useSiteData } from '@/contexts/SiteDataContext'
import { useProducts } from '@/hooks/useProducts'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import { CatalogSearch } from '@/components/catalog/CatalogSearch'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { FadeIn } from '@/components/ui/FadeIn'
import { images } from '@/data/images'
import { cn } from '@/lib/utils'
import { stripHtml } from '@/lib/rich-text'

export function CatalogPage() {
  const { settings } = useSiteData()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, categories, loading, usingDemo } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('kategori'),
  )
  const [search, setSearch] = useState('')

  useEffect(() => {
    const cat = searchParams.get('kategori')
    setSelectedCategory(cat)
  }, [searchParams])

  const handleCategory = (slug: string | null) => {
    setSelectedCategory(slug)
    if (slug) {
      setSearchParams({ kategori: slug })
    } else {
      setSearchParams({})
    }
  }

  const filtered = useMemo(() => {
    let result = products
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory || p.category_id === selectedCategory,
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && stripHtml(p.description).toLowerCase().includes(q)),
      )
    }
    return result
  }, [products, selectedCategory, search])

  const activeCategoryName =
    categories.find((c) => c.slug === selectedCategory)?.name ?? 'Tüm Ürünler'

  return (
    <>
      <PageSeo
        path="/e-katalog"
        fallbackTitle="E-Katalog"
        fallbackDescription={`${settings.company_name} ürün kataloğu.`}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'E-Katalog', path: '/e-katalog' },
        ]}
      />
      <PageHeader
        title="E-Katalog"
        subtitle="Kurumsal temizlik ve iş güvenliği ürünleri."
        banner={images.banners.catalog}
      >
        <div className="mt-10 max-w-xl">
          <CatalogSearch
            variant="hero"
            value={search}
            onChange={setSearch}
            placeholder="Ürün adı ile arayın..."
          />
        </div>
      </PageHeader>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {usingDemo && (
            <div className="mb-8 border border-accent-600/15 bg-accent-600/5 px-4 py-2.5 text-xs font-medium text-accent-600">
              Demo modu — Supabase bağlandığında canlı ürünler gösterilir.
            </div>
          )}

          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 xl:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <FadeIn>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Kategoriler
                </p>
                <nav className="mt-5 space-y-0.5 border-t border-navy-900/8 pt-5">
                  <CategoryNavItem
                    active={!selectedCategory}
                    onClick={() => handleCategory(null)}
                    count={products.length}
                  >
                    Tüm Ürünler
                  </CategoryNavItem>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category?.slug === cat.slug).length
                    return (
                      <CategoryNavItem
                        key={cat.id}
                        active={selectedCategory === cat.slug}
                        onClick={() => handleCategory(cat.slug)}
                        count={count}
                      >
                        {cat.name}
                      </CategoryNavItem>
                    )
                  })}
                </nav>
              </FadeIn>
            </aside>

            <div>
              <FadeIn className="mb-8 space-y-5 lg:hidden">
                <CatalogSearch value={search} onChange={setSearch} />
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={handleCategory}
                />
              </FadeIn>

              <FadeIn className="mb-10 hidden items-end justify-between border-b border-navy-900/8 pb-6 lg:flex">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900">
                    {activeCategoryName}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {loading ? 'Yükleniyor...' : `${filtered.length} ürün`}
                  </p>
                </div>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-xs font-semibold uppercase tracking-wider text-accent-600 hover:text-accent-500"
                  >
                    Aramayı temizle
                  </button>
                )}
              </FadeIn>

              <div className="mb-8 flex items-center justify-between border-b border-navy-900/8 pb-4 lg:hidden">
                <h2 className="font-display text-lg font-bold text-navy-900">{activeCategoryName}</h2>
                <p className="text-xs text-muted">{!loading && `${filtered.length} ürün`}</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-3 sm:gap-y-6 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-surface" />
                      <div className="mt-3.5 h-4 w-2/3 bg-surface" />
                    </div>
                  ))}
                </div>
              ) : (
                <ProductGrid products={filtered} searchQuery={search} />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryNavItem({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center justify-between border-l-2 py-2.5 pl-4 pr-2 text-left text-sm transition-colors',
        active
          ? 'border-navy-900 font-semibold text-navy-900'
          : 'border-transparent text-muted hover:border-navy-900/20 hover:text-navy-900',
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          'text-xs tabular-nums transition-colors',
          active ? 'text-navy-900/50' : 'text-muted/60 group-hover:text-muted',
        )}
      >
        {count}
      </span>
    </button>
  )
}
