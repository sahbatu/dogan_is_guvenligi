export interface WebPConvertOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

const DEFAULT_OPTIONS: Required<WebPConvertOptions> = {
  quality: 0.85,
  maxWidth: 1920,
  maxHeight: 1920,
}

function scaleDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }
  const ratio = Math.min(maxWidth / width, maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

function canvasToWebP(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality)
  })
}

async function loadImageSource(file: File): Promise<{ source: CanvasImageSource; cleanup?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)
    return { source: bitmap, cleanup: () => bitmap.close() }
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Görsel okunamadı.'))
      image.src = url
    })
    return { source: img, cleanup: () => URL.revokeObjectURL(url) }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

/** Yüklenen raster görselleri WebP'ye dönüştürür. SVG gibi vektörler olduğu gibi kalır. */
export async function convertImageToWebP(
  file: File,
  options?: WebPConvertOptions,
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Yalnızca görsel dosyaları yüklenebilir.')
  }

  if (file.type === 'image/svg+xml') {
    return file
  }

  const { quality, maxWidth, maxHeight } = { ...DEFAULT_OPTIONS, ...options }

  const { source, cleanup } = await loadImageSource(file)

  try {
    let srcWidth: number
    let srcHeight: number
    if (source instanceof ImageBitmap) {
      srcWidth = source.width
      srcHeight = source.height
    } else {
      const img = source as HTMLImageElement
      srcWidth = img.naturalWidth
      srcHeight = img.naturalHeight
    }
    const { width, height } = scaleDimensions(srcWidth, srcHeight, maxWidth, maxHeight)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Görsel işlenemedi.')
    }

    ctx.drawImage(source, 0, 0, width, height)

    const blob = await canvasToWebP(canvas, quality)
    if (!blob) {
      return file
    }

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'image'
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() })
  } finally {
    cleanup?.()
  }
}

export function buildWebpStoragePath(prefix = ''): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
  return prefix ? `${prefix}/${id}` : id
}
