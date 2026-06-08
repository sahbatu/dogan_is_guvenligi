import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navLinks as defaultNavLinks } from '@/data/placeholder'
import { useSiteData } from '@/contexts/SiteDataContext'
import { Button } from '@/components/ui/Button'
import { SiteLogo } from '@/components/layout/SiteLogo'

export function Navbar() {
  const { settings } = useSiteData()
  const navLinks = settings.nav_links?.length ? settings.nav_links : defaultNavLinks
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-navy-900/8 bg-white/95 shadow-sm backdrop-blur-md'
            : 'bg-white/80 backdrop-blur-sm',
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
          <Link to="/">
            <SiteLogo settings={settings} />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    'rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                    location.pathname === link.href ||
                    (link.href !== '/' && location.pathname.startsWith(link.href))
                      ? 'bg-navy-900/5 text-navy-900'
                      : 'text-muted hover:text-navy-900',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Link to="/e-katalog">
              <Button size="sm" variant="secondary">
                Kataloğu İncele
              </Button>
            </Link>
          </div>

          <button
            className="rounded-md p-2 text-navy-900 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-navy-950/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[min(300px,85vw)] flex-col bg-white p-6 shadow-2xl md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-bold text-navy-900">{settings.company_name}</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Menüyü kapat">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={cn(
                        'block rounded-md px-4 py-3 font-medium transition-colors',
                        location.pathname === link.href ||
                        (link.href !== '/' && location.pathname.startsWith(link.href))
                          ? 'bg-navy-900 text-white'
                          : 'text-navy-900 hover:bg-surface',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Link to="/e-katalog" className="block">
                  <Button className="w-full" variant="secondary">
                    Kataloğu İncele
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
