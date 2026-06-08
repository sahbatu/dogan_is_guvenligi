import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  alt: string
  aspectClass?: string
  thumbClass?: string
}

export function ProductGallery({
  images,
  alt,
  aspectClass = 'aspect-square',
  thumbClass = 'h-16 w-16 sm:h-20 sm:w-20',
}: ProductGalleryProps) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className={cn('flex items-center justify-center bg-surface text-muted ring-1 ring-navy-900/[0.06]', aspectClass)}>
        Görsel yok
      </div>
    )
  }

  const safeIndex = Math.min(active, images.length - 1)

  return (
    <div className="space-y-3">
      <div className="overflow-hidden bg-surface ring-1 ring-navy-900/[0.06]">
        <img
          src={images[safeIndex]}
          alt={alt}
          className={cn('w-full object-cover', aspectClass)}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition-all',
                safeIndex === index ? 'ring-accent-600' : 'opacity-70 hover:opacity-100',
              )}
            >
              <img src={url} alt="" className={cn('object-cover', thumbClass)} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
