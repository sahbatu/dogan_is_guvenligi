import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { buildWebpStoragePath, convertImageToWebP } from '@/lib/image-webp'

interface SiteImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
}

export function SiteImageUpload({ value, onChange, label = 'Görsel' }: SiteImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmamış.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const webpFile = await convertImageToWebP(file)
      const supabase = getSupabase()!
      const path = buildWebpStoragePath()

      const { error: uploadError } = await supabase.storage.from('site-images').upload(path, webpFile, {
        contentType: 'image/webp',
      })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data } = supabase.storage.from('site-images').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel dönüştürülemedi.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-navy-900">{label}</span>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-auto rounded-lg object-cover ring-1 ring-navy-900/10" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-navy-900/20 px-4 py-2 text-sm text-muted hover:border-accent-600 hover:text-accent-600">
            <Upload className="h-4 w-4" />
            {uploading ? 'WebP\'ye dönüştürülüyor…' : 'Yükle (otomatik WebP)'}
          </span>
        </label>
        <input
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="veya URL yapıştır"
          className="min-w-[200px] flex-1 rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
