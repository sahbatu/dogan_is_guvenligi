import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { ImageLightbox } from '@/components/ui/ImageLightbox'
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
  const [lightboxOpen, setLightboxOpen] = useState(false)

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
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full overflow-hidden bg-surface ring-1 ring-navy-900/[0.06] transition-shadow hover:ring-navy-900/15"
        aria-label="Görseli büyüt"
      >
        <img
          src={images[safeIndex]}
          alt={alt}
          className={cn('w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]', aspectClass)}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition-colors group-hover:bg-navy-950/20">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-5 w-5" />
          </span>
        </span>
      </button>

      <ImageLightbox
        images={images}
        alt={alt}
        index={safeIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActive}
      />
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
