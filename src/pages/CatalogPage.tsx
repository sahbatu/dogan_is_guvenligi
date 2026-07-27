import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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
import type { Category, Product } from '@/lib/supabase'

const PAGE_SIZE = 20

interface CategoryTreeNode {
  cat: Category
  children: Category[]
  productCount: number
}

function buildCategoryTree(categories: Category[], products: Product[]): CategoryTreeNode[] {
  const countBySlug = new Map<string, number>()
  for (const p of products) {
    const slug = p.category?.slug
    if (slug) countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1)
  }
  const parents = categories.filter((c) => !c.parent_id)
  const childrenByParent = new Map<string, Category[]>()
  for (const c of categories) {
    if (!c.parent_id) continue
    const list = childrenByParent.get(c.parent_id) ?? []
    list.push(c)
    childrenByParent.set(c.parent_id, list)
  }
  return parents.map((cat) => {
    const children = childrenByParent.get(cat.id) ?? []
    const productCount =
      (countBySlug.get(cat.slug) ?? 0) +
      children.reduce((sum, ch) => sum + (countBySlug.get(ch.slug) ?? 0), 0)
    return { cat, children, productCount }
  })
}

export function CatalogPage() {
  const { settings } = useSiteData()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, categories, loading } = useProducts()
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

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('sayfa')
      return next
    })
  }

  const tree = useMemo(() => buildCategoryTree(categories, products), [categories, products])

  const activeParentSlug = useMemo(() => {
    if (!selectedCategory) return null
    const selected = categories.find((c) => c.slug === selectedCategory)
    if (!selected) return null
    if (!selected.parent_id) return selected.slug
    const parent = categories.find((c) => c.id === selected.parent_id)
    return parent?.slug ?? null
  }, [categories, selectedCategory])

  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (activeParentSlug) {
      setExpandedParents((prev) => {
        if (prev.has(activeParentSlug)) return prev
        const next = new Set(prev)
        next.add(activeParentSlug)
        return next
      })
    }
  }, [activeParentSlug])

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
      if (selected && !selected.parent_id) {
        const childIds = new Set(
          categories.filter((c) => c.parent_id === selected.id).map((c) => c.id),
        )
        childIds.add(selected.id)
        result = result.filter(
          (p) => (p.category_id && childIds.has(p.category_id)) || false,
        )
      } else {
        result = result.filter(
          (p) => p.category?.slug === selectedCategory || p.category_id === selectedCategory,
        )
      }
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
  }, [products, categories, selectedCategory, search])

  const pageParam = Number(searchParams.get('sayfa') ?? '1')
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, Number.isFinite(pageParam) ? pageParam : 1), totalPages)

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

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
        <div className="mt-10 max-w-xl">
          <CatalogSearch
            variant="hero"
            value={search}
            onChange={handleSearchChange}
            placeholder="Ürün adı ile arayın..."
          />
        </div>
      </PageHeader>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14 xl:grid-cols-[280px_1fr]">
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
                  {tree.map(({ cat, children, productCount }) => {
                    const expanded =
                      expandedParents.has(cat.slug) || activeParentSlug === cat.slug
                    return (
                      <div key={cat.id}>
                        <ParentNavItem
                          active={selectedCategory === cat.slug}
                          expanded={expanded}
                          onSelect={() => handleCategory(cat.slug)}
                          onToggle={() => toggleParent(cat.slug)}
                          count={productCount}
                          hasChildren={children.length > 0}
                        >
                          {cat.name}
                        </ParentNavItem>
                        {expanded && children.length > 0 && (
                          <div className="ml-3 border-l border-navy-900/10 pl-1">
                            {children.map((child) => {
                              const count = products.filter(
                                (p) => p.category?.slug === child.slug,
                              ).length
                              return (
                                <CategoryNavItem
                                  key={child.id}
                                  active={selectedCategory === child.slug}
                                  onClick={() => handleCategory(child.slug)}
                                  count={count}
                                  compact
                                >
                                  {child.name}
                                </CategoryNavItem>
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
              <FadeIn className="mb-8 space-y-5 lg:hidden">
                <CatalogSearch value={search} onChange={handleSearchChange} />
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
                    onClick={() => handleSearchChange('')}
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
        'group flex w-full items-start border-l-2 pr-1 transition-colors',
        active
          ? 'border-navy-900 font-semibold text-navy-900'
          : 'border-transparent text-navy-900/80 hover:border-navy-900/20 hover:text-navy-900',
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
            active ? 'text-navy-900/50' : 'text-muted/60 group-hover:text-muted',
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
          className="ml-1 mt-2 shrink-0 rounded p-1 text-muted/70 hover:bg-navy-900/5 hover:text-navy-900"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  )
}
