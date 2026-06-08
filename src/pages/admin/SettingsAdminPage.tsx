import { useEffect, useState, type ReactNode } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { SiteImageUpload } from '@/components/admin/SiteImageUpload'
import type { NavLink } from '@/types/cms'

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

export function SettingsAdminPage() {
  const { settings, refetch } = useSiteSettings()
  const [form, setForm] = useState(settings)
  const [navJson, setNavJson] = useState(JSON.stringify(settings.nav_links, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(settings)
    setNavJson(JSON.stringify(settings.nav_links, null, 2))
  }, [settings])

  const set = (key: keyof typeof form, val: string | number | null) =>
    setForm((f) => ({ ...f, [key]: val }))

  const save = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmamış.')
      return
    }
    let nav_links: NavLink[]
    try {
      nav_links = JSON.parse(navJson)
    } catch {
      setError('Navigasyon JSON geçersiz.')
      return
    }
    const supabase = getSupabase()!
    const { error: err } = await supabase
      .from('site_settings')
      .update({
        company_name: form.company_name,
        company_short_name: form.company_short_name,
        slogan: form.slogan,
        tagline: form.tagline,
        founded: form.founded,
        email: form.email,
        phone: form.phone,
        phone_raw: form.phone_raw,
        address: form.address,
        city: form.city,
        working_hours: form.working_hours,
        map_embed_url: form.map_embed_url,
        site_url: form.site_url,
        logo_url: form.logo_url,
        logo_subtitle: form.logo_subtitle,
        favicon_url: form.favicon_url,
        footer_tagline: form.footer_tagline,
        footer_copyright: form.footer_copyright,
        instagram_url: form.instagram_url,
        linkedin_url: form.linkedin_url,
        ga4_measurement_id: form.ga4_measurement_id,
        gtm_container_id: form.gtm_container_id,
        google_site_verification: form.google_site_verification,
        default_meta_title_suffix: form.default_meta_title_suffix,
        default_meta_description: form.default_meta_description,
        default_og_image_url: form.default_og_image_url,
        default_meta_robots: form.default_meta_robots,
        nav_links,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id)
    if (err) {
      setError(err.message)
      return
    }
    setSaved(true)
    refetch()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Site ayarları</h1>
      <p className="mt-1 text-sm text-muted">
        Logo, favicon, footer, iletişim ve analytics ayarları.
      </p>
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {saved && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Kaydedildi.</div>
      )}

      <div className="mt-8 max-w-2xl space-y-6">
        <Section
          title="Logo & Favicon"
          description="Üst menü ve footer'da görünen logo ile tarayıcı sekmesindeki favicon."
        >
          <SiteImageUpload
            label="Site logosu"
            value={form.logo_url}
            onChange={(v) => set('logo_url', v)}
          />
          <Input
            label="Logo alt yazısı"
            value={form.logo_subtitle ?? ''}
            onChange={(e) => set('logo_subtitle', e.target.value)}
            placeholder="İş Güvenliği"
          />
          <p className="text-xs text-muted">
            Logo yüklenmezse şirket adının ilk harfi kullanılır. Önerilen logo boyutu: yatay, max 280×80 px.
          </p>
          <SiteImageUpload
            label="Favicon"
            value={form.favicon_url}
            onChange={(v) => set('favicon_url', v)}
          />
          <p className="text-xs text-muted">
            Boş bırakılırsa varsayılan <code className="text-navy-900">/favicon.png</code> kullanılır.
          </p>
        </Section>

        <Section
          title="Footer"
          description="Alt bilgi alanı. İletişim sütunu aşağıdaki iletişim bilgilerinden, sayfa linkleri navigasyon listesinden gelir."
        >
          <Textarea
            label="Footer açıklama metni"
            value={form.footer_tagline ?? ''}
            onChange={(e) => set('footer_tagline', e.target.value)}
            rows={3}
            placeholder="Boş bırakılırsa slogan kullanılır"
          />
          <Input
            label="Telif hakkı metni"
            value={form.footer_copyright ?? ''}
            onChange={(e) => set('footer_copyright', e.target.value)}
            placeholder="Boş bırakılırsa otomatik oluşturulur"
          />
          <Input
            label="Çalışma saatleri"
            value={form.working_hours ?? ''}
            onChange={(e) => set('working_hours', e.target.value)}
          />
          <Input
            label="Instagram URL"
            value={form.instagram_url ?? ''}
            onChange={(e) => set('instagram_url', e.target.value)}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="LinkedIn URL"
            value={form.linkedin_url ?? ''}
            onChange={(e) => set('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/company/..."
          />
        </Section>

        <Section title="Şirket & İletişim">
          <Input
            label="Şirket adı"
            value={form.company_name}
            onChange={(e) => set('company_name', e.target.value)}
          />
          <Input
            label="Kısa ad (menüde)"
            value={form.company_short_name ?? ''}
            onChange={(e) => set('company_short_name', e.target.value)}
          />
          <Input
            label="Slogan"
            value={form.slogan ?? ''}
            onChange={(e) => set('slogan', e.target.value)}
          />
          <Input
            label="Site URL (canonical)"
            value={form.site_url ?? ''}
            onChange={(e) => set('site_url', e.target.value)}
            placeholder="https://www.ornek.com"
          />
          <Input
            label="E-posta"
            value={form.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label="Telefon"
            value={form.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)}
          />
          <Input
            label="Telefon (raw)"
            value={form.phone_raw ?? ''}
            onChange={(e) => set('phone_raw', e.target.value)}
          />
          <Textarea
            label="Adres"
            value={form.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
            rows={2}
          />
          <Input
            label="Şehir"
            value={form.city ?? ''}
            onChange={(e) => set('city', e.target.value)}
          />
          <Textarea
            label="Harita embed URL"
            value={form.map_embed_url ?? ''}
            onChange={(e) => set('map_embed_url', e.target.value)}
            rows={2}
          />
        </Section>

        <Section title="Analytics & SEO">
          <Input
            label="GA4 Measurement ID"
            value={form.ga4_measurement_id ?? ''}
            onChange={(e) => set('ga4_measurement_id', e.target.value)}
            placeholder="G-XXXXXXXX"
          />
          <Input
            label="GTM Container ID"
            value={form.gtm_container_id ?? ''}
            onChange={(e) => set('gtm_container_id', e.target.value)}
            placeholder="GTM-XXXXXXX"
          />
          <Input
            label="Google Search Console doğrulama"
            value={form.google_site_verification ?? ''}
            onChange={(e) => set('google_site_verification', e.target.value)}
          />
          <SiteImageUpload
            label="Varsayılan OG görseli"
            value={form.default_og_image_url}
            onChange={(v) => set('default_og_image_url', v)}
          />
        </Section>

        <Section
          title="Navigasyon"
          description="Menü ve footer'daki sayfa linkleri."
        >
          <Textarea
            label="Navigasyon (JSON)"
            value={navJson}
            onChange={(e) => setNavJson(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
        </Section>

        <Button onClick={save}>Kaydet</Button>
      </div>
    </div>
  )
}
