import { useState, useEffect, useCallback } from 'react'
import {
  Factory,
  Hospital,
  GraduationCap,
  Building2,
  HardHat,
  Briefcase,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { industries as defaultIndustries } from '@/data/placeholder'
import { useSiteData } from '@/contexts/SiteDataContext'
import { FadeIn } from '@/components/ui/FadeIn'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5000

const industryIcons: LucideIcon[] = [
  Factory,
  Hospital,
  GraduationCap,
  Building2,
  HardHat,
  Briefcase,
  Truck,
]

export function Industries() {
  const { getSection } = useSiteData()
  const section = getSection('home', 'industries') as {
    eyebrow?: string
    title?: string
    items?: { title: string; description: string }[]
  }
  const industries = section.items?.length ? section.items : defaultIndustries
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = industries.length

  const select = useCallback((index: number) => {
    setActive(index)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, count])

  return (
    <section
      className="border-y border-navy-900/8 bg-white py-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <FadeIn>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
            {section.eyebrow ?? 'Sektörler'}
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-navy-900 md:text-xl">
            {section.title ?? 'Hizmet verdiğimiz alanlar'}
          </h2>
        </FadeIn>

        <FadeIn delay={0.04} className="mt-5 divide-y divide-navy-900/8">
          {industries.map((item, i) => {
            const Icon = industryIcons[i] ?? Factory
            const isActive = active === i

            return (
              <div
                key={item.title}
                className={cn(
                  'py-2.5',
                  isActive && 'sm:grid sm:grid-cols-[11rem_1fr] sm:items-start sm:gap-6 sm:py-3',
                )}
              >
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md text-left transition-colors',
                    isActive ? 'text-navy-900' : 'text-muted hover:text-navy-900',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                      isActive ? 'bg-navy-900 text-white' : 'bg-surface text-navy-900/40',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-medium sm:text-sm">{item.title}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.p
                      key={item.title}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 overflow-hidden text-sm leading-relaxed text-muted sm:mt-0"
                    >
                      {item.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </FadeIn>

        <FadeIn delay={0.08} className="mt-4 flex gap-1">
          {industries.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => select(i)}
              aria-label={item.title}
              className={cn(
                'h-0.5 rounded-full transition-all duration-300',
                i === active ? 'w-4 bg-navy-900' : 'w-1 bg-navy-900/15',
              )}
            />
          ))}
        </FadeIn>
      </div>
    </section>
  )
}
