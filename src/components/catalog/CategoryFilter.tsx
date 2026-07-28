import { useMemo, useState } from 'react'
import { ChevronDown, ListFilter, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/supabase'

interface CategoryFilterProps { categories: Category[]; selected: string | null; onSelect: (slug: string | null) => void }

const virtualParentBySlug: Record<string, string> = {
  'ankastre-sivi-sabun-ve-kopuk-sabun-dispenserleri': 'hijyen-aparatlari', 'bone-galos-dispenserleri': 'hijyen-aparatlari', 'cop-kovalari': 'cop-atik-posetleri', 'fotoselli-el-ve-yuz-kurutma-cihazi': 'hijyen-aparatlari', 'havlu-dispenserleri': 'hijyen-aparatlari', 'klozet-fircalari': 'paspas-perdeler', 'klozet-kapak-ortusu-dispenserleri': 'hijyen-aparatlari', 'kopuk-sabun-dispenserleri': 'hijyen-aparatlari', 'krom-kullukler': 'cop-atik-posetleri', 'metal-yercek-ve-camcek-dispenserleri': 'paspas-perdeler', 'nano-hijyen-dispenserleri-ve-koku-likitleri': 'hijyen-aparatlari', 'pecetelikler': 'hijyen-aparatlari', 'pisuvar-suzgecler': 'hijyen-aparatlari', 'plastik-bardak-ve-karton-bardak-dispenserleri': 'hijyen-aparatlari', 'sivi-sabun-dispenserleri': 'hijyen-aparatlari', 'strec-dispenserleri': 'hijyen-aparatlari', 'trigerli-sivi-puskurtuculeri-oda-kokulari': 'hijyen-aparatlari', 'tuvalet-kagidi-dispenserleri': 'hijyen-aparatlari',
}
const sortCategories = (items: Category[]) => [...items].sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const selectedName = categories.find((category) => category.slug === selected)?.name ?? 'Tüm kategoriler'
  const parents = useMemo(() => sortCategories(categories.filter((category) => !category.parent_id && !virtualParentBySlug[category.slug])), [categories])
  const searchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('tr-TR')
    return sortCategories(categories.filter((category) => !term || category.name.toLocaleLowerCase('tr-TR').includes(term)))
  }, [categories, query])
  const childrenOf = (category: Category) => sortCategories(categories.filter((item) => item.parent_id === category.id || virtualParentBySlug[item.slug] === category.slug))
  const choose = (slug: string | null) => { onSelect(slug); setOpen(false); setQuery('') }
  const toggle = (slug: string) => setExpanded((current) => { const next = new Set(current); next.has(slug) ? next.delete(slug) : next.add(slug); return next })

  const CategoryRow = ({ category, depth = 0 }: { category: Category; depth?: number }) => {
    const children = childrenOf(category)
    const isExpanded = expanded.has(category.slug)
    const active = selected === category.slug
    return <div className={depth ? 'ml-3 border-l border-navy-900/10 pl-2' : ''}>
      <div className={cn('flex items-center rounded-lg', active ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-surface')}>
        <button type="button" onClick={() => choose(category.slug)} className={cn('min-w-0 flex-1 px-3 text-left', depth === 2 ? 'py-2 text-[13px]' : 'py-3 text-sm', depth === 0 && 'font-semibold')}>{category.name}</button>
        {children.length > 0 && <button type="button" onClick={() => toggle(category.slug)} className="p-3" aria-label="Alt kategorileri göster"><ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} /></button>}
      </div>
      {isExpanded && children.length > 0 && children.map((child) => <CategoryRow key={child.id} category={child} depth={depth + 1} />)}
    </div>
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-lg border border-navy-900/10 bg-white px-3.5 py-3 text-left text-sm font-semibold text-navy-900"><span className="flex min-w-0 items-center gap-2"><ListFilter className="h-4 w-4 shrink-0 text-accent-600" /><span className="truncate">{selectedName}</span></span><span className="text-xs font-medium text-muted">Kategori seç</span></button>
    <Modal open={open} onClose={() => setOpen(false)} title="Kategori seçin" className="bottom-0 left-0 top-auto max-h-[82vh] max-w-none translate-x-0 translate-y-0 rounded-b-none p-5">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Kategori ara..." className="w-full rounded-lg border border-navy-900/10 bg-surface py-3 pl-10 pr-3 text-sm text-navy-900 outline-none focus:border-accent-600" /></div>
      <div className="mt-4 max-h-[55vh] space-y-1 overflow-y-auto pr-1"><button type="button" onClick={() => choose(null)} className={cn('flex w-full rounded-lg px-3 py-3 text-left text-sm font-semibold', !selected ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-surface')}>Tüm kategoriler</button>{query ? searchResults.map((category) => <button key={category.id} type="button" onClick={() => choose(category.slug)} className={cn('block w-full rounded-lg px-3 py-3 text-left text-sm', selected === category.slug ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-surface')}>{category.name}</button>) : parents.map((category) => <CategoryRow key={category.id} category={category} />)}</div>
    </Modal>
  </>
}
