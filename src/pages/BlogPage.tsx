import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageMeta'
import { PageSeo } from '@/components/seo/PageSeo'
import { FadeIn } from '@/components/ui/FadeIn'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { useSiteData } from '@/contexts/SiteDataContext'
import { images } from '@/data/images'
import { formatDate } from '@/lib/utils'

export function BlogPage() {
  const { posts, loading } = useBlogPosts()
  const { settings } = useSiteData()

  return (
    <>
      <PageSeo
        path="/blog"
        fallbackTitle="Blog"
        fallbackDescription={`${settings.company_name} blog — iş güvenliği ve temizlik rehberleri.`}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />
      <PageHeader
        title="Blog"
        subtitle="İş güvenliği, hijyen ve kurumsal tedarik hakkında güncel içerikler."
        banner={images.banners.blog}
      />

      <section className="bg-white py-10 lg:py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <p className="py-16 text-center text-muted">Henüz blog yazısı yayınlanmadı.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {posts.map((post, i) => (
                <FadeIn key={post.slug} delay={i * 0.04}>
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <article>
                      <div className="relative aspect-[3/2] overflow-hidden bg-surface ring-1 ring-navy-900/[0.06]">
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        )}
                        {post.category && (
                          <span className="absolute left-2 top-2 bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy-900">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-muted">
                          {post.published_at && (
                            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                          )}
                          <span className="text-navy-900/15">·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {post.read_time} dk
                          </span>
                        </div>
                        <h2 className="mt-1.5 font-display text-sm font-bold leading-snug text-navy-900 group-hover:text-accent-600 sm:text-[15px]">
                          {post.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                          {post.excerpt}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-900/70 group-hover:text-accent-600">
                          Oku
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
