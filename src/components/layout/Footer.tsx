import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react'
import { navLinks as defaultNavLinks } from '@/data/placeholder'
import { useSiteData } from '@/contexts/SiteDataContext'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { LEGAL_PATHS } from '@/lib/legal-defaults'

export function Footer() {
  const { settings } = useSiteData()
  const navLinks = settings.nav_links?.length ? settings.nav_links : defaultNavLinks
  const year = new Date().getFullYear()
  const footerTagline = settings.footer_tagline || settings.slogan
  const copyright =
    settings.footer_copyright ||
    `© ${year} ${settings.company_name}. Tüm hakları saklıdır.`

  return (
    <footer className="border-t-[3px] border-accent-600 bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <SiteLogo settings={settings} variant="light" />
            {footerTagline && (
              <p className="mt-4 text-sm leading-relaxed text-white/55">{footerTagline}</p>
            )}
            {(settings.instagram_url || settings.linkedin_url) && (
              <div className="mt-5 flex gap-3">
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent-600 hover:text-white"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings.linkedin_url && (
                  <a
                    href={settings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent-600 hover:text-white"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Sayfalar
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              İletişim
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                <span>{settings.address}<br />{settings.city}</span>
              </li>
              <li>
                <a
                  href={`tel:${settings.phone_raw}`}
                  className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white"
                >
                  <Phone className="h-4 w-4 text-accent-400" />
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white"
                >
                  <Mail className="h-4 w-4 text-accent-400" />
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Çalışma Saatleri
            </h3>
            <p className="mt-4 text-sm text-white/70">{settings.working_hours}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/40 sm:text-left">
          <p>{copyright}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-start">
            <Link to={LEGAL_PATHS.kvkk} className="hover:text-white/70">
              KVKK Aydınlatma Metni
            </Link>
            <Link to={LEGAL_PATHS.cookie} className="hover:text-white/70">
              Çerez Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
