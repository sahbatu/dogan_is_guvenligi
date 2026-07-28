import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { loadEnvFiles } from './load-env'

const staticRoutes = ['/', '/hakkimizda', '/e-katalog', '/blog', '/iletisim', '/kvkk', '/cerez-politikasi']
const pageSize = 1000

interface RouteRow {
  slug: string | null
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
  loadEnvFiles()
  const routes = [...staticRoutes]
  const url = process.env.VITE_SUPABASE_REMOTE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  const key = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (url && key) {
    try {
      const supabase = createClient(url, key)
      const [products, posts] = await Promise.all([
        fetchAllRows<RouteRow>((from, to) =>
          supabase.from('products').select('slug').eq('is_active', true).range(from, to),
        ),
        fetchAllRows<RouteRow>((from, to) =>
          supabase.from('blog_posts').select('slug').eq('is_published', true).range(from, to),
        ),
      ])

      products.forEach((product) => {
        if (product.slug) routes.push(`/e-katalog/${product.slug}`)
      })

      posts.forEach((post) => {
        if (post.slug) routes.push(`/blog/${post.slug}`)
      })
    } catch {
      console.warn('Supabase slug fetch failed; using static routes only.')
    }
  }

  const uniqueRoutes = [...new Set(routes)]
  writeFileSync('prerender-routes.json', JSON.stringify(uniqueRoutes, null, 2))
  console.log(`Wrote ${uniqueRoutes.length} prerender routes.`)
}

main()
