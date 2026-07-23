import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { LEGAL_PATHS } from '@/lib/legal-defaults'
import { PageHeader } from '@/components/layout/PageMeta'
import { PageSeo } from '@/components/seo/PageSeo'
import { useSiteData } from '@/contexts/SiteDataContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { resolveSupabaseClientUrl } from '@/lib/storage-url'
import { images } from '@/data/images'
import { FadeIn } from '@/components/ui/FadeIn'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { TurnstileWidget } from '@/components/ui/TurnstileWidget'
import {
  CONTACT_LIMITS,
  isContactRateLimited,
  markContactSubmitted,
  normalizeContactPhone,
  validateContactForm,
} from '@/lib/contact-form'

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ??
  import.meta.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
  ''

const CONTACT_ERROR_MESSAGES: Record<string, string> = {
  kvkk_required: 'Devam etmek için KVKK aydınlatma metnini kabul etmelisiniz.',
  invalid_name: 'Ad Soyad geçersiz.',
  invalid_email: 'E-posta adresi geçersiz.',
  invalid_message: 'Mesaj çok kısa veya çok uzun.',
  invalid_phone: 'Telefon numarası geçersiz.',
  turnstile_missing: 'Lütfen güvenlik doğrulamasını tamamlayın.',
  turnstile_failed: 'Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.',
  insert_failed: 'Mesaj kaydedilemedi. Lütfen tekrar deneyin.',
  server_misconfigured: 'Mesaj servisi geçici olarak kullanılamıyor. Lütfen telefon veya e-posta ile iletişime geçin.',
}

