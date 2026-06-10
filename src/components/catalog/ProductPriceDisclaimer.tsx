import { cn } from '@/lib/utils'

interface ProductPriceDisclaimerProps {
  className?: string
}

export function ProductPriceDisclaimer({ className }: ProductPriceDisclaimerProps) {
  return (
    <p className={cn('mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-muted', className)}>
      <span>Liste fiyatı · KDV dahil değildir</span>
      <span>Fiyatlarımızda değişkenlik olabilir.</span>
    </p>
  )
}
