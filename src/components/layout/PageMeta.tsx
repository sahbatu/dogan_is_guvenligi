import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { images } from '@/data/images'

interface PageMetaProps {
  title: string
  description?: string
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} | Doğan İş Güvenliği`
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }
  }, [title, description])

  return null
}

const bannerMap: Record<string, string> = {
  '/hakkimizda': images.banners.about,
  '/e-katalog': images.banners.catalog,
  '/blog': images.banners.blog,
  '/iletisim': images.banners.contact,
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
  banner?: string
}

export function PageHeader({ title, subtitle, children, banner }: PageHeaderProps) {
  const bg = banner ?? images.banners.about

  return (
    <section className="relative overflow-hidden pb-16 pt-28 lg:pb-20 lg:pt-32">
      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
      <div className="absolute inset-0 bg-navy-900/75" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
          Doğan İş Güvenliği
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-white/75">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  )
}

export { bannerMap }
