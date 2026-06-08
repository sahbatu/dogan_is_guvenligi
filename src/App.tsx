import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { MainLayout } from '@/components/layout/MainLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const BlogPage = lazy(() => import('@/pages/BlogPage').then((m) => ({ default: m.BlogPage })))
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const LegalPage = lazy(() => import('@/pages/LegalPage').then((m) => ({ default: m.LegalPage })))
const LoginPage = lazy(() => import('@/pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })))
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })))
const ProductsAdminPage = lazy(() => import('@/pages/admin/ProductsAdminPage').then((m) => ({ default: m.ProductsAdminPage })))
const PricesAdminPage = lazy(() => import('@/pages/admin/PricesAdminPage').then((m) => ({ default: m.PricesAdminPage })))
const CategoriesAdminPage = lazy(() => import('@/pages/admin/CategoriesAdminPage').then((m) => ({ default: m.CategoriesAdminPage })))
const BlogAdminPage = lazy(() => import('@/pages/admin/BlogAdminPage').then((m) => ({ default: m.BlogAdminPage })))
const ProductEditPage = lazy(() => import('@/pages/admin/ProductEditPage').then((m) => ({ default: m.ProductEditPage })))
const BlogEditPage = lazy(() => import('@/pages/admin/BlogEditPage').then((m) => ({ default: m.BlogEditPage })))
const PagesAdminPage = lazy(() => import('@/pages/admin/PagesAdminPage').then((m) => ({ default: m.PagesAdminPage })))
const SeoAdminPage = lazy(() => import('@/pages/admin/SeoAdminPage').then((m) => ({ default: m.SeoAdminPage })))
const SettingsAdminPage = lazy(() => import('@/pages/admin/SettingsAdminPage').then((m) => ({ default: m.SettingsAdminPage })))
const MessagesAdminPage = lazy(() => import('@/pages/admin/MessagesAdminPage').then((m) => ({ default: m.MessagesAdminPage })))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="admin" element={<Navigate to="/admin/giris" replace />} />
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="hakkimizda" element={<AboutPage />} />
              <Route path="iletisim" element={<ContactPage />} />
              <Route path="e-katalog" element={<CatalogPage />} />
              <Route path="e-katalog/:slug" element={<ProductDetailPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogDetailPage />} />
              <Route path="kvkk" element={<LegalPage slug="kvkk" />} />
              <Route path="cerez-politikasi" element={<LegalPage slug="cerez-politikasi" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="admin/giris" element={<LoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="admin/panel" element={<AdminOverviewPage />} />
              <Route path="admin/panel/urunler" element={<ProductsAdminPage />} />
              <Route path="admin/panel/urunler/yeni" element={<ProductEditPage />} />
              <Route path="admin/panel/urunler/:productId/duzenle" element={<ProductEditPage />} />
              <Route path="admin/panel/fiyatlar" element={<PricesAdminPage />} />
              <Route path="admin/panel/kategoriler" element={<CategoriesAdminPage />} />
              <Route path="admin/panel/blog" element={<BlogAdminPage />} />
              <Route path="admin/panel/blog/yeni" element={<BlogEditPage />} />
              <Route path="admin/panel/blog/:postId/duzenle" element={<BlogEditPage />} />
              <Route path="admin/panel/sayfalar" element={<PagesAdminPage />} />
              <Route path="admin/panel/seo" element={<SeoAdminPage />} />
              <Route path="admin/panel/ayarlar" element={<SettingsAdminPage />} />
              <Route path="admin/panel/mesajlar" element={<MessagesAdminPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
