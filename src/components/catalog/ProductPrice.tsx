import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProductPriceProps {
  price: number | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProductPrice({ price, size = 'sm', className }: ProductPriceProps) {
  const formatted = formatPrice(price)

  if (!formatted) {
    return (
      <span className={cn('text-muted', size === 'lg' ? 'text-sm' : 'text-xs', className)}>
        Fiyat için iletişime geçin
      </span>
    )
  }

  return (
    <span
      className={cn(
        'font-display font-bold tabular-nums text-navy-900',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-2xl md:text-3xl',
        className,
      )}
    >
      {formatted}
    </span>
  )
}
