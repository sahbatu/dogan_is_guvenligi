import { Link } from 'react-router-dom'
import { PageSeo } from '@/components/seo/PageSeo'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <>
      <PageSeo
        path="/404"
        fallbackTitle="Sayfa Bulunamadı"
        fallbackDescription="Aradığınız sayfa bulunamadı."
        entity={{ meta_robots: 'noindex,nofollow' }}
      />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="text-6xl font-bold text-navy-900/15">404</p>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Sayfa bulunamadı</h1>
        <p className="mt-2 text-muted">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
        <Link to="/" className="mt-8">
          <Button>Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </>
  )
}
