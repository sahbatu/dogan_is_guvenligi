import { resolveStoragePublicUrl, resolveStoragePublicUrls } from '@/lib/storage-url'

export const MAX_GALLERY_IMAGES = 8
export const MAX_PRODUCT_IMAGES = MAX_GALLERY_IMAGES
export const MAX_BLOG_IMAGES = MAX_GALLERY_IMAGES

export function normalizeGalleryImages(item: {
  image_url?: string | null
  image_urls?: string[] | null | unknown
}): string[] {
  const raw = item.image_urls
  if (Array.isArray(raw) && raw.length > 0) {
    return resolveStoragePublicUrls(
      raw.filter((url): url is string => typeof url === 'string' && url.length > 0),
    )
  }
  const primary = resolveStoragePublicUrl(item.image_url)
  if (primary) {
    return [primary]
  }
  return []
}

export function primaryGalleryImage(images: string[]): string | null {
  return images[0] ?? null
}

export function withSyncedGalleryImages<T extends {
  image_url?: string | null
  image_urls?: string[] | null | unknown
}>(item: T): T & { image_urls: string[]; image_url: string | null } {
  const image_urls = normalizeGalleryImages(item)
  return {
    ...item,
    image_urls,
    image_url: primaryGalleryImage(image_urls),
  }
}
