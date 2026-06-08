import { Navigate, Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { SiteBrandingHead } from '@/components/seo/SiteBrandingHead'

export function AdminLayout() {
  const { user, loading, signOut, isDemoMode } = useAuth()
  const { settings } = useSiteSettings()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/giris" replace />
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <title>Admin Panel | {settings.company_name}</title>
      </Helmet>
      <SiteBrandingHead faviconUrl={settings.favicon_url} />
      <div className="min-h-screen bg-surface">
        <div className="sticky top-0 z-30 bg-surface">
        <header className="border-b border-navy-900/5 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SiteLogo settings={settings} showSubtitle={false} />
              <div className="hidden h-9 w-px bg-navy-900/10 sm:block" aria-hidden />
              <div>
                <span className="text-sm font-bold text-navy-900">Admin Panel</span>
                <span className="block text-xs text-muted">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">Siteyi Görüntüle</Button>
              </a>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Çıkış
              </Button>
            </div>
          </div>
        </header>
        {isDemoMode && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-2 text-center text-sm text-amber-800">
            Demo mod — değişiklikler kaydedilmez. Supabase kurulumu sonrası gerçek giriş kullanın.
          </div>
        )}
        </div>
        <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <AdminSidebar />
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
