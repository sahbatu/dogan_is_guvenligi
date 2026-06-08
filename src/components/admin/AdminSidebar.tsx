import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Banknote,
  FolderTree,
  FileText,
  Layers,
  Search,
  Settings,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin/panel', label: 'Özet', icon: LayoutDashboard, end: true },
  { to: '/admin/panel/urunler', label: 'Ürünler', icon: Package },
  { to: '/admin/panel/fiyatlar', label: 'Fiyatlar', icon: Banknote },
  { to: '/admin/panel/kategoriler', label: 'Kategoriler', icon: FolderTree },
  { to: '/admin/panel/blog', label: 'Blog', icon: FileText },
  { to: '/admin/panel/sayfalar', label: 'Sayfalar', icon: Layers },
  { to: '/admin/panel/seo', label: 'SEO', icon: Search },
  { to: '/admin/panel/ayarlar', label: 'Ayarlar', icon: Settings },
  { to: '/admin/panel/mesajlar', label: 'Mesajlar', icon: Mail },
]

export function AdminSidebar() {
  return (
    <nav className="space-y-1">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-navy-900 text-white'
                : 'text-muted hover:bg-white hover:text-navy-900',
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
