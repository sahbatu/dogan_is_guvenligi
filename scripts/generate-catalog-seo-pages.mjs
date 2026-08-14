import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(root, 'dist')
const PAGE_SIZE = 16
const FETCH_SIZE = 1000

// Some historical child categories have no database parent. The storefront
// deliberately presents them under these parent categories; static SEO pages
// use the same hierarchy as the interactive catalog.
const virtualParentBySlug = {
  'ankastre-sivi-sabun-ve-kopuk-sabun-dispenserleri': 'hijyen-aparatlari',
  'bone-galos-dispenserleri': 'hijyen-aparatlari',
  'cop-kovalari': 'cop-atik-posetleri',
  'fotoselli-el-ve-yuz-kurutma-cihazi': 'hijyen-aparatlari',
  'havlu-dispenserleri': 'hijyen-aparatlari',
  'klozet-fircalari': 'paspas-perdeler',
  'klozet-kapak-ortusu-dispenserleri': 'hijyen-aparatlari',
  'kopuk-sabun-dispenserleri': 'hijyen-aparatlari',
  'krom-kullukler': 'cop-atik-posetleri',
  'metal-yercek-ve-camcek-dispenserleri': 'paspas-perdeler',
  'nano-hijyen-dispenserleri-ve-koku-likitleri': 'hijyen-aparatlari',
  'pecetelikler': 'hijyen-aparatlari',
  'pisuvar-suzgecler': 'hijyen-aparatlari',
  'plastik-bardak-ve-karton-bardak-dispenserleri': 'hijyen-aparatlari',
  'sivi-sabun-dispenserleri': 'hijyen-aparatlari',
  'strec-dispenserleri': 'hijyen-aparatlari',
  'trigerli-sivi-puskurtuculeri-oda-kokulari': 'hijyen-aparatlari',
  'tuvalet-kagidi-dispenserleri': 'hijyen-aparatlari',
}

function loadEnvFile(text) {
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equals = trimmed.indexOf('=')
    if (equals <= 0) continue
    const key = trimmed.slice(0, equals).trim()
    let value = trimmed.slice(equals + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    if (process.env[key] === undefined) process.env[key] = value
  }
}

