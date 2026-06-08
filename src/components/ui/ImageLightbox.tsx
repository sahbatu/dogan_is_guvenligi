import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
  alt: string
  index: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function ImageLightbox({
  images,
  alt,
  index,
  open,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const hasMultiple = images.length > 1
  const safeIndex = Math.min(Math.max(index, 0), images.length - 1)

  const goPrev = useCallback(() => {
    onIndexChange(safeIndex === 0 ? images.length - 1 : safeIndex - 1)
  }, [safeIndex, images.length, onIndexChange])

  const goNext = useCallback(() => {
    onIndexChange(safeIndex === images.length - 1 ? 0 : safeIndex + 1)
  }, [safeIndex, images.length, onIndexChange])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasMultiple) goPrev()
      if (e.key === 'ArrowRight' && hasMultiple) goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose, goPrev, goNext, hasMultiple])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Görsel önizleme"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy-950/92 backdrop-blur-sm"
            onClick={onClose}
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMultiple && (
            <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              {safeIndex + 1} / {images.length}
            </div>
          )}

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4 sm:p-2.5"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          )}

          <motion.img
            key={images[safeIndex]}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            src={images[safeIndex]}
            alt={alt}
            className="relative z-[1] max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4 sm:p-2.5"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
