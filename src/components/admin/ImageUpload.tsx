import { useState, useRef, type ChangeEvent } from 'react'

import { Upload, X, ImageIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

import { buildWebpStoragePath, convertImageToWebP } from '@/lib/image-webp'
import { buildStoragePublicUrl } from '@/lib/storage-url'



interface ImageUploadProps {

  value: string | null

  onChange: (url: string | null) => void

}



export function ImageUpload({ value, onChange }: ImageUploadProps) {

  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)



  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]

    if (!file) return



    setUploading(true)

    setError(null)



    try {

      const webpFile = await convertImageToWebP(file)



      if (!isSupabaseConfigured) {

        onChange(URL.createObjectURL(webpFile))

        return

      }



      const supabase = getSupabase()!

      const path = buildWebpStoragePath()



      const { error: uploadError } = await supabase.storage

        .from('product-images')

        .upload(path, webpFile, {

          upsert: false,

          contentType: 'image/webp',

        })



      if (uploadError) {

        setError(uploadError.message)

        return

      }



      onChange(buildStoragePublicUrl('product-images', path))

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Görsel dönüştürülemedi.')

    } finally {

      setUploading(false)

      if (inputRef.current) inputRef.current.value = ''

    }

  }



  return (

    <div className="space-y-2">

      <label className="block text-sm font-medium text-navy-900">Ürün Görseli</label>

      {value ? (

        <div className="relative aspect-video overflow-hidden rounded-xl border border-navy-900/10">

          <img src={value} alt="Ürün" className="h-full w-full object-cover" />

          <button

            type="button"

            onClick={() => onChange(null)}

            className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"

          >

            <X className="h-4 w-4 text-navy-900" />

          </button>

        </div>

      ) : (

        <button

          type="button"

          onClick={() => inputRef.current?.click()}

          disabled={uploading}

          className={cn(

            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-900/10',

            'bg-surface/50 px-6 py-10 transition-colors hover:border-accent-600/30 hover:bg-surface',

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

              <Upload className="h-8 w-8 text-muted" />

              <span className="text-sm text-muted">Görsel yüklemek için tıklayın</span>

              <span className="text-xs text-muted/60">PNG, JPG → otomatik WebP</span>

            </>

          )}

        </button>

      )}

      <input

        ref={inputRef}

        type="file"

        accept="image/*"

        className="hidden"

        onChange={handleFile}

      />

      {!value && (

        <div className="flex items-center gap-2">

          <ImageIcon className="h-4 w-4 text-muted" />

          <input

            type="url"

            placeholder="veya görsel URL'si girin"

            className="flex-1 rounded-lg border border-navy-900/10 px-3 py-2 text-sm"

            onBlur={(e) => e.target.value && onChange(e.target.value)}

          />

        </div>

      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

    </div>

  )

}


