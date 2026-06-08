import { stats as defaultStats } from '@/data/placeholder'
import { images } from '@/data/images'
import { useSiteData } from '@/contexts/SiteDataContext'
import { Counter } from '@/components/ui/Counter'
import { FadeIn } from '@/components/ui/FadeIn'

export function Stats() {
  const { getSection } = useSiteData()
  const section = getSection('home', 'stats') as {
    items?: { value: number; suffix: string; label: string }[]
  }
  const stats = section.items?.length ? section.items : defaultStats

  return (
    <section className="relative overflow-hidden">
      <img
        src={images.stats}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy-950/80" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.06} className="text-center">
              <p className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} duration={1.2} />
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/55 sm:text-sm">
                {stat.label}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
