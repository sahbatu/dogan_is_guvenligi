-- 015_analytics_page_views.sql
-- Self-hosted, hafif ziyaretçi analitiği.
-- Idempotent — birden fazla çalıştırılabilir.

BEGIN;

CREATE TABLE IF NOT EXISTS public.page_views (
  id            bigserial PRIMARY KEY,
  visitor_id    uuid NOT NULL,
  session_id    uuid NOT NULL,
  path          text NOT NULL,
  product_id    uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_slug  text,
  referrer      text,
  ua            text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx      ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_visitor_created_idx ON public.page_views (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_product_created_idx ON public.page_views (product_id, created_at DESC) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS page_views_path_created_idx    ON public.page_views (path, created_at DESC);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS page_views_anon_insert ON public.page_views;
CREATE POLICY page_views_anon_insert
  ON public.page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS page_views_auth_read ON public.page_views;
CREATE POLICY page_views_auth_read
  ON public.page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Toplu özet
CREATE OR REPLACE FUNCTION public.analytics_summary()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'online_now',        (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at > now() - interval '5 minutes'),
    'today_visitors',    (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= date_trunc('day', now())),
    'today_views',       (SELECT COUNT(*)                    FROM page_views WHERE created_at >= date_trunc('day', now())),
    'yesterday_visitors',(SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= date_trunc('day', now()) - interval '1 day' AND created_at < date_trunc('day', now())),
    'yesterday_views',   (SELECT COUNT(*)                    FROM page_views WHERE created_at >= date_trunc('day', now()) - interval '1 day' AND created_at < date_trunc('day', now())),
    'week_visitors',     (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= now() - interval '7 days'),
    'week_views',        (SELECT COUNT(*)                    FROM page_views WHERE created_at >= now() - interval '7 days'),
    'month_visitors',    (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= date_trunc('month', now())),
    'month_views',       (SELECT COUNT(*)                    FROM page_views WHERE created_at >= date_trunc('month', now())),
    'year_visitors',     (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= date_trunc('year', now())),
    'year_views',        (SELECT COUNT(*)                    FROM page_views WHERE created_at >= date_trunc('year', now())),
    'total_visitors',    (SELECT COUNT(DISTINCT visitor_id) FROM page_views),
    'total_views',       (SELECT COUNT(*)                    FROM page_views)
  );
$$;

-- Günlük seri (son N gün) — chart için
CREATE OR REPLACE FUNCTION public.analytics_daily_series(days integer DEFAULT 30)
RETURNS TABLE(day date, visitors int, views int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH ds AS (
    SELECT (date_trunc('day', now()) - (n || ' day')::interval)::date AS d
    FROM generate_series(0, GREATEST(days, 1) - 1) g(n)
  ),
  agg AS (
    SELECT created_at::date AS d,
           COUNT(DISTINCT visitor_id)::int AS visitors,
           COUNT(*)::int AS views
    FROM page_views
    WHERE created_at >= (date_trunc('day', now()) - (GREATEST(days, 1) - 1 || ' day')::interval)
    GROUP BY 1
  )
  SELECT ds.d, COALESCE(agg.visitors, 0), COALESCE(agg.views, 0)
  FROM ds LEFT JOIN agg USING (d)
  ORDER BY ds.d;
$$;

-- Aylık seri (son N ay)
CREATE OR REPLACE FUNCTION public.analytics_monthly_series(months integer DEFAULT 12)
RETURNS TABLE(month date, visitors int, views int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH ms AS (
    SELECT date_trunc('month', now() - (n || ' month')::interval)::date AS m
    FROM generate_series(0, GREATEST(months, 1) - 1) g(n)
  ),
  agg AS (
    SELECT date_trunc('month', created_at)::date AS m,
           COUNT(DISTINCT visitor_id)::int AS visitors,
           COUNT(*)::int AS views
    FROM page_views
    WHERE created_at >= date_trunc('month', now() - (GREATEST(months, 1) - 1 || ' month')::interval)
    GROUP BY 1
  )
  SELECT ms.m, COALESCE(agg.visitors, 0), COALESCE(agg.views, 0)
  FROM ms LEFT JOIN agg USING (m)
  ORDER BY ms.m;
$$;

-- En çok ziyaret edilen ürünler (son N gün)
CREATE OR REPLACE FUNCTION public.analytics_top_products(days integer DEFAULT 30, lim integer DEFAULT 10)
RETURNS TABLE(product_id uuid, product_slug text, product_name text, views int, unique_visitors int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    pv.product_id,
    COALESCE(pr.slug, pv.product_slug) AS product_slug,
    COALESCE(pr.name, pv.product_slug) AS product_name,
    COUNT(*)::int AS views,
    COUNT(DISTINCT pv.visitor_id)::int AS unique_visitors
  FROM page_views pv
  LEFT JOIN products pr ON pr.id = pv.product_id
  WHERE pv.product_id IS NOT NULL
    AND pv.created_at > now() - (GREATEST(days, 1) || ' day')::interval
  GROUP BY pv.product_id, pv.product_slug, pr.slug, pr.name
  ORDER BY views DESC
  LIMIT GREATEST(lim, 1);
$$;

-- En çok ziyaret edilen sayfalar (son N gün)
CREATE OR REPLACE FUNCTION public.analytics_top_pages(days integer DEFAULT 30, lim integer DEFAULT 10)
RETURNS TABLE(path text, views int, unique_visitors int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT path, COUNT(*)::int, COUNT(DISTINCT visitor_id)::int
  FROM page_views
  WHERE created_at > now() - (GREATEST(days, 1) || ' day')::interval
  GROUP BY path
  ORDER BY 2 DESC
  LIMIT GREATEST(lim, 1);
$$;

REVOKE ALL ON FUNCTION public.analytics_summary()                             FROM public;
REVOKE ALL ON FUNCTION public.analytics_daily_series(integer)                 FROM public;
REVOKE ALL ON FUNCTION public.analytics_monthly_series(integer)               FROM public;
REVOKE ALL ON FUNCTION public.analytics_top_products(integer, integer)        FROM public;
REVOKE ALL ON FUNCTION public.analytics_top_pages(integer, integer)           FROM public;

GRANT EXECUTE ON FUNCTION public.analytics_summary()                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_daily_series(integer)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_monthly_series(integer)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_top_products(integer, integer)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_top_pages(integer, integer)        TO authenticated;

COMMIT;
