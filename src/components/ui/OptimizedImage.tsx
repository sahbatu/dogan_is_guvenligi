import type { ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { isLocalRaster, responsiveWebpSrcSet } from '@/lib/image-src'

export function webpSrc(src: string): string {
  return src.replace(/\.(jpe?g|png)$/i, '.webp')
}

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  className,
  width,
  height,
  loading,
  decoding = 'async',
  fetchPriority,
  sizes,
  srcSet: srcSetProp,
  ...props
}: OptimizedImageProps) {
  const webpSrcSet = srcSetProp ?? (isLocalRaster(src) ? responsiveWebpSrcSet(src) : undefined)
  const isFill = className?.includes('absolute')

  const imgProps: ImgHTMLAttributes<HTMLImageElement> = {
    alt,
    width,
    height,
    loading: loading ?? (priority ? 'eager' : 'lazy'),
    decoding,
    fetchPriority: fetchPriority ?? (priority ? 'high' : undefined),
    className: cn(isFill ? 'h-full w-full' : undefined, className),
    ...props,
  }

  if (!isLocalRaster(src)) {
    return <img src={src} {...imgProps} />
  }

  const resolvedSizes = sizes ?? (webpSrcSet ? '(max-width: 640px) 90vw, 50vw' : undefined)

  return (
    <picture className={cn(isFill && 'absolute inset-0 block h-full w-full')}>
      {webpSrcSet ? (
        <source srcSet={webpSrcSet} sizes={resolvedSizes} type="image/webp" />
      ) : (
        <source srcSet={webpSrc(src)} type="image/webp" />
      )}
      <img src={src} {...imgProps} />
    </picture>
  )
}
