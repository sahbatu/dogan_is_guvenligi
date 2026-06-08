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
          'absolute top-1/2 -translate-y-1/2 text-muted/70',
          isHero ? 'left-5 h-5 w-5' : 'left-4 h-4 w-4',
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full border bg-white text-navy-950 placeholder:text-muted/50 transition-all',
          'border-navy-900/10 focus:border-navy-900/30 focus:outline-none focus:ring-1 focus:ring-navy-900/10',
          isHero
            ? 'rounded-none border-white/20 py-4 pl-14 pr-12 text-base text-white placeholder:text-white/45 focus:border-white/40 focus:bg-white/5 focus:ring-white/20'
            : 'rounded-none py-3 pl-11 pr-10 text-sm',
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