async function loadEnvFiles() {
  for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    try { loadEnvFile(await readFile(path.join(root, name), 'utf8')) } catch (error) { if (error?.code !== 'ENOENT') throw error }
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function truncate(value, length = 160) {
  const normalized = String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return normalized.length <= length ? normalized : `${normalized.slice(0, length - 1).trimEnd()}…`
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

function categoryUrl(slug) { return `/e-katalog/kategori/${encodeURIComponent(slug)}` }
function pageUrl(basePath, page) { return page <= 1 ? basePath : `${basePath}?sayfa=${page}` }

function descendantIds(category, categoriesById, allCategories) {
  const ids = new Set([category.id])
  const queue = [category.id]
  while (queue.length) {
    const currentId = queue.shift()
    const current = categoriesById.get(currentId)
    for (const candidate of allCategories) {
      const virtualChild = current && virtualParentBySlug[candidate.slug] === current.slug
      if ((candidate.parent_id === currentId || virtualChild) && !ids.has(candidate.id)) {
        ids.add(candidate.id)
        queue.push(candidate.id)
      }
    }
  }
  return ids
}

function categoryAncestors(category, categoriesById, categoriesBySlug) {
  const ancestors = []
  let current = category
  while (current) {
    const parent = current.parent_id
      ? categoriesById.get(current.parent_id)
      : categoriesBySlug.get(virtualParentBySlug[current.slug])
    if (!parent || ancestors.some((item) => item.id === parent.id)) break
    ancestors.unshift(parent)
    current = parent
  }
  return ancestors
}

function absoluteImage(product, siteUrl, storageUrl) {
  const candidate = Array.isArray(product.image_urls) && product.image_urls.length ? product.image_urls[0] : product.image_url
  if (!candidate) return ''
  if (/^https?:\/\//i.test(candidate)) return candidate
  if (candidate.startsWith('/storage/v1/')) return `${storageUrl}${candidate}`
  return `${siteUrl}${candidate.startsWith('/') ? '' : '/'}${candidate}`
}

function catalogBody({ title, description, basePath, products, page, totalPages, breadcrumbs, siteUrl, storageUrl }) {
  const cards = products.map((product) => {
    const image = absoluteImage(product, siteUrl, storageUrl)
    const price = product.price != null && Number(product.price) > 0
      ? `${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(product.price))}`
      : 'Fiyat için teklif alın'
    return `<li><a href="/e-katalog/${encodeURIComponent(product.slug)}"><article><div>${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />` : ''}</div><h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(price)}</p></article></a></li>`
  }).join('')
  const crumbs = breadcrumbs.map((item, index) => index === breadcrumbs.length - 1
    ? `<span aria-current="page">${escapeHtml(item.name)}</span>`
    : `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`).join('<span aria-hidden="true"> / </span>')
  const pagination = totalPages > 1 ? `<nav aria-label="Katalog sayfaları"><ul>${page > 1 ? `<li><a href="${escapeHtml(pageUrl(basePath, page - 1))}" rel="prev">Önceki sayfa</a></li>` : ''}<li>Sayfa ${page} / ${totalPages}</li>${page < totalPages ? `<li><a href="${escapeHtml(pageUrl(basePath, page + 1))}" rel="next">Sonraki sayfa</a></li>` : ''}</ul></nav>` : ''
  return `<main class="mx-auto max-w-7xl px-6 py-12 lg:px-8"><nav aria-label="Breadcrumb">${crumbs}</nav><header><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></header><ul>${cards}</ul>${pagination}</main>`
}

function replaceDocument(template, { title, description, canonical, robots, body, schema }) {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${escapeHtml(robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<script type="application/ld+json">${safeJson(schema)}</script>`,
  ].join('\n    ')
  return template
    .replace(/\s*<title>[^<]*<\/title>/i, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/i, '')
    .replace('</head>', `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

async function fetchAll(supabase, table, columns, filters = []) {
  const rows = []
  for (let from = 0; ; from += FETCH_SIZE) {
    let query = supabase.from(table).select(columns).range(from, from + FETCH_SIZE - 1)
    for (const [method, ...args] of filters) query = query[method](...args)
    const { data, error } = await query
    if (error) throw error
    rows.push(...(data ?? []))
    if ((data ?? []).length < FETCH_SIZE) return rows
  }
}

async function writePage(relativeFile, content) {
  const outputFile = path.join(outputRoot, relativeFile)
  await mkdir(path.dirname(outputFile), { recursive: true })
  await writeFile(outputFile, content, 'utf8')
}

async function main() {
  await loadEnvFiles()
  const siteUrl = (process.env.VITE_SITE_URL?.trim() || 'https://doganiselbiseleri.com.tr').replace(/\/$/, '')
  const storageUrl = (process.env.VITE_SUPABASE_REMOTE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || '').replace(/\/$/, '')
  const key = process.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!storageUrl || !key) throw new Error('Supabase build environment is not configured.')

  const template = await readFile(path.join(outputRoot, 'index.html'), 'utf8')
  const supabase = createClient(storageUrl, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const [settings, categories, products] = await Promise.all([
    supabase.from('site_settings').select('company_name,default_meta_title_suffix').maybeSingle(),
    fetchAll(supabase, 'categories', 'id,name,slug,parent_id,sort_order'),
    fetchAll(supabase, 'products', 'id,name,slug,price,image_url,image_urls,category_id,created_at,sort_order', [['eq', 'is_active', true]]),
  ])
  if (settings.error) throw settings.error

  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]))
  const suffix = settings.data?.default_meta_title_suffix || settings.data?.company_name || 'Doğan İş Güvenliği'
  let generated = 0

  async function generateListing({ title, description, basePath, listingProducts, breadcrumbs, outputBase }) {
    const ordered = [...listingProducts].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE))
    for (let page = 1; page <= totalPages; page += 1) {
      const pagePath = pageUrl(basePath, page)
      const pageTitle = page > 1 ? `${title} – Sayfa ${page}` : title
      const canonical = `${siteUrl}${pagePath}`
      const pageProducts = ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle,
        url: canonical,
        mainEntity: { '@type': 'ItemList', itemListElement: pageProducts.map((product, index) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + index + 1, url: `${siteUrl}/e-katalog/${product.slug}`, name: product.name })) },
      }
      const body = catalogBody({ title: pageTitle, description, basePath, products: pageProducts, page, totalPages, breadcrumbs, siteUrl, storageUrl })
      const file = page === 1 ? path.join(outputBase, 'index.html') : path.join(outputBase, 'sayfa', String(page), 'index.html')
      await writePage(file, replaceDocument(template, { title: `${pageTitle} | ${suffix}`, description, canonical, robots: 'index,follow', body, schema }))
      generated += 1
    }
  }

  await generateListing({
    title: 'E-Katalog',
    description: `${settings.data?.company_name || 'Doğan İş Güvenliği'} kurumsal ürün kataloğu.`,
    basePath: '/e-katalog',
    listingProducts: products,
    breadcrumbs: [{ name: 'Ana Sayfa', path: '/' }, { name: 'E-Katalog', path: '/e-katalog' }],
    outputBase: 'e-katalog',
  })

  for (const category of categories) {
    const categoryIds = descendantIds(category, categoriesById, categories)
    const listingProducts = products.filter((product) => product.category_id && categoryIds.has(product.category_id))
    if (!listingProducts.length) continue
    const ancestors = categoryAncestors(category, categoriesById, categoriesBySlug)
    const categoryPath = categoryUrl(category.slug)
    await generateListing({
      title: `${category.name} Ürünleri`,
      description: `${category.name} kategorisindeki kurumsal ürünleri, fiyat ve teklif bilgilerini inceleyin.`,
      basePath: categoryPath,
      listingProducts,
      breadcrumbs: [{ name: 'Ana Sayfa', path: '/' }, { name: 'E-Katalog', path: '/e-katalog' }, ...ancestors.map((item) => ({ name: item.name, path: categoryUrl(item.slug) })), { name: category.name, path: categoryPath }],
      outputBase: path.join('e-katalog', 'kategori', category.slug),
    })
  }

  console.log(`Generated ${generated} catalog and category SEO pages in dist/e-katalog/.`)
}

main().catch((error) => { console.error('Catalog SEO page generation failed:', error); process.exitCode = 1 })
