import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { whyUsPoints as defaultPoints } from '@/data/placeholder'
import { useSiteData } from '@/contexts/SiteDataContext'
import { FadeIn } from '@/components/ui/FadeIn'

export function WhyUs() {
  const { getSection } = useSiteData()
  const section = getSection('home', 'why_us') as {
    eyebrow?: string
    title?: string
    description?: string
    points?: string[]
  }
  const points = section.points?.length ? section.points : defaultPoints

  return (
    <section className="py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <div className="shrink-0 lg:w-[38%]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
                {section.eyebrow ?? 'Neden Doğan?'}
              </p>
              <h2 className="mt-1.5 text-xl font-bold text-navy-900 md:text-2xl">
                {section.title ?? 'Kurumsal tedarikte güvenilir ortak'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {section.description ?? 'Temizlik ve iş güvenliği ihtiyaçlarınızı tek noktadan karşılıyoruz.'}
              </p>
              <Link
                to="/hakkimizda"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-accent-600"
              >
                Hakkımızda
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="grid flex-1 gap-2 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2 rounded-md px-1 py-1">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" />
                  <span className="text-sm text-navy-900">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
