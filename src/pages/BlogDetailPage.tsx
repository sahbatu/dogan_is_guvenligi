import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { PageSeo } from '@/components/seo/PageSeo'
import { FadeIn } from '@/components/ui/FadeIn'
import { useBlogPost } from '@/hooks/useBlogPosts'
import { useSiteData } from '@/contexts/SiteDataContext'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { RichTextContent } from '@/components/ui/RichTextContent'
import { blogContentForDisplay } from '@/lib/blog-content'
import { normalizeGalleryImages } from '@/lib/gallery-images'
import { ProductGallery } from '@/components/catalog/ProductGallery'

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { post, loading } = useBlogPost(slug ?? '')
  const { settings } = useSiteData()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-24">
        <p className="text-lg text-muted">Yazı bulunamadı.</p>
        <Link to="/blog">
          <Button variant="outline">Bloga Dön</Button>
        </Link>
      </div>
    )
  }

  const siteUrl = settings.site_url?.replace(/\/$/, '') ?? ''
  const images = normalizeGalleryImages(post)

  return (
    <>
      <PageSeo
        path={`/blog/${post.slug}`}
        fallbackTitle={post.title}
        fallbackDescription={post.excerpt ?? ''}
        fallbackImage={images[0] ?? null}
        entity={post}
        ogType="article"
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: images.length > 1 ? images : images[0],
          datePublished: post.published_at,
          author: { '@type': 'Organization', name: settings.company_name },
          publisher: { '@type': 'Organization', name: settings.company_name },
          mainEntityOfPage: siteUrl ? `${siteUrl}/blog/${post.slug}` : undefined,
        }}
      />

      <article className="pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <FadeIn>
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent-600">
              <ArrowLeft className="h-4 w-4" />
              Bloga Dön
            </Link>
          </FadeIn>

          <FadeIn delay={0.05} className="mt-8">
            {post.category && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-600">
                {post.category}
              </span>
            )}
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-navy-900 md:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted">
              {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time} dk okuma
              </span>
            </div>
          </FadeIn>

          {images.length > 0 && (
            <FadeIn delay={0.1} className="mt-8">
              <ProductGallery
                images={images}
                alt={post.title}
                aspectClass="aspect-[16/9]"
                thumbClass="h-14 w-20 sm:h-16 sm:w-24"
              />
            </FadeIn>
          )}

          <FadeIn delay={0.15} className="mt-10">
            <RichTextContent
              html={blogContentForDisplay(post.content)}
              className="text-[15px] leading-7"
            />
          </FadeIn>

          <FadeIn delay={0.2} className="mt-12 border-t border-navy-900/8 pt-8">
            <p className="text-sm text-muted">Ürün ve tedarik hakkında bilgi almak için ekibimizle iletişime geçebilirsiniz.</p>
            <Link to="/iletisim" className="mt-4 inline-block">
              <Button size="sm">İletişime Geç</Button>
            </Link>
          </FadeIn>
        </div>
      </article>
    </>
  )
}
