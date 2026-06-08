import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/types/cms'

interface SiteLogoProps {
  settings: SiteSettings
  showSubtitle?: boolean
  variant?: 'light' | 'dark'
  className?: string
}

export function SiteLogo({
  settings,
  showSubtitle = true,
  variant = 'dark',
  className,
}: SiteLogoProps) {
  const subtitle = settings.logo_subtitle || 'İş Güvenliği'
  const isLight = variant === 'light'
  const hasLogoImage = !!settings.logo_url

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {hasLogoImage ? (
        <img
          src={settings.logo_url!}
          alt={settings.company_name}
          className="h-10 w-auto max-w-[220px] object-contain object-left sm:h-11 sm:max-w-[260px]"
        />
      ) : (
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-extrabold',
            isLight ? 'bg-white text-navy-900' : 'bg-navy-900 text-white',
          )}
        >
          {(settings.company_short_name || settings.company_name).charAt(0).toUpperCase()}
        </div>
      )}
      {showSubtitle && !hasLogoImage && (
        <div className="hidden sm:block">
          <span
            className={cn(
              'block text-base font-bold leading-none',
              isLight ? 'text-white' : 'text-navy-900',
            )}
          >
            {settings.company_short_name || settings.company_name}
          </span>
          <span
            className={cn(
              'mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em]',
              isLight ? 'text-white/55' : 'text-muted',
            )}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )
}
