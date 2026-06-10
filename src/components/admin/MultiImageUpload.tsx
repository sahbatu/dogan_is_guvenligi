import { useRef, useState, type ChangeEvent } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { buildWebpStoragePath, convertImageToWebP } from '@/lib/image-webp'
import { buildStoragePublicUrl } from '@/lib/storage-url'
import { MAX_GALLERY_IMAGES } from '@/lib/gallery-images'

type StorageBucket = 'product-images' | 'site-images'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
  bucket?: StorageBucket
  label?: string
}

export function MultiImageUpload({
  value,
  onChange,
  max = MAX_GALLERY_IMAGES,
  bucket = 'product-images',
  label = 'Ürün Görselleri',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlDraft, setUrlDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const canAddMore = value.length < max

  const uploadFile = async (file: File) => {
    const webpFile = await convertImageToWebP(file)

    if (!isSupabaseConfigured) {
      return URL.createObjectURL(webpFile)
    }

    const supabase = getSupabase()!
    const path = buildWebpStoragePath()

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, webpFile, { upsert: false, contentType: 'image/webp' })

    if (uploadError) throw new Error(uploadError.message)

    return buildStoragePublicUrl(bucket, path)
  }

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const slots = max - value.length
    if (slots <= 0) {
      setError(`En fazla ${max} görsel eklenebilir.`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const toUpload = files.slice(0, slots)
      const urls: string[] = []
      for (const file of toUpload) {
        urls.push(await uploadFile(file))
      }
      onChange([...value, ...urls])
      if (files.length > slots) {
        setError(`Yalnızca ${slots} görsel daha eklenebildi (limit: ${max}).`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const addUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    if (!canAddMore) {
      setError(`En fazla ${max} görsel eklenebilir.`)
      return
    }
    onChange([...value, url])
    setUrlDraft('')
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-navy-900">{label}</label>
        <span className="text-xs text-muted">
          {value.length}/{max} · İlk görsel kapak
        </span>
      </div>

      {value.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-navy-900/10 bg-white"
            >
              <img src={url} alt="" className="aspect-video w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-md bg-navy-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Kapak
                </span>
              )}
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md bg-white/90 p-1 shadow-sm disabled:opacity-40"
                  aria-label="Sola taşı"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  className="rounded-md bg-white/90 p-1 shadow-sm disabled:opacity-40"
                  aria-label="Sağa taşı"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded-md bg-white/90 p-1 shadow-sm hover:bg-red-50"
                  aria-label="Kaldır"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-900/10',
              'bg-surface/50 px-6 py-8 transition-colors hover:border-accent-600/30 hover:bg-surface',
              uploading && 'pointer-events-none opacity-50',
            )}
          >
            {uploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
                <span className="text-sm text-muted">WebP&apos;ye dönüştürülüyor…</span>
              </>
            ) : (
              <>
                <Upload className="h-7 w-7 text-muted" />
                <span className="text-sm text-muted">Görsel ekle (birden fazla seçebilirsiniz)</span>
                <span className="text-xs text-muted/60">PNG, JPG → otomatik WebP</span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="veya görsel URL'si yapıştır"
              className="min-w-0 flex-1 rounded-lg border border-navy-900/10 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addUrl}
              className="rounded-lg border border-navy-900/10 px-3 py-2 text-sm font-medium text-navy-900 hover:bg-surface"
            >
              Ekle
            </button>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
