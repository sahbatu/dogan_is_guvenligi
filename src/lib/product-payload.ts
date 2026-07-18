import type { ProductFormData } from '@/components/admin/ProductForm'

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function resolveCategoryId(
  categoryId: string,
  categories: { id: string }[],
): string | null {
  const trimmed = categoryId.trim()
  if (trimmed && categories.some((c) => c.id === trimmed)) return trimmed
  return categories[0]?.id ?? null
}

export function buildProductPayload(data: ProductFormData, categoryId: string) {
  return {
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim() || null,
    category_id: categoryId,
    image_url: emptyToNull(data.image_url),
    image_urls: data.image_urls,
    price: data.price,
    stock: data.stock,
    sku: emptyToNull(data.sku),
    is_active: data.is_active,
    sort_order: data.sort_order,
    meta_title: emptyToNull(data.meta_title),
    meta_description: emptyToNull(data.meta_description),
    meta_robots: emptyToNull(data.meta_robots) ?? 'index,follow',
    canonical_path: emptyToNull(data.canonical_path),
    og_title: emptyToNull(data.og_title),
    og_description: emptyToNull(data.og_description),
    og_image_url: emptyToNull(data.og_image_url),
    og_type: data.og_type || 'product',
    twitter_card: data.twitter_card || 'summary_large_image',
    focus_keyword: emptyToNull(data.focus_keyword),
  }
}
