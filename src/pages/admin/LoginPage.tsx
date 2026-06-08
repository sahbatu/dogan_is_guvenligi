import { useState } from 'react'

import { Navigate, useNavigate } from 'react-router-dom'

import { Helmet } from 'react-helmet-async'

import { useAuth } from '@/hooks/useAuth'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { SiteBrandingHead } from '@/components/seo/SiteBrandingHead'

import { isSupabaseConfigured } from '@/lib/supabase'

import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/lib/demo-auth'

import { Input } from '@/components/ui/Input'

import { Button } from '@/components/ui/Button'



export function LoginPage() {

  const { user, signIn } = useAuth()
  const { settings } = useSiteSettings()

  const navigate = useNavigate()

  const [email, setEmail] = useState(isSupabaseConfigured ? '' : DEMO_ADMIN_EMAIL)

  const [password, setPassword] = useState(isSupabaseConfigured ? '' : DEMO_ADMIN_PASSWORD)

  const [error, setError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)



  if (user) return <Navigate to="/admin/panel" replace />



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    setError(null)

    setLoading(true)

    const { error: err } = await signIn(email, password)

    setLoading(false)

    if (err) {

      setError(err)

    } else {

      navigate('/admin/panel')

    }

  }



  return (

    <div className="flex min-h-screen items-center justify-center bg-surface px-6">

      <Helmet>

        <meta name="robots" content="noindex, nofollow" />
        <title>Admin Girişi | {settings.company_name}</title>

      </Helmet>
      <SiteBrandingHead faviconUrl={settings.favicon_url} />

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <SiteLogo settings={settings} showSubtitle={false} className="mx-auto mb-5 justify-center" />

          <h1 className="text-2xl font-bold text-navy-900">Admin Girişi</h1>

          <p className="mt-2 text-sm text-muted">Yönetim paneline erişmek için giriş yapın.</p>

        </div>



        {!isSupabaseConfigured && (

          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-800">

            <p className="font-medium">Demo mod — Supabase kurulu değil</p>

            <p className="mt-1 text-blue-700">

              E-posta: <strong>{DEMO_ADMIN_EMAIL}</strong>

              <br />

              Şifre: <strong>{DEMO_ADMIN_PASSWORD}</strong>

            </p>

            <p className="mt-2 text-xs text-blue-600">

              Paneli gezebilirsiniz; kayıt işlemleri Supabase kurulunca çalışır.

            </p>

          </div>

        )}



        <form

          onSubmit={handleSubmit}

          className="rounded-2xl border border-navy-900/5 bg-white p-8 shadow-xl shadow-navy-900/5"

        >

          {error && (

            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}

          <div className="space-y-5">

            <Input

              label="E-posta"

              type="email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              required

              placeholder="admin@example.com"

            />

            <Input

              label="Şifre"

              type="password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              required

              placeholder="••••••••"

            />

            <Button type="submit" className="w-full" disabled={loading}>

              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}

            </Button>

          </div>

        </form>

      </div>

    </div>

  )

}


