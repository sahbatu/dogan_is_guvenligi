import { Sparkles, Shield, Building2, Headphones } from 'lucide-react'
import { services as defaultServices } from '@/data/placeholder'
import { images } from '@/data/images'
import { useSiteData } from '@/contexts/SiteDataContext'
import { FadeIn } from '@/components/ui/FadeIn'

const icons = { Sparkles, Shield, Building2, Headphones } as const

const serviceImages = [
  images.services.cleaning,
  images.services.safety,
  images.services.supply,
  images.services.consulting,
]

type ServiceItem = { title: string; description: string; icon: keyof typeof icons }

export function Services() {
  const { getSection } = useSiteData()
  const section = getSection('home', 'services') as {
    eyebrow?: string
    title?: string
    items?: ServiceItem[]
  }
  const services = section.items?.length ? section.items : defaultServices

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
            {section.eyebrow ?? 'Hizmetlerimiz'}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">
            {section.title ?? 'İhtiyacınıza uygun tedarik alanları'}
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:gap-5">
          <FadeIn className="lg:col-span-7 lg:row-span-2">
            <ServicePhotoCard
              service={services[0]}
              image={serviceImages[0]}
              Icon={icons[services[0].icon as keyof typeof icons] ?? Sparkles}
              large
            />
          </FadeIn>
          <FadeIn delay={0.08} className="lg:col-span-5">
            <ServicePhotoCard
              service={services[1]}
              image={serviceImages[1]}
              Icon={icons[services[1].icon as keyof typeof icons] ?? Shield}
            />
          </FadeIn>
          <FadeIn delay={0.12} className="lg:col-span-5">
            <ServicePhotoCard
              service={services[2]}
              image={serviceImages[2]}
              Icon={icons[services[2].icon as keyof typeof icons] ?? Building2}
            />
          </FadeIn>
          <FadeIn delay={0.16} className="lg:col-span-12 lg:row-start-3">
            <ServicePhotoCard
              service={services[3]}
              image={serviceImages[3]}
              Icon={icons[services[3].icon as keyof typeof icons] ?? Headphones}
              horizontal
            />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function ServicePhotoCard({
  service,
  image,
  Icon,
  large = false,
  horizontal = false,
}: {
  service: ServiceItem
  image: string
  Icon: typeof Sparkles
  large?: boolean
  horizontal?: boolean
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-xl ${
        large ? 'min-h-[320px] lg:min-h-[420px]' : horizontal ? 'min-h-[200px] lg:min-h-[220px]' : 'min-h-[200px]'
      } ${horizontal ? 'lg:flex' : ''}`}
    >
      <img
        src={image}
        alt={service.title}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-400 group-hover:scale-105 ${
          horizontal ? 'lg:w-1/2 lg:object-cover' : ''
        }`}
      />
      <div className="photo-overlay absolute inset-0" />
      <div
        className={`relative flex h-full flex-col justify-end p-6 ${
          large ? 'lg:p-8' : ''
        } ${horizontal ? 'lg:ml-auto lg:w-1/2 lg:justify-center lg:p-10' : ''}`}
      >
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">{service.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75 line-clamp-3">
          {service.description}
        </p>
      </div>
    </article>
  )
}
