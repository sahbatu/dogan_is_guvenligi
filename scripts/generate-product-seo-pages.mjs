import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(root, 'dist')
const pageSize = 1000

function loadEnvFile(text) {
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

async function loadEnvFiles() {
  for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    try {
      loadEnvFile(await readFile(path.join(root, name), 'utf8'))
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value, length) {
  if (value.length <= length) return value
  return `${value.slice(0, length - 1).trimEnd()}…`
}

function absoluteUrl(base, value) {
  if (!value) return undefined
  const trimmed = String(value).trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

function normalizeImages(product, siteUrl, storageUrl) {
  const candidates = Array.isArray(product.image_urls) && product.image_urls.length
    ? product.image_urls
    : [product.image_url]

  return [...new Set(candidates
    .filter((url) => typeof url === 'string' && url.trim())
    .map((url) => {
      const trimmed = url.trim()
      if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/storage\/v1\//i.test(trimmed)) {
        return `${storageUrl}${trimmed.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, '')}`
      }
      if (trimmed.startsWith('/storage/v1/')) return `${storageUrl}${trimmed}`
      return absoluteUrl(siteUrl, trimmed)
    })
    .filter(Boolean))]
}

function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function canonicalFor(product, siteUrl) {
  return `${siteUrl}/e-katalog/${product.slug}`
}

function productSchema(product, canonical, images, sellerName) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    url: canonical,
    name: product.name,
    description: stripHtml(product.description) || undefined,
    image: images.length > 1 ? images : images[0],
    sku: product.sku || undefined,
  }

  const price = product.price == null ? null : Number(product.price)
  if (price != null && Number.isFinite(price) && price > 0) {
    schema.offers = {
      '@type': 'Offer',
      url: canonical,
      price,
      priceCurrency: 'TRY',
      itemCondition: 'https://schema.org/NewCondition',
      // NULL means the quantity is intentionally not tracked publicly, not
      // that the product is unavailable. The product remains orderable.
      availability: product.stock == null || product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: sellerName ? { '@type': 'Organization', name: sellerName } : undefined,
    }
  }

  return schema
}

function productBreadcrumbSchema(product, canonical, siteUrl) {
  const items = [
    { name: 'Ana Sayfa', item: `${siteUrl}/` },
    { name: 'E-Katalog', item: `${siteUrl}/e-katalog` },
  ]
  if (product.category?.slug && product.category?.name) {
    items.push({ name: product.category.name, item: `${siteUrl}/e-katalog/kategori/${product.category.slug}` })
  }
  items.push({ name: product.name, item: canonical })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })),
  }
}

function productStaticBody(product, canonical, images) {
  const categoryLink = product.category?.slug ? `/e-katalog/kategori/${product.category.slug}` : '/e-katalog'
  const description = stripHtml(product.description) || `${product.name} ürün detayları.`
  return `<main><nav aria-label="Breadcrumb"><a href="/">Ana Sayfa</a> / <a href="/e-katalog">E-Katalog</a>${product.category?.name ? ` / <a href="${escapeHtml(categoryLink)}">${escapeHtml(product.category.name)}</a>` : ''} / <span aria-current="page">${escapeHtml(product.name)}</span></nav><article><h1>${escapeHtml(product.name)}</h1>${images[0] ? `<img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" />` : ''}<p>${escapeHtml(description)}</p>${product.price != null && Number(product.price) > 0 ? `<p>Fiyat: ${escapeHtml(String(product.price))} TRY</p>` : '<p>Fiyat ve teklif bilgisi için iletişime geçin.</p>'}<p><a href="${escapeHtml(categoryLink)}">${escapeHtml(product.category?.name || 'E-Katalog')} ürünlerini inceleyin</a></p><p><a href="/iletisim?urun=${encodeURIComponent(product.name)}">Bu ürün için teklif alın</a></p></article></main>`
}

