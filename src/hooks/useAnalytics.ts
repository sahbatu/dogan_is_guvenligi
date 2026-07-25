import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export interface AnalyticsSummary {
  online_now: number
  today_visitors: number
  today_views: number
  yesterday_visitors: number
  yesterday_views: number
  week_visitors: number
  week_views: number
  month_visitors: number
  month_views: number
  year_visitors: number
  year_views: number
  total_visitors: number
  total_views: number
}

export interface DailySeriesRow {
  day: string
  visitors: number
  views: number
}
export interface MonthlySeriesRow {
  month: string
  visitors: number
  views: number
}
export interface TopProductRow {
  product_id: string | null
  product_slug: string | null
  product_name: string | null
  views: number
  unique_visitors: number
}
export interface TopPageRow {
  path: string
  views: number
  unique_visitors: number
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  online_now: 0,
  today_visitors: 0,
  today_views: 0,
  yesterday_visitors: 0,
  yesterday_views: 0,
  week_visitors: 0,
  week_views: 0,
  month_visitors: 0,
  month_views: 0,
  year_visitors: 0,
  year_views: 0,
  total_visitors: 0,
  total_views: 0,
}

export function useAnalytics({
  dailyRange = 30,
  monthlyRange = 12,
  topRange = 30,
  topLimit = 10,
  refreshMs = 30_000,
}: {
  dailyRange?: number
  monthlyRange?: number
  topRange?: number
  topLimit?: number
  refreshMs?: number
} = {}) {
  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_SUMMARY)
  const [daily, setDaily] = useState<DailySeriesRow[]>([])
  const [monthly, setMonthly] = useState<MonthlySeriesRow[]>([])
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([])
  const [topPages, setTopPages] = useState<TopPageRow[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const supabase = getSupabase()!
    setError(null)
    try {
      const [summaryRes, dailyRes, monthlyRes, prodRes, pageRes] = await Promise.all([
        supabase.rpc('analytics_summary'),
        supabase.rpc('analytics_daily_series', { days: dailyRange }),
        supabase.rpc('analytics_monthly_series', { months: monthlyRange }),
        supabase.rpc('analytics_top_products', { days: topRange, lim: topLimit }),
        supabase.rpc('analytics_top_pages', { days: topRange, lim: topLimit }),
      ])
      if (summaryRes.error) throw summaryRes.error
      if (dailyRes.error) throw dailyRes.error
      if (monthlyRes.error) throw monthlyRes.error
      if (prodRes.error) throw prodRes.error
      if (pageRes.error) throw pageRes.error
      setSummary((summaryRes.data as AnalyticsSummary) ?? EMPTY_SUMMARY)
      setDaily((dailyRes.data as DailySeriesRow[]) ?? [])
      setMonthly((monthlyRes.data as MonthlySeriesRow[]) ?? [])
      setTopProducts((prodRes.data as TopProductRow[]) ?? [])
      setTopPages((pageRes.data as TopPageRow[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analitik verisi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [dailyRange, monthlyRange, topRange, topLimit])

  useEffect(() => {
    fetchAll()
    if (!refreshMs) return
    const t = setInterval(fetchAll, refreshMs)
    return () => clearInterval(t)
  }, [fetchAll, refreshMs])

  return { summary, daily, monthly, topProducts, topPages, loading, error, refetch: fetchAll }
}
