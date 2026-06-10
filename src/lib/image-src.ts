import imageVariantsJson from '@/generated/image-variants.json'
import { webpSrc } from '@/components/ui/OptimizedImage'

type ImageVariantMeta = { widths: number[]; fullWidth: number }
const imageVariants = imageVariantsJson as Record<string, ImageVariantMeta>

export function isLocalRaster(src: string): boolean {
  return src.startsWith('/') && /\.(jpe?g|png)$/i.test(src)
}

/** LCP preload — mobil için orta boy varyant */
export function lcpImagePreloadSrc(src: string): string {
  if (!isLocalRaster(src)) return src
  const meta = imageVariants[src]
  const webp = webpSrc(src)
  const base = webp.replace(/\.webp$/i, '')
  const preloadW = meta?.widths.includes(480) ? 480 : meta?.widths[meta.widths.length - 1]
  if (preloadW) return `${base}-${preloadW}w.webp`
  return webp
}

export function responsiveWebpSrcSet(src: string): string | undefined {
  if (!isLocalRaster(src)) return undefined

  const meta = imageVariants[src]
  const webp = webpSrc(src)
  const base = webp.replace(/\.webp$/i, '')

  if (!meta?.widths.length) {
    return webp
  }

  const parts = meta.widths.map((w) => `${base}-${w}w.webp ${w}w`)
  parts.push(`${webp} ${meta.fullWidth}w`)
  return parts.join(', ')
}

export function logoSrcSet(): string {
  return '/logo-200w.webp 200w, /logo-320w.webp 320w'
}

/** @deprecated Use lcpImagePreloadSrc */
export function preferredImageSrc(src: string): string {
  return isLocalRaster(src) ? webpSrc(src) : src
}
