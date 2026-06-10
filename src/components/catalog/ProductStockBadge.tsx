import { shouldShowPublicStock } from '@/lib/stock'
import { cn } from '@/lib/utils'

interface ProductStockBadgeProps {
  stock: number | null | undefined
  className?: string
}

export function ProductStockBadge({ stock, className }: ProductStockBadgeProps) {
  if (!shouldShowPublicStock(stock)) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700',
        className,
      )}
    >
      Stokta · {stock} adet
    </span>
  )
}
