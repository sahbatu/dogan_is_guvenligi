import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { loadEnvFiles } from './load-env'

loadEnvFiles()

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://www.doganisguvenligi.com').replace(/\/$/, '')

interface SitemapEntry {
  loc: string
  lastmod: string
  changefreq?: string
  priority?: string
}

/** W3C Datetime (YYYY-MM-DD) — Google sitemap önerisi */
function toLastmod(value?: string | null, fallback = new Date()): string {
  if (value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }
  return fallback.toISOString().slice(0, 10)
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
  const loc = escapeXml(`${siteUrl}${entry.loc}`)
  const lines = [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
  ]
  if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`)
  if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

async function main() {
  const buildDate = toLastmod()

  const urls: SitemapEntry[] = [
    { loc: '/', lastmod: buildDate, changefreq: 'weekly', priority: '1.0' },
    { loc: '/hakkimizda', lastmod: buildDate, changefreq: 'monthly', priority: '0.8' },
    { loc: '/e-katalog', lastmod: buildDate, changefreq: 'weekly', priority: '0.9' },
    { loc: '/blog', lastmod: buildDate, changefreq: 'weekly', priority: '0.8' },
    { loc: '/iletisim', lastmod: buildDate, changefreq: 'monthly', priority: '0.7' },
    { loc: '/kvkk', lastmod: buildDate, changefreq: 'yearly', priority: '0.4' },
    { loc: '/cerez-politikasi', lastmod: buildDate, changefreq: 'yearly', priority: '0.4' },
  ]

  const supabaseUrl = process.env.VITE_SUPABASE_REMOTE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const [{ data: products }, { data: posts }] = await Promise.all([
        supabase.from('products').select('slug, updated_at').eq('is_active', true),
        supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true),
      ])
      products?.forEach((p) => {
        urls.push({
          loc: `/e-katalog/${p.slug}`,
          lastmod: toLastmod(p.updated_at as string),
          changefreq: 'weekly',
          priority: '0.7',
        })
      })
      posts?.forEach((p) => {
        urls.push({
          loc: `/blog/${p.slug}`,
          lastmod: toLastmod(p.updated_at as string),
          changefreq: 'monthly',
          priority: '0.6',
        })
      })
    } catch {
      console.warn('Supabase slug fetch failed — static URLs only.')
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrlXml).join('\n')}
</urlset>
`

  const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`

  writeFileSync('public/sitemap.xml', xml)
  writeFileSync('public/robots.txt', robots)
  console.log(`Sitemap: ${urls.length} URLs → public/sitemap.xml`)
}

main()
