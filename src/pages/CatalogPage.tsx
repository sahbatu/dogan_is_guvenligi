import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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
import type { Category, Product } from '@/lib/supabase'

const PAGE_SIZE = 16
type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

interface CategoryTreeNode {
  cat: Category
  children: Category[]
  productCount: number
}

// Bazı eski kategoriler veri tabanında üst kategori atanmadan oluşturulmuş.
// Katalogta bunları kullanıcı için anlamlı ana başlıklar altında gösteriyoruz.
const virtualParentBySlug: Record<string, string> = {
  'ankastre-sivi-sabun-ve-kopuk-sabun-dispenserleri': 'hijyen-aparatlari',
  'bone-galos-dispenserleri': 'hijyen-aparatlari',
  'cop-kovalari': 'cop-atik-posetleri',
  'fotoselli-el-ve-yuz-kurutma-cihazi': 'hijyen-aparatlari',
  'havlu-dispenserleri': 'hijyen-aparatlari',
  'klozet-fircalari': 'paspas-perdeler',
  'klozet-kapak-ortusu-dispenserleri': 'hijyen-aparatlari',
  'kopuk-sabun-dispenserleri': 'hijyen-aparatlari',
  'krom-kullukler': 'cop-atik-posetleri',
  'metal-yercek-ve-camcek-dispenserleri': 'paspas-perdeler',
  'nano-hijyen-dispenserleri-ve-koku-likitleri': 'hijyen-aparatlari',
  'pecetelikler': 'hijyen-aparatlari',
  'pisuvar-suzgecler': 'hijyen-aparatlari',
  'plastik-bardak-ve-karton-bardak-dispenserleri': 'hijyen-aparatlari',
  'sivi-sabun-dispenserleri': 'hijyen-aparatlari',
  'strec-dispenserleri': 'hijyen-aparatlari',
  'trigerli-sivi-puskurtuculeri-oda-kokulari': 'hijyen-aparatlari',
  'tuvalet-kagidi-dispenserleri': 'hijyen-aparatlari',
}

function compareCategories(left: Category, right: Category): number {
  return left.name.localeCompare(right.name, 'tr-TR', { sensitivity: 'base' })
}

function descendantCategoryIds(categoryId: string, categories: Category[]): Set<string> {
  const ids = new Set([categoryId])
  const queue = [categoryId]

  while (queue.length > 0) {
    const parentId = queue.shift()!
    const parent = categories.find((category) => category.id === parentId)
    for (const category of categories) {
      const isVirtualChild = parent && virtualParentBySlug[category.slug] === parent.slug
      if ((category.parent_id === parentId || isVirtualChild) && !ids.has(category.id)) {
        ids.add(category.id)
        queue.push(category.id)
      }
    }
  }

  return ids
}

function buildCategoryTree(categories: Category[], products: Product[]): CategoryTreeNode[] {
  const countBySlug = new Map<string, number>()
  for (const p of products) {
    const slug = p.category?.slug
    if (slug) countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1)
  }
  const parents = categories
    .filter((category) => !category.parent_id && !virtualParentBySlug[category.slug])
    .sort(compareCategories)
  const childrenByParent = new Map<string, Category[]>()
  for (const c of categories) {
    if (!c.parent_id) continue
    const list = childrenByParent.get(c.parent_id) ?? []
    list.push(c)
    childrenByParent.set(c.parent_id, list)
  }
  return parents.map((cat) => {
    const virtualChildren = categories.filter((category) => virtualParentBySlug[category.slug] === cat.slug)
    const children = [...(childrenByParent.get(cat.id) ?? []), ...virtualChildren]
      .filter((category, index, list) => list.findIndex((item) => item.id === category.id) === index)
      .sort(compareCategories)
    const categoryIds = descendantCategoryIds(cat.id, categories)
    const productCount = categories
      .filter((category) => categoryIds.has(category.id))
      .reduce((sum, category) => sum + (countBySlug.get(category.slug) ?? 0), 0)
    return { cat, children, productCount }
  })
}

