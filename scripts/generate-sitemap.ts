import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { loadEnvFiles } from './load-env'

loadEnvFiles()

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://doganiselbiseleri.com.tr').replace(/\/$/, '')

interface SitemapEntry {
  loc: string
  lastmod?: string
}

interface SitemapRow {
  slug: string | null
  updated_at?: string | null
}

const pageSize = 1000

async function writeFileWithRetry(path: string, content: string): Promise<void> {
  let lastError: unknown

  for (const delay of [0, 150, 300, 600, 1200]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    try {
      writeFileSync(path, content)
      return
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

function toLastmod(value?: string | null): string | undefined {
  if (!value) return undefined

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined

  return parsed.toISOString().slice(0, 10)
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrlXml(entry: SitemapEntry): string {
  const loc = escapeXml(encodeURI(`${siteUrl}${entry.loc}`))
  const lines = ['  <url>', `    <loc>${loc}</loc>`]
  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`)
  lines.push('  </url>')
  return lines.join('\n')
}

async function fetchAllRows<T>(queryForRange: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = []
  let from = 0

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await queryForRange(from, to)
    if (error) throw error

    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

async function main() {
  const urls: SitemapEntry[] = [
    { loc: '/' },
    { loc: '/hakkimizda' },
    { loc: '/e-katalog' },
    { loc: '/blog' },
    { loc: '/iletisim' },
    { loc: '/kvkk' },
    { loc: '/cerez-politikasi' },
  ]

  const supabaseUrl = process.env.VITE_SUPABASE_REMOTE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const [{ data: pageSeo }, products, posts] = await Promise.all([
        supabase.from('page_seo').select('path, updated_at'),
        fetchAllRows<SitemapRow>((from, to) =>
          supabase.from('products').select('slug, updated_at').eq('is_active', true).range(from, to),
        ),
        fetchAllRows<SitemapRow>((from, to) =>
          supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true).range(from, to),
        ),
      ])

      pageSeo?.forEach((page) => {
        const entry = urls.find((item) => item.loc === page.path)
        if (entry) entry.lastmod = toLastmod(page.updated_at as string)
      })

      products?.forEach((product) => {
        if (product.slug) {
          urls.push({ loc: `/e-katalog/${product.slug}`, lastmod: toLastmod(product.updated_at as string) })
        }
      })

      posts?.forEach((post) => {
        if (post.slug) {
          urls.push({ loc: `/blog/${post.slug}`, lastmod: toLastmod(post.updated_at as string) })
        }
      })
    } catch {
      console.warn('Supabase slug fetch failed; static URLs only.')
    }
  }

  const uniqueUrls = [...new Map(urls.map((entry) => [entry.loc, entry])).values()]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(buildUrlXml).join('\n')}
</urlset>
`

  const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`

  await writeFileWithRetry('public/sitemap.xml', xml)
  await writeFileWithRetry('public/robots.txt', robots)
  console.log(`Sitemap: ${uniqueUrls.length} URLs -> public/sitemap.xml`)
}

main()
