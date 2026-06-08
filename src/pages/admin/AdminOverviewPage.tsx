import { Link } from 'react-router-dom'
import { Package, FileText, Mail, Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function AdminOverviewPage() {
  const { products } = useProducts({ includeInactive: true })
  const { posts } = useBlogPosts({ includeDrafts: true })
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    getSupabase()!
      .from('contact_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .then(({ count }) => setUnread(count ?? 0))
  }, [])

  const cards = [
    { label: 'Ürünler', value: products.length, to: '/admin/panel/urunler', icon: Package },
    { label: 'Blog yazıları', value: posts.length, to: '/admin/panel/blog', icon: FileText },
    { label: 'Okunmamış mesaj', value: unread, to: '/admin/panel/mesajlar', icon: Mail },
    { label: 'SEO ayarları', value: '—', to: '/admin/panel/seo', icon: Search },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Yönetim özeti</h1>
      <p className="mt-1 text-sm text-muted">Site içeriğini ve SEO ayarlarını buradan yönetin.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-2xl border border-navy-900/5 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <c.icon className="h-5 w-5 text-accent-600" />
            <p className="mt-3 text-2xl font-bold text-navy-900">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
