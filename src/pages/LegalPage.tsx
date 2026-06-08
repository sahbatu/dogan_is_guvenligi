import { Navigate } from 'react-router-dom'
import { PageSeo } from '@/components/seo/PageSeo'
import { RichTextContent } from '@/components/ui/RichTextContent'
import { FadeIn } from '@/components/ui/FadeIn'
import { getDefaultLegalPage, LEGAL_PATHS } from '@/lib/legal-defaults'

interface LegalPageProps {
  slug: string
}

const PATH_BY_SLUG: Record<string, string> = {
  kvkk: LEGAL_PATHS.kvkk,
  'cerez-politikasi': LEGAL_PATHS.cookie,
}

export function LegalPage({ slug }: LegalPageProps) {
  const page = getDefaultLegalPage(slug)
  const path = PATH_BY_SLUG[slug]

  if (!page || !path) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <PageSeo
        path={path}
        fallbackTitle={page.title}
        fallbackDescription={`${page.title} — kişisel veriler ve çerez kullanımı hakkında bilgilendirme.`}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: page.title, path },
        ]}
      />

      <section className="border-b border-navy-900/5 bg-surface/50 py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <FadeIn>
            <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {page.title}
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <RichTextContent
              html={page.content}
              className="text-muted"
            />
          </FadeIn>
        </div>
      </section>
    </>
  )
}
