import { cn } from '@/lib/utils'
import type { Category } from '@/lib/supabase'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onSelect: (slug: string | null) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const chips = [{ slug: null, name: 'Tümü' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => (
        <button
          key={chip.slug ?? 'all'}
          type="button"
          onClick={() => onSelect(chip.slug)}
          className={cn(
            'shrink-0 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-200',
            selected === chip.slug
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-navy-900/10 bg-white text-muted hover:border-navy-900/25 hover:text-navy-900',
          )}
        >
          {chip.name}
        </button>
      ))}
    </div>
  )
}