export function ContactPage() {
  const { settings, getSection } = useSiteData()
  const contactData = getSection('contact', 'main') as { subtitle?: string; successMessage?: string }
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [kvkkConsent, setKvkkConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [widgetKey, setWidgetKey] = useState(0)
  const [turnstileFailed, setTurnstileFailed] = useState(false)

  const resetWidget = () => {
    setTurnstileToken(null)
    setWidgetKey((k) => k + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!kvkkConsent) {
      setError('Devam etmek için KVKK aydınlatma metnini kabul etmelisiniz.')
      return
    }

    if (isContactRateLimited()) {
      setError('Çok sık mesaj gönderildi. Lütfen bir dakika sonra tekrar deneyin.')
      return
    }

    const result = validateContactForm({
      name,
      email,
      phone,
      subject,
      message,
      honeypot,
    })

    if (!result.valid || !result.sanitized) {
      if (honeypot.trim()) {
        setSubmitted(true)
        return
      }
      const firstError = Object.values(result.errors)[0]
      setError(firstError ?? 'Lütfen formu kontrol edin.')
      return
    }

    if (!isSupabaseConfigured) {
      setError('Mesaj servisi şu an kullanılamıyor. Lütfen telefon veya e-posta ile iletişime geçin.')
      return
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Lütfen güvenlik doğrulamasını tamamlayın.')
      return
    }

    setSubmitting(true)
    try {
      const supabaseUrl = resolveSupabaseClientUrl()
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
      const endpoint = `${supabaseUrl!.replace(/\/$/, '')}/functions/v1/contact-submit`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          name: result.sanitized.name,
          email: result.sanitized.email,
          phone: result.sanitized.phone,
          message: result.sanitized.message,
          kvkkConsent: true,
          turnstileToken: turnstileToken ?? '',
          honeypot: '',
        }),
      })
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok || !data?.ok) {
        const code = data?.error ?? 'insert_failed'
        setError(CONTACT_ERROR_MESSAGES[code] ?? 'Mesaj gönderilemedi. Lütfen tekrar deneyin.')
        resetWidget()
        return
      }
      markContactSubmitted()
      setSubmitted(true)
    } catch {
      setError('Mesaj gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.')
      resetWidget()
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: MapPin, label: 'Adres', value: `${settings.address}, ${settings.city}` },
    { icon: Phone, label: 'Telefon', value: settings.phone, href: `tel:${settings.phone_raw}` },
    { icon: Mail, label: 'E-posta', value: settings.email, href: `mailto:${settings.email}` },
    { icon: Clock, label: 'Çalışma Saatleri', value: settings.working_hours },
  ]

  return (
    <>
      <PageSeo
        path="/iletisim"
        fallbackTitle="İletişim"
        fallbackDescription={`${settings.company_name} iletişim bilgileri.`}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'İletişim', path: '/iletisim' },
        ]}
      />
      <PageHeader
        title="İletişim"
        subtitle={contactData.subtitle ?? 'Sorularınız ve teklif talepleriniz için bizimle iletişime geçin.'}
        banner={images.banners.contact}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <FadeIn className="lg:col-span-2 space-y-6">
              {contactInfo.map((item) => (
                <Card key={item.label} className="flex items-start gap-4 border-transparent bg-surface/50">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="mt-1 block font-semibold text-navy-900 hover:text-accent-600">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 font-semibold text-navy-900">{item.value}</p>
                    )}
                  </div>
                </Card>
              ))}
            </FadeIn>

            <FadeIn delay={0.15} className="lg:col-span-3">
              <Card className="border-transparent shadow-lg shadow-navy-900/5">
                <h2 className="text-2xl font-bold text-navy-900">Mesaj Gönderin</h2>
                <p className="mt-2 text-muted">Formu doldurun, en kısa sürede size dönüş yapalım.</p>

                {submitted ? (
                  <div className="mt-8 rounded-xl bg-accent-600/10 p-8 text-center">
                    <p className="text-lg font-semibold text-accent-600">Mesajınız alındı!</p>
                    <p className="mt-2 text-muted">
                      {contactData.successMessage ?? 'En kısa sürede sizinle iletişime geçeceğiz.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden
                      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Ad Soyad"
                        required
                        maxLength={CONTACT_LIMITS.name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        label="E-posta"
                        type="email"
                        required
                        maxLength={CONTACT_LIMITS.email}
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Input
                      label="Telefon"
                      type="tel"
                      inputMode="numeric"
                      maxLength={CONTACT_LIMITS.phone}
                      autoComplete="tel"
                      placeholder="05XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(normalizeContactPhone(e.target.value))}
                    />
                    <Input
                      label="Konu"
                      required
                      maxLength={CONTACT_LIMITS.subject}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    <Textarea
                      label="Mesajınız"
                      required
                      rows={5}
                      maxLength={CONTACT_LIMITS.message}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <label className="flex items-start gap-2.5 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={kvkkConsent}
                        onChange={(e) => setKvkkConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded"
                        required
                      />
                      <span>
                        <Link to={LEGAL_PATHS.kvkk} className="font-medium text-accent-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          KVKK Aydınlatma Metni
                        </Link>
                        &apos;ni okudum; kişisel verilerimin belirtilen amaçlarla işlenmesini kabul ediyorum.
                      </span>
                    </label>
                    {TURNSTILE_SITE_KEY && (
                      <div>
                        <TurnstileWidget
                          key={widgetKey}
                          siteKey={TURNSTILE_SITE_KEY}
                          onToken={(token) => {
                            setTurnstileToken(token)
                            setTurnstileFailed(false)
                          }}
                          onExpired={() => setTurnstileToken(null)}
                          onError={() => {
                            setTurnstileToken(null)
                            setTurnstileFailed(true)
                          }}
                        />
                        {turnstileFailed && (
                          <p className="mt-2 text-xs text-red-600">
                            Güvenlik doğrulaması yüklenemedi. Sayfayı yenilemeyi deneyin.
                          </p>
                        )}
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!kvkkConsent || submitting || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'Gönderiliyor…' : 'Gönder'}
                    </Button>
                  </form>
                )}
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {settings.map_embed_url && (
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <FadeIn>
              <div className="overflow-hidden rounded-3xl ring-1 ring-navy-900/5">
                <iframe
                  title="Konum"
                  src={settings.map_embed_url}
                  className="h-[400px] w-full border-0 grayscale-[30%] contrast-[1.1]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </FadeIn>
          </div>
        </section>
      )}
    </>
  )
}
