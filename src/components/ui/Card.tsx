import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm',
        hover && 'transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10',
        className,
      )}
    >
      {children}
    </div>
  )
}
