import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArrowLeft, ChevronDown, ChevronUp, FileText, MessageCircle, PackageCheck, Tag } from 'lucide-react'

import { trackPageView } from '@/lib/analytics'

import { PageSeo } from '@/components/seo/PageSeo'

import { useSiteData } from '@/contexts/SiteDataContext'

import { useProduct } from '@/hooks/useProducts'

import { ProductPrice } from '@/components/catalog/ProductPrice'
import { ProductPriceDisclaimer } from '@/components/catalog/ProductPriceDisclaimer'
import { ProductStockBadge } from '@/components/catalog/ProductStockBadge'

import { ProductGallery } from '@/components/catalog/ProductGallery'

import { FadeIn } from '@/components/ui/FadeIn'

import { Button } from '@/components/ui/Button'

import { RichTextContent } from '@/components/ui/RichTextContent'

import { stripHtml } from '@/lib/rich-text'

import { normalizeProductImages } from '@/lib/product-images'
import { getSchemaStockAvailability } from '@/lib/stock'
import { RecommendedProducts } from '@/components/catalog/RecommendedProducts'
import { cn } from '@/lib/utils'



export function ProductDetailPage() {

  const { slug } = useParams<{ slug: string }>()

  const { product, loading } = useProduct(slug ?? '')

  const { settings } = useSiteData()

  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  useEffect(() => {
    if (!product) return
    trackPageView(`/e-katalog/${product.slug}`, {
      productId: product.id,
      productSlug: product.slug,
    })
  }, [product])

  useEffect(() => {
    setDescriptionExpanded(false)
  }, [product?.id])



  if (loading) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center pt-24">

        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />

      </div>

    )

  }



  if (!product) {

    return (

      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-24">

        <p className="text-lg text-muted">Ürün bulunamadı.</p>

        <Link to="/e-katalog">

          <Button variant="outline">Kataloğa Dön</Button>

        </Link>

      </div>

    )

  }



  const images = normalizeProductImages(product)
  const hasLongDescription = stripHtml(product.description ?? '').length > 420
  const offerUrl = `/iletisim?urun=${encodeURIComponent(product.name)}${product.sku ? `&stok_kodu=${encodeURIComponent(product.sku)}` : ''}`



  return (

    <>

      <PageSeo

        path={`/e-katalog/${product.slug}`}

        fallbackTitle={product.name}

        fallbackDescription={

          (product.description ? stripHtml(product.description) : null) ??

          `${product.name} - ${settings.company_name}`

        }

        fallbackImage={images[0] ?? null}

        entity={product}

        ogType="product"

        breadcrumbs={[

          { name: 'Ana Sayfa', path: '/' },

          { name: 'E-Katalog', path: '/e-katalog' },

          { name: product.name, path: `/e-katalog/${product.slug}` },

        ]}

        jsonLd={{

          '@context': 'https://schema.org',

          '@type': 'Product',

          name: product.name,

          description: product.description ? stripHtml(product.description) : undefined,

          image: images.length > 1 ? images : images[0],

          offers: product.price != null

            ? {

                '@type': 'Offer',

                price: product.price,

                priceCurrency: 'TRY',

                availability:
                  getSchemaStockAvailability(product.stock) ?? 'https://schema.org/InStock',

              }

            : undefined,

        }}

      />



      <section className="bg-gradient-to-b from-surface/70 via-white to-white pt-28 pb-16 lg:pt-32 lg:pb-20">

        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <FadeIn>

            <Link

              to="/e-katalog"

              className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent-600"

            >

              <ArrowLeft className="h-4 w-4" />

              Kataloğa Dön

            </Link>

          </FadeIn>



          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">

            <FadeIn className="lg:sticky lg:top-24 lg:self-start">

              <ProductGallery images={images} alt={product.name} />

            </FadeIn>



            <FadeIn
              delay={0.1}
              className="flex flex-col rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm shadow-navy-900/[0.03] sm:p-8"
            >

              {product.category && (

                <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-600">

                  <Tag className="h-3 w-3" />

                  {product.category.name}

                </span>

              )}



              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-navy-900 md:text-3xl lg:text-4xl">

                {product.name}

              </h1>



              <div className="mt-6 rounded-xl bg-surface px-5 py-5">

                <ProductPrice price={product.price} size="lg" />

                {product.price != null && <ProductPriceDisclaimer />}

                <ProductStockBadge stock={product.stock} className="mt-3" />

                {product.sku && (
                  <p className="mt-3 text-xs text-muted">
                    <span className="font-semibold text-navy-900">Stok Kodu:</span>{' '}
                    <span className="tabular-nums">{product.sku}</span>
                  </p>
                )}

              </div>

              <div className="mt-8 flex flex-wrap gap-3">

                <Link to={offerUrl}>

                  <Button>{product.price == null ? 'Bu ürün için teklif al' : 'Teklif Al'}</Button>

                </Link>

                <Link to="/e-katalog">

                  <Button variant="outline">Diğer Ürünler</Button>

                </Link>

              </div>

            </FadeIn>

          </div>

          {product.description && (
            <FadeIn delay={0.16} className="mt-12 lg:mt-16">
              <section className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm shadow-navy-900/[0.03] lg:grid lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.8fr)]">
                <div className="relative overflow-hidden bg-navy-900 px-6 py-7 text-white sm:px-8 lg:py-9">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />
                  <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-accent-500/15" />
                  <div className="relative">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-400">
                      <FileText className="h-5 w-5" />
                    </span>
                    <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400">
                      Ürün bilgisi
                    </p>
                    <h2 className="mt-2 font-display text-xl font-bold">Ürün açıklaması</h2>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
                      Ürünün kullanım alanları ve teknik detayları aşağıda yer alır.
                    </p>
                    <Link
                      to={offerUrl}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-accent-400"
                    >
                      Ürün hakkında soru sorun
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-9">
                  <div className="relative">
                    <div
                      className={cn(
                        'transition-[max-height] duration-500 ease-out',
                        !descriptionExpanded && hasLongDescription && 'max-h-72 overflow-hidden',
                        descriptionExpanded && hasLongDescription && 'max-h-[5000px]',
                      )}
                    >
                      <RichTextContent
                        html={product.description}
                        className="max-w-3xl text-[15px] leading-7 text-muted md:text-base md:leading-8"
                      />
                    </div>
                    {!descriptionExpanded && hasLongDescription && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>

                  {hasLongDescription && (
                    <button
                      type="button"
                      onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                      aria-expanded={descriptionExpanded}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500"
                    >
                      {descriptionExpanded ? 'Daha az göster' : 'Daha fazlasını göster'}
                      {descriptionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}

                  <div className="mt-8 grid gap-3 border-t border-navy-900/8 pt-5 sm:grid-cols-2">
                    {product.category && (
                      <ProductFact label="Kategori" value={product.category.name} />
                    )}
                    {product.sku && <ProductFact label="Stok kodu" value={product.sku} mono />}
                    <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-xs font-medium text-navy-800">
                      <PackageCheck className="h-4 w-4 shrink-0 text-accent-600" />
                      Teklif ve teslimat bilgisi için bize ulaşın
                    </div>
                  </div>
                </div>
              </section>
            </FadeIn>
          )}

        </div>

      </section>

      <RecommendedProducts currentSlug={product.slug} currentCategoryId={product.category_id} />

    </>

  )

}

function ProductFact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={mono ? 'mt-0.5 text-sm font-semibold tabular-nums text-navy-900' : 'mt-0.5 text-sm font-semibold text-navy-900'}>
        {value}
      </p>
    </div>
  )
}