function replaceHead(html, product, settings, siteUrl, storageUrl) {
  const canonical = canonicalFor(product, siteUrl)
  const description = truncate(
    product.meta_description?.trim() || stripHtml(product.description) || `${product.name} ürün detayları ve teklif bilgileri.`,
    160,
  )
  const suffix = settings.default_meta_title_suffix?.trim() || settings.company_name?.trim() || 'Doğan İş Güvenliği'
  const rawTitle = product.meta_title?.trim() || product.og_title?.trim() || product.name
  const title = rawTitle.includes(suffix) ? rawTitle : `${rawTitle} | ${suffix}`
  const images = normalizeImages(product, siteUrl, storageUrl)
  const customOgImages = normalizeImages({ image_url: product.og_image_url, image_urls: [] }, siteUrl, storageUrl)
  const ogImage = customOgImages[0] || images[0] || absoluteUrl(siteUrl, settings.default_og_image_url)
  const robots = product.meta_robots?.trim() || settings.default_meta_robots?.trim() || 'index,follow'
  const schemas = [
    productSchema(product, canonical, images, settings.company_name),
    productBreadcrumbSchema(product, canonical, siteUrl),
    ...(Array.isArray(product.schema_json) ? product.schema_json : product.schema_json ? [product.schema_json] : []),
  ]

  const tags = [
    `<title data-rh="true">${escapeHtml(title)}</title>`,
    `<meta data-rh="true" name="description" content="${escapeHtml(description)}" />`,
    `<meta data-rh="true" name="robots" content="${escapeHtml(robots)}" />`,
    `<link data-rh="true" rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta data-rh="true" property="og:title" content="${escapeHtml(product.og_title?.trim() || rawTitle)}" />`,
    `<meta data-rh="true" property="og:description" content="${escapeHtml(product.og_description?.trim() || description)}" />`,
    ogImage ? `<meta data-rh="true" property="og:image" content="${escapeHtml(ogImage)}" />` : '',
    `<meta data-rh="true" property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta data-rh="true" property="og:type" content="${escapeHtml(product.og_type?.trim() || 'product')}" />`,
    `<meta data-rh="true" name="twitter:card" content="${escapeHtml(product.twitter_card?.trim() || 'summary_large_image')}" />`,
    `<script data-rh="true" type="application/ld+json">${safeJson(schemas)}</script>`,
  ].filter(Boolean).join('\n    ')

  return html
    .replace(/\s*<title>[^<]*<\/title>/i, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/i, '')
    .replace('</head>', `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${productStaticBody(product, canonical, images)}</div>`)
}

async function fetchAllProducts(supabase) {
  const products = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,slug,description,image_url,image_urls,price,stock,sku,meta_title,meta_description,meta_robots,canonical_path,og_title,og_description,og_image_url,og_type,twitter_card,schema_json,category:categories(id,name,slug,parent_id)')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) throw error
    const batch = data ?? []
    products.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return products
}

async function main() {
  await loadEnvFiles()

  const siteUrl = (process.env.VITE_SITE_URL?.trim() || 'https://doganiselbiseleri.com.tr').replace(/\/$/, '')
  const storageUrl = (
    process.env.VITE_SUPABASE_REMOTE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    ''
  ).replace(/\/$/, '')
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!storageUrl || !supabaseKey) throw new Error('Supabase build environment is not configured.')

  const template = await readFile(path.join(outputRoot, 'index.html'), 'utf8')
  const supabase = createClient(storageUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const [{ data: settingsData, error: settingsError }, products] = await Promise.all([
    supabase.from('site_settings').select('company_name,default_meta_title_suffix,default_meta_robots,default_og_image_url').maybeSingle(),
    fetchAllProducts(supabase),
  ])

  if (settingsError) throw settingsError
  const settings = settingsData ?? {}

  for (const product of products) {
    if (!product.slug) continue
    const outputDir = path.join(outputRoot, 'e-katalog', product.slug)
    await mkdir(outputDir, { recursive: true })
    await writeFile(
      path.join(outputDir, 'index.html'),
      replaceHead(template, product, settings, siteUrl, storageUrl),
      'utf8',
    )
  }

  console.log(`Generated ${products.length} product SEO pages in dist/e-katalog/.`)
}

main().catch((error) => {
  console.error('Product SEO page generation failed:', error)
  process.exitCode = 1
})
