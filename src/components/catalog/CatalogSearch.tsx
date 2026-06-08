import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  variant?: 'hero' | 'toolbar'
  placeholder?: string
  className?: string
}

export function CatalogSearch({
  value,
  onChange,
  variant = 'toolbar',
  placeholder = 'Ürün adı ile arayın...',
  className,
}: CatalogSearchProps) {
  const isHero = variant === 'hero'

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2',
          isHero ? 'left-5 h-5 w-5 text-white/50' : 'left-4 h-4 w-4 text-muted/70',
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-none border transition-all focus:outline-none focus:ring-1',
          isHero
            ? 'border-white/25 bg-white/10 py-4 pl-14 pr-12 text-base text-white backdrop-blur-sm placeholder:text-white/45 focus:border-white/40 focus:bg-white/15 focus:ring-white/20'
            : 'border-navy-900/10 bg-white py-3 pl-11 pr-10 text-sm text-navy-950 placeholder:text-muted/50 focus:border-navy-900/30 focus:ring-navy-900/10',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-1 transition-colors',
            isHero
              ? 'right-4 text-white/60 hover:text-white'
              : 'right-3 text-muted hover:text-navy-900',
          )}
          aria-label="Aramayı temizle"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
