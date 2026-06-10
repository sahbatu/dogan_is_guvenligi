import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { images } from '@/data/images'
import { useSiteData } from '@/contexts/SiteDataContext'
import { Button } from '@/components/ui/Button'
import { FadeIn } from '@/components/ui/FadeIn'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { resolveStoragePublicUrl } from '@/lib/storage-url'

export function CTA() {
  const { getSection } = useSiteData()
  const section = getSection('home', 'cta') as {
    title?: string
    description?: string
    primaryLabel?: string
    secondaryLabel?: string
    image?: string
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="overflow-hidden rounded-xl border border-navy-900/10 bg-white shadow-lg shadow-navy-900/5">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
                <h2 className="text-2xl font-bold text-navy-900 md:text-3xl lg:text-4xl">
                  {section.title ?? 'Ürün kataloğumuzu inceleyin'}
                </h2>
                <p className="mt-4 text-muted leading-relaxed">
                  {section.description ??
                    'Temizlik malzemelerinden iş güvenliği ekipmanlarına kadar geniş ürün yelpazemizi e-katalogumuzda keşfedin. Toplu tedarik için teklif alabilirsiniz.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/e-katalog">
                    <Button size="lg" variant="accent-line">
                      {section.primaryLabel ?? 'E-Kataloğa Git'}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/iletisim">
                    <Button variant="outline" size="lg">
                      {section.secondaryLabel ?? 'İletişime Geç'}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[240px] lg:min-h-full">
                <OptimizedImage
                  src={resolveStoragePublicUrl(section.image as string) ?? images.cta}
                  alt="Depo ve lojistik"
                  width={800}
                  height={480}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="photo-overlay absolute inset-0 lg:bg-gradient-to-r lg:from-white lg:via-transparent lg:to-transparent" />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
