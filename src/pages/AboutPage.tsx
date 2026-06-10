import { PageHeader } from '@/components/layout/PageMeta'
import { PageSeo } from '@/components/seo/PageSeo'
import { useSiteData } from '@/contexts/SiteDataContext'
import { aboutContent } from '@/data/placeholder'
import { images } from '@/data/images'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/FadeIn'
import { Card } from '@/components/ui/Card'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface AboutData {
  intro?: string
  mission?: string
  vision?: string
  values?: { title: string; description: string }[]
  timeline?: { year: string; title: string; description: string }[]
}

export function AboutPage() {
  const { settings, getSection } = useSiteData()
  const data = { ...aboutContent, ...getSection('about', 'main') } as AboutData

  return (
    <>
      <PageSeo
        path="/hakkimizda"
        fallbackTitle="Hakkımızda"
        fallbackDescription={`${settings.company_name} hakkında bilgi edinin.`}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Hakkımızda', path: '/hakkimizda' },
        ]}
      />
      <PageHeader
        title="Hakkımızda"
        subtitle="Güvenilir tedarik, kaliteli ürünler ve müşteri odaklı hizmet anlayışı."
        banner={images.banners.about}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <FadeIn className="lg:col-span-3">
              <p className="text-lg leading-relaxed text-muted">{data.intro}</p>
              <p className="mt-6 text-lg leading-relaxed text-muted">{data.mission}</p>
              <p className="mt-6 text-lg leading-relaxed text-muted">{data.vision}</p>
            </FadeIn>
            <FadeIn delay={0.1} className="lg:col-span-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <OptimizedImage
                  src={images.about}
                  alt="Saha ve iş güvenliği"
                  width={640}
                  height={800}
                  className="h-full w-full object-cover"
                />
                <div className="photo-overlay absolute inset-0 flex flex-col justify-end p-8">
                  <p className="text-sm font-medium uppercase tracking-widest text-accent-400">
                    {settings.founded}&apos;den beri
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">Sektörün güvenilir adresi</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">Değerlerimiz</p>
            <h2 className="mt-3 text-3xl font-bold text-navy-900">Bizi biz yapan ilkeler</h2>
          </FadeIn>
          <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(data.values ?? []).map((value) => (
              <StaggerItem key={value.title}>
                <Card className="h-full rounded-xl border-navy-900/5 bg-white">
                  <h3 className="text-lg font-bold text-navy-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">Tarihçe</p>
            <h2 className="mt-3 text-3xl font-bold text-navy-900">Yolculuğumuz</h2>
          </FadeIn>
          <div className="relative mt-12 ml-2 space-y-10 border-l-2 border-navy-900/10 pl-8">
            {(data.timeline ?? []).map((item, i) => (
              <FadeIn key={item.year} delay={i * 0.06}>
                <div className="relative">
                  <span className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full bg-accent-600 ring-4 ring-white" />
                  <span className="text-sm font-bold text-accent-600">{item.year}</span>
                  <h3 className="mt-1 text-lg font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-muted">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
