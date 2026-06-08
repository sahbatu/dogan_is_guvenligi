import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent-line'
  size?: 'sm' | 'md' | 'lg'
}

const baseStyles =
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:transition-transform [&:hover_svg]:translate-x-1'

const variants = {
  primary: 'bg-navy-900 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-accent-600 text-white shadow-md hover:shadow-lg',
  ghost: 'text-navy-900 hover:bg-surface hover:scale-100',
  danger: 'bg-red-600 text-white shadow-md hover:bg-red-500',
  outline:
    'border-2 border-navy-900 text-navy-900 bg-white hover:bg-navy-900 hover:text-white',
  'accent-line':
    'bg-navy-900 text-white shadow-md border-b-[3px] border-accent-600 hover:bg-navy-800 hover:shadow-lg',
}

const fillVariants = {
  primary: 'bg-accent-600',
  secondary: 'bg-navy-900',
  outline: 'bg-navy-900',
  'accent-line': 'bg-accent-600',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const fillClass = fillVariants[variant as keyof typeof fillVariants]

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {fillClass && (
          <span
            className={cn(
              'absolute inset-0 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
              fillClass,
            )}
            aria-hidden
          />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )
  },
)
Button.displayName = 'Button'