export function CatalogPage() {
  const { settings } = useSiteData()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, categories, loading } = useProducts({ compact: true })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('kategori'),
  )
  const [search, setSearch] = useState('')
  const sortOption = (searchParams.get('siralama') ?? 'default') as SortOption

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

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('sayfa')
      return next
    })
  }

  const handleSortChange = (value: SortOption) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete('sayfa')
      if (value === 'default') next.delete('siralama')
      else next.set('siralama', value)
      return next
    })
  }

  const tree = useMemo(() => buildCategoryTree(categories, products), [categories, products])

  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (!selectedCategory) return
    const ancestors = new Set<string>()
    let current = categories.find((category) => category.slug === selectedCategory)

    while (current) {
      const parent = current.parent_id
        ? categories.find((category) => category.id === current!.parent_id)
        : categories.find((category) => category.slug === virtualParentBySlug[current!.slug])
      if (!parent || ancestors.has(parent.slug)) break
      ancestors.add(parent.slug)
      current = parent
    }

    if (ancestors.size > 0) {
      setExpandedParents((previous) => new Set([...previous, ...ancestors]))
    }
  }, [categories, selectedCategory])

  const toggleParent = (slug: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const filtered = useMemo(() => {
    let result = products
    if (selectedCategory) {
      const selected = categories.find((c) => c.slug === selectedCategory)
      if (selected) {
        const childIds = descendantCategoryIds(selected.id, categories)
        result = result.filter(
          (p) => (p.category_id && childIds.has(p.category_id)) || false,
        )
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q),
      )
    }
    return result
  }, [products, categories, selectedCategory, search])

  const sortedProducts = useMemo(() => {
    const items = [...filtered]
    if (sortOption === 'name-asc') return items.sort((left, right) => left.name.localeCompare(right.name, 'tr-TR'))
    if (sortOption === 'name-desc') return items.sort((left, right) => right.name.localeCompare(left.name, 'tr-TR'))
    if (sortOption === 'price-asc') return items.sort((left, right) => (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY))
    if (sortOption === 'price-desc') return items.sort((left, right) => (right.price ?? Number.NEGATIVE_INFINITY) - (left.price ?? Number.NEGATIVE_INFINITY))
    return items
  }, [filtered, sortOption])

  const pageParam = Number(searchParams.get('sayfa') ?? '1')
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, Number.isFinite(pageParam) ? pageParam : 1), totalPages)

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedProducts.slice(start, start + PAGE_SIZE)
  }, [sortedProducts, currentPage])

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (target <= 1) next.delete('sayfa')
      else next.set('sayfa', String(target))
      return next
    })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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
        <div className="mt-10 hidden max-w-xl lg:block">
          <CatalogSearch
            variant="hero"
            value={search}
            onChange={handleSearchChange}
            placeholder="Ürün adı ile arayın..."
          />
        </div>
      </PageHeader>

      <section className="bg-white py-8 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14 xl:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <FadeIn>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Kategoriler
                </p>
                <nav className="mt-5 space-y-2 border-t border-navy-900/8 pt-5">
                  <CategoryNavItem
                    active={!selectedCategory}
                    onClick={() => handleCategory(null)}
                    count={products.length}
                  >
                    Tüm Ürünler
                  </CategoryNavItem>
                  {tree.map(({ cat, children, productCount }) => {
                    const expanded = expandedParents.has(cat.slug)
                    return (
                      <div key={cat.id}>
                        <ParentNavItem
                          active={selectedCategory === cat.slug}
                          expanded={expanded}
                          onSelect={() => {
                            const isCurrentParent = selectedCategory === cat.slug
                            handleCategory(cat.slug)
                            if (isCurrentParent) toggleParent(cat.slug)
                          }}
                          onToggle={() => toggleParent(cat.slug)}
                          count={productCount}
                          hasChildren={children.length > 0}
                        >
                          {cat.name}
                        </ParentNavItem>
                        {expanded && children.length > 0 && (
                          <div className="ml-3 border-l border-navy-900/10 pl-1">
                            {children.map((child) => {
                              const childCategoryIds = descendantCategoryIds(child.id, categories)
                              const count = products.filter(
                                (p) => p.category_id && childCategoryIds.has(p.category_id),
                              ).length
                              const grandchildren = categories
                                .filter((category) => category.parent_id === child.id || virtualParentBySlug[category.slug] === child.slug)
                                .sort(compareCategories)
                              const childExpanded = expandedParents.has(child.slug)

                              return (
                                <div key={child.id}>
                                  {grandchildren.length > 0 ? (
                                    <ParentNavItem
                                      active={selectedCategory === child.slug}
                                      expanded={childExpanded}
                                      onSelect={() => {
                                        handleCategory(child.slug)
                                        if (selectedCategory === child.slug) toggleParent(child.slug)
                                      }}
                                      onToggle={() => toggleParent(child.slug)}
                                      count={count}
                                      hasChildren
                                    >
                                      {child.name}
                                    </ParentNavItem>
                                  ) : (
                                    <CategoryNavItem active={selectedCategory === child.slug} onClick={() => handleCategory(child.slug)} count={count} compact>
                                      {child.name}
                                    </CategoryNavItem>
                                  )}
                                  {childExpanded && grandchildren.length > 0 && (
                                    <div className="ml-3 border-l border-navy-900/10 pl-1">
                                      {grandchildren.map((grandchild) => {
                                        const grandchildIds = descendantCategoryIds(grandchild.id, categories)
                                        const grandchildCount = products.filter((product) => product.category_id && grandchildIds.has(product.category_id)).length
                                        return <CategoryNavItem key={grandchild.id} active={selectedCategory === grandchild.slug} onClick={() => handleCategory(grandchild.slug)} count={grandchildCount} compact>{grandchild.name}</CategoryNavItem>
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>
              </FadeIn>
            </aside>

            <div>
              <FadeIn className="mb-6 space-y-4 rounded-xl border border-navy-900/8 bg-surface/40 p-3 lg:hidden">
                <CatalogSearch value={search} onChange={handleSearchChange} />
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={handleCategory}
                />
                <CatalogSortSelect value={sortOption} onChange={handleSortChange} fullWidth />
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
                <div className="flex items-center gap-4">
                  <CatalogSortSelect value={sortOption} onChange={handleSortChange} />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="text-xs font-semibold uppercase tracking-wider text-accent-600 hover:text-accent-500"
                  >
                    Aramayı temizle
                  </button>
                )}
                </div>
              </FadeIn>

              <div className="mb-8 flex items-center justify-between border-b border-navy-900/8 pb-4 lg:hidden">
                <h2 className="font-display text-lg font-bold text-navy-900">{activeCategoryName}</h2>
                <p className="text-xs text-muted">{!loading && `${filtered.length} ürün`}</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-6 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-surface" />
                      <div className="mt-3.5 h-4 w-2/3 bg-surface" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <ProductGrid products={pagedProducts} searchQuery={search} />
                  {totalPages > 1 && (
                    <FadeIn className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-navy-900/8 pt-6 sm:flex-row">
                      <p className="text-xs text-muted tabular-nums">
                        {(currentPage - 1) * PAGE_SIZE + 1}–
                        {Math.min(currentPage * PAGE_SIZE, filtered.length)} arası ·{' '}
                        toplam {filtered.length} ürün
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-xs font-medium text-navy-900 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Önceki sayfa"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Önceki
                        </button>
                        <span className="text-xs text-muted tabular-nums">
                          Sayfa {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-xs font-medium text-navy-900 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Sonraki sayfa"
                        >
                          Sonraki
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </FadeIn>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function CatalogSortSelect({ value, onChange, fullWidth = false }: { value: SortOption; onChange: (value: SortOption) => void; fullWidth?: boolean }) {
  return (
    <label className={cn('relative flex items-center gap-2 text-xs font-semibold text-muted', fullWidth && 'w-full')}>
      <ArrowDownUp className="h-4 w-4 shrink-0 text-accent-600" />
      <span className="sr-only">Sıralama</span>
      <select value={value} onChange={(event) => onChange(event.target.value as SortOption)} className={cn('appearance-none rounded-lg border border-navy-900/10 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-navy-900 outline-none transition focus:border-accent-600', fullWidth && 'w-full')}>
        <option value="default">Önerilen sıralama</option>
        <option value="name-asc">Ada göre A–Z</option>
        <option value="name-desc">Ada göre Z–A</option>
        <option value="price-asc">Fiyat: düşükten yükseğe</option>
        <option value="price-desc">Fiyat: yüksekten düşüğe</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted" />
    </label>
  )
}

function CategoryNavItem({
  active,
  onClick,
  count,
  compact = false,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  compact?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start justify-between gap-2 border-l-2 pr-2 text-left transition-colors',
        compact ? 'py-1.5 pl-3 text-[13px]' : 'py-2.5 pl-4 text-sm',
        active
          ? 'border-navy-900 font-semibold text-navy-900'
          : 'border-transparent text-muted hover:border-navy-900/20 hover:text-navy-900',
      )}
    >
      <span className="min-w-0 flex-1 break-words leading-snug">{children}</span>
      <span
        className={cn(
          'mt-0.5 shrink-0 text-xs tabular-nums transition-colors',
          active ? 'text-navy-900/50' : 'text-muted/60 group-hover:text-muted',
        )}
      >
        {count}
      </span>
    </button>
  )
}

function ParentNavItem({
  active,
  expanded,
  onSelect,
  onToggle,
  count,
  hasChildren,
  children,
}: {
  active: boolean
  expanded: boolean
  onSelect: () => void
  onToggle: () => void
  count: number
  hasChildren: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'group flex w-full items-start rounded-lg border px-1 transition-colors',
        active
          ? 'border-navy-900 bg-navy-900 font-semibold text-white shadow-sm'
          : 'border-navy-900/8 bg-white text-navy-900/80 hover:border-navy-900/20 hover:bg-surface hover:text-navy-900',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-start justify-between gap-2 py-2.5 pl-4 pr-2 text-left text-sm"
      >
        <span className="min-w-0 flex-1 break-words leading-snug">{children}</span>
        <span
          className={cn(
            'mt-0.5 shrink-0 text-xs tabular-nums',
            active ? 'text-white/65' : 'text-muted/60 group-hover:text-muted',
          )}
        >
          {count}
        </span>
      </button>
      {hasChildren && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? 'Alt kategorileri gizle' : 'Alt kategorileri göster'}
          className={cn('ml-1 mt-2 shrink-0 rounded p-1', active ? 'text-white/75 hover:bg-white/10 hover:text-white' : 'text-muted/70 hover:bg-navy-900/5 hover:text-navy-900')}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  )
}
