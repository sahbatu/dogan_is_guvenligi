import { Link, useParams } from 'react-router-dom'

import { ArrowLeft, Tag } from 'lucide-react'

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



export function ProductDetailPage() {

  const { slug } = useParams<{ slug: string }>()

  const { product, loading } = useProduct(slug ?? '')

  const { settings } = useSiteData()



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



      <section className="pt-28 pb-16 lg:pt-32 lg:pb-20">

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



          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">

            <FadeIn>

              <ProductGallery images={images} alt={product.name} />

            </FadeIn>



            <FadeIn delay={0.1} className="flex flex-col">

              {product.category && (

                <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-600">

                  <Tag className="h-3 w-3" />

                  {product.category.name}

                </span>

              )}



              <h1 className="mt-3 font-display text-2xl font-bold text-navy-900 md:text-3xl">

                {product.name}

              </h1>



              <div className="mt-4 border-y border-navy-900/8 py-4">

                <ProductPrice price={product.price} size="lg" />

                {product.price != null && <ProductPriceDisclaimer />}

                <ProductStockBadge stock={product.stock} className="mt-3" />

              </div>



              {product.description && (

                <div className="mt-5">

                  <RichTextContent html={product.description} />

                </div>

              )}



              <div className="mt-8 flex flex-wrap gap-3">

                <Link to="/iletisim">

                  <Button>Teklif Al</Button>

                </Link>

                <Link to="/e-katalog">

                  <Button variant="outline">Diğer Ürünler</Button>

                </Link>

              </div>

            </FadeIn>

          </div>

        </div>

      </section>

      <RecommendedProducts currentSlug={product.slug} />

    </>

  )

}


