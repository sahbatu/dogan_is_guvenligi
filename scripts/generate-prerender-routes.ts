import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const staticRoutes = ['/', '/hakkimizda', '/e-katalog', '/blog', '/iletisim', '/kvkk', '/cerez-politikasi']

async function main() {
  const routes = [...staticRoutes]
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY

  if (url && key) {
    try {
      const supabase = createClient(url, key)
      const [{ data: products }, { data: posts }] = await Promise.all([
        supabase.from('products').select('slug').eq('is_active', true),
        supabase.from('blog_posts').select('slug').eq('is_published', true),
      ])
      products?.forEach((p) => routes.push(`/e-katalog/${p.slug}`))
      posts?.forEach((p) => routes.push(`/blog/${p.slug}`))
    } catch {
      console.warn('Supabase slug fetch failed — using static routes only.')
    }
  }

  writeFileSync('prerender-routes.json', JSON.stringify([...new Set(routes)], null, 2))
  console.log(`Wrote ${routes.length} prerender routes.`)
}

main()
