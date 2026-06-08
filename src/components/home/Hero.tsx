import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, Clock, ShieldCheck } from 'lucide-react'
import { images } from '@/data/images'
import { useSiteData } from '@/contexts/SiteDataContext'
import { Button } from '@/components/ui/Button'

const trustIcons = [ShieldCheck, Clock, Award]

const collage = [
  { id: 'warehouse', src: images.hero.warehouse, alt: 'Depo ve tedarik', span: 'row-span-2', rotate: -1 },
  { id: 'ppe', src: images.hero.ppe, alt: 'İş güvenliği ekipmanları', span: '', rotate: 2 },
  { id: 'supply', src: images.hero.supply, alt: 'Kurumsal tedarik ve lojistik', span: '', rotate: -2 },
] as const

export function Hero() {
  const { settings, getSection } = useSiteData()
  const section = getSection('home', 'hero') as {
    badge?: string
    trustItems?: string[]
    intro?: string
  }
  const statsSection = getSection('home', 'stats') as {
    items?: { value: number; suffix: string; label: string }[]
  }

  const trustItems = section.trustItems?.length
    ? section.trustItems
    : ['CE / TSE uyumlu ürünler', '48 saat hızlı tedarik', '9 yılı aşkın sektör deneyimi']

  const miniStats = statsSection.items?.slice(0, 3).map((s) => ({
    value: `${s.value}${s.suffix}`,
    label: s.label,
  })) ?? [
    { value: '100+', label: 'Ürün' },
    { value: '9+', label: 'Yıl' },
    { value: '1200+', label: 'Müşteri' },
  ]

  return (
    <section className="relative overflow-hidden bg-white section-grid">
      <div className="absolute right-0 top-0 h-[420px] w-[420px] translate-x-1/4 -translate-y-1/4 bg-navy-900/[0.03]" />

      <div className="relative mx-auto max-w-7xl px-6 pb-0 pt-28 lg:px-8 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
              {section.badge ?? 'Kurumsal tedarik'}
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
              {settings.company_name}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              {section.intro ??
                `${settings.slogan}. Fabrika, saha ve ofisleriniz için temizlik ve iş güvenliği çözümlerini tek noktadan sunuyoruz.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link to="/e-katalog">
                <Button size="lg">
                  E-Kataloğu Keşfet
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/iletisim">
                <Button variant="outline" size="lg">
                  Teklif Alın
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-navy-900/8 pt-8">
              {miniStats.map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-extrabold text-navy-900">{item.value}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mx-auto w-full max-w-xl lg:max-w-none lg:mx-0">
            <div className="grid h-[280px] grid-cols-2 grid-rows-2 gap-3 sm:h-[360px] sm:gap-4 lg:h-[400px]">
              {collage.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className={`h-full min-h-0 ${item.span}`}
                  style={{ rotate: `${item.rotate}deg` }}
                >
                  <div className="relative h-full overflow-hidden rounded-lg border border-navy-900/10 shadow-lg shadow-navy-900/10">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-16 bg-navy-900">
        <div className="mx-auto flex max-w-7xl flex-col divide-y divide-white/10 sm:flex-row sm:divide-x sm:divide-y-0">
          {trustItems.map((label, i) => {
            const Icon = trustIcons[i % trustIcons.length]
            return (
              <div
                key={label}
                className="flex flex-1 items-center gap-3 px-6 py-5 text-sm text-white/90 lg:px-8"
              >
                <Icon className="h-5 w-5 shrink-0 text-accent-400" />
                <span className="font-medium">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
