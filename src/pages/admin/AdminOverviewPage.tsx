import { Link } from 'react-router-dom'
import {
  Package,
  FileText,
  Mail,
  Search,
  Users,
  Eye,
  CalendarDays,
  Radio,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { useAnalytics } from '@/hooks/useAnalytics'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { TrafficChart } from '@/components/admin/TrafficChart'

const nfmt = new Intl.NumberFormat('tr-TR')

const dayLabel = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}
const monthLabel = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
}

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

  const {
    summary,
    daily,
    monthly,
    topProducts,
    topPages,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics({ dailyRange: 30, monthlyRange: 12, topRange: 30, topLimit: 10 })

  const dailyChart = useMemo(
    () => ({
      labels: daily.map((d) => dayLabel(d.day)),
      series: [
        { label: 'Ziyaretçi', color: '#0f766e', values: daily.map((d) => d.visitors) },
        { label: 'Görüntülenme', color: '#f59e0b', values: daily.map((d) => d.views) },
      ],
    }),
    [daily],
  )

  const monthlyChart = useMemo(
    () => ({
      labels: monthly.map((m) => monthLabel(m.month)),
      series: [
        { label: 'Ziyaretçi', color: '#0f766e', values: monthly.map((m) => m.visitors) },
        { label: 'Görüntülenme', color: '#f59e0b', values: monthly.map((m) => m.views) },
      ],
    }),
    [monthly],
  )

  const yoyChange =
    summary.yesterday_visitors > 0
      ? Math.round(((summary.today_visitors - summary.yesterday_visitors) / summary.yesterday_visitors) * 100)
      : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Yönetim özeti</h1>
        <p className="mt-1 text-sm text-muted">
          Site trafiği, içerik durumu ve son mesajlar bir bakışta.
        </p>
      </div>

      {/* İçerik özet kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ContentCard label="Ürünler" value={nfmt.format(products.length)} to="/admin/panel/urunler" icon={Package} />
        <ContentCard label="Blog yazıları" value={nfmt.format(posts.length)} to="/admin/panel/blog" icon={FileText} />
        <ContentCard label="Okunmamış mesaj" value={nfmt.format(unread)} to="/admin/panel/mesajlar" icon={Mail} highlight={unread > 0} />
        <ContentCard label="SEO ayarları" value="—" to="/admin/panel/seo" icon={Search} />
      </div>

      {/* Analitik başlık */}
      <div className="flex items-end justify-between border-b border-navy-900/8 pb-3">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Ziyaretçi analitiği</h2>
          <p className="text-xs text-muted">
            Kendi Supabase'inizde tutulur — 3. parti servis yok.{' '}
            {analyticsLoading && <span>(yükleniyor…)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>Otomatik yenileme her 30 sn</span>
        </div>
      </div>

      {analyticsError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Analitik yüklenemedi: {analyticsError}
        </div>
      )}

      {/* Anlık + özet kartlar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Şu an online"
          value={nfmt.format(summary.online_now)}
          sub="son 5 dakika"
          icon={Radio}
          accent="emerald"
        />
        <StatCard
          label="Bugün"
          value={nfmt.format(summary.today_visitors)}
          sub={`${nfmt.format(summary.today_views)} görüntülenme${
            yoyChange !== null
              ? ` · ${yoyChange >= 0 ? '+' : ''}${yoyChange}% (dün)`
              : ''
          }`}
          icon={Users}
          accent="cyan"
        />
        <StatCard
          label="Bu ay"
          value={nfmt.format(summary.month_visitors)}
          sub={`${nfmt.format(summary.month_views)} görüntülenme`}
          icon={CalendarDays}
          accent="indigo"
        />
        <StatCard
          label="Bu yıl"
          value={nfmt.format(summary.year_visitors)}
          sub={`${nfmt.format(summary.year_views)} görüntülenme`}
          icon={TrendingUp}
          accent="orange"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Dün" value={nfmt.format(summary.yesterday_visitors)} sub={`${nfmt.format(summary.yesterday_views)} gör.`} />
        <MiniStat label="Son 7 gün" value={nfmt.format(summary.week_visitors)} sub={`${nfmt.format(summary.week_views)} gör.`} />
        <MiniStat label="Toplam ziyaretçi" value={nfmt.format(summary.total_visitors)} sub="tüm zamanlar" />
        <MiniStat label="Toplam görüntülenme" value={nfmt.format(summary.total_views)} sub="tüm zamanlar" />
      </div>

      {/* Chart: son 30 gün */}
      <div className="rounded-2xl border border-navy-900/5 bg-white p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Son 30 gün trafiği</h3>
            <p className="text-xs text-muted">Günlük ziyaretçi ve sayfa görüntülenmesi</p>
          </div>
          <Eye className="h-5 w-5 text-muted/50" />
        </div>
        <TrafficChart
          labels={dailyChart.labels}
          series={dailyChart.series}
          formatValue={(n) => nfmt.format(n)}
        />
      </div>

      {/* Chart: son 12 ay */}
      <div className="rounded-2xl border border-navy-900/5 bg-white p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Son 12 ay trafiği</h3>
            <p className="text-xs text-muted">Aylık ziyaretçi ve sayfa görüntülenmesi</p>
          </div>
          <CalendarDays className="h-5 w-5 text-muted/50" />
        </div>
        <TrafficChart
          labels={monthlyChart.labels}
          series={monthlyChart.series}
          formatValue={(n) => nfmt.format(n)}
        />
      </div>

      {/* Top ürünler + Top sayfalar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-900/5 bg-white p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">En çok ziyaret edilen ürünler</h3>
              <p className="text-xs text-muted">Son 30 gün, ilk 10</p>
            </div>
            <Package className="h-5 w-5 text-muted/50" />
          </div>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Ürün ziyareti henüz kaydedilmedi.</p>
          ) : (
            <ol className="divide-y divide-navy-900/5 text-sm">
              {topProducts.map((p, i) => (
                <li key={p.product_id ?? p.product_slug ?? i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-semibold text-muted tabular-nums">{i + 1}.</span>
                    {p.product_slug ? (
                      <Link
                        to={`/e-katalog/${p.product_slug}`}
                        className="font-medium text-navy-900 hover:text-accent-600"
                        target="_blank"
                        rel="noopener"
                      >
                        {p.product_name ?? p.product_slug}
                      </Link>
                    ) : (
                      <span className="font-medium text-navy-900">{p.product_name ?? '—'}</span>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold tabular-nums text-navy-900">{nfmt.format(p.views)} görüntüleme</div>
                    <div className="text-muted tabular-nums">{nfmt.format(p.unique_visitors)} tekil ziyaretçi</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-navy-900/5 bg-white p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">En çok ziyaret edilen sayfalar</h3>
              <p className="text-xs text-muted">Son 30 gün, ilk 10</p>
            </div>
            <FileText className="h-5 w-5 text-muted/50" />
          </div>
          {topPages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Sayfa ziyareti henüz kaydedilmedi.</p>
          ) : (
            <ol className="divide-y divide-navy-900/5 text-sm">
              {topPages.map((p, i) => (
                <li key={p.path} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-semibold text-muted tabular-nums">{i + 1}.</span>
                    <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-navy-900">{p.path}</code>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold tabular-nums text-navy-900">{nfmt.format(p.views)} görüntüleme</div>
                    <div className="text-muted tabular-nums">{nfmt.format(p.unique_visitors)} tekil ziyaretçi</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentCard({
  label,
  value,
  to,
  icon: Icon,
  highlight = false,
}: {
  label: string
  value: string | number
  to: string
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
}) {
  return (
    <Link
      to={to}
      className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
        highlight ? 'border-red-200 bg-red-50/40' : 'border-navy-900/5 bg-white'
      }`}
    >
      <Icon className={`h-5 w-5 ${highlight ? 'text-red-600' : 'text-accent-600'}`} />
      <p className="mt-3 text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Link>
  )
}

const ACCENT_MAP = {
  emerald: {
    wrap: 'rounded-2xl p-5 bg-emerald-50',
    label: 'text-xs font-semibold uppercase tracking-wider text-emerald-900/70',
    value: 'mt-2 text-3xl font-bold tabular-nums text-emerald-900',
    sub:   'mt-1 text-xs text-emerald-900/70',
    icon:  'flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700',
  },
  cyan: {
    wrap: 'rounded-2xl p-5 bg-cyan-50',
    label: 'text-xs font-semibold uppercase tracking-wider text-cyan-900/70',
    value: 'mt-2 text-3xl font-bold tabular-nums text-cyan-900',
    sub:   'mt-1 text-xs text-cyan-900/70',
    icon:  'flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700',
  },
  indigo: {
    wrap: 'rounded-2xl p-5 bg-indigo-50',
    label: 'text-xs font-semibold uppercase tracking-wider text-indigo-900/70',
    value: 'mt-2 text-3xl font-bold tabular-nums text-indigo-900',
    sub:   'mt-1 text-xs text-indigo-900/70',
    icon:  'flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700',
  },
  orange: {
    wrap: 'rounded-2xl p-5 bg-orange-50',
    label: 'text-xs font-semibold uppercase tracking-wider text-orange-900/70',
    value: 'mt-2 text-3xl font-bold tabular-nums text-orange-900',
    sub:   'mt-1 text-xs text-orange-900/70',
    icon:  'flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700',
  },
} as const

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'cyan',
}: {
  label: string
  value: string
  sub: string
  icon: React.ComponentType<{ className?: string }>
  accent?: keyof typeof ACCENT_MAP
}) {
  const a = ACCENT_MAP[accent]
  return (
    <div className={a.wrap}>
      <div className="flex items-start justify-between">
        <div>
          <p className={a.label}>{label}</p>
          <p className={a.value}>{value}</p>
          <p className={a.sub}>{sub}</p>
        </div>
        <div className={a.icon}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-navy-900/5 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-navy-900">{value}</p>
      <p className="text-[11px] text-muted">{sub}</p>
    </div>
  )
}
