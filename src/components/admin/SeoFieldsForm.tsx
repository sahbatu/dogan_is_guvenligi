import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { SeoFields } from '@/types/seo'

export interface SeoFormValues extends SeoFields {
  meta_title: string
  meta_description: string
  meta_robots: string
  og_title: string
  og_description: string
  og_image_url: string
  focus_keyword: string
}

interface SeoFieldsFormProps {
  values: SeoFormValues
  onChange: (values: SeoFormValues) => void
  showPreview?: boolean
}

export function emptySeoValues(): SeoFormValues {
  return {
    meta_title: '',
    meta_description: '',
    meta_robots: 'index,follow',
    canonical_path: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    focus_keyword: '',
  }
}

export function seoFromEntity(entity?: SeoFields | null, fallbacks?: { title?: string; description?: string; image?: string }): SeoFormValues {
  return {
    meta_title: entity?.meta_title ?? fallbacks?.title ?? '',
    meta_description: entity?.meta_description ?? fallbacks?.description ?? '',
    meta_robots: entity?.meta_robots ?? 'index,follow',
    canonical_path: entity?.canonical_path ?? '',
    og_title: entity?.og_title ?? '',
    og_description: entity?.og_description ?? '',
    og_image_url: entity?.og_image_url ?? fallbacks?.image ?? '',
    og_type: entity?.og_type ?? 'website',
    twitter_card: entity?.twitter_card ?? 'summary_large_image',
    focus_keyword: entity?.focus_keyword ?? '',
  }
}

export function SeoFieldsForm({ values, onChange, showPreview = true }: SeoFieldsFormProps) {
  const set = (key: keyof SeoFormValues, val: string) => onChange({ ...values, [key]: val })

  return (
    <div className="space-y-4">
      <div>
        <Input
          label={`Meta başlık (${values.meta_title.length}/60)`}
          value={values.meta_title}
          onChange={(e) => set('meta_title', e.target.value)}
        />
      </div>
      <div>
        <Textarea
          label={`Meta açıklama (${values.meta_description.length}/160)`}
          value={values.meta_description}
          onChange={(e) => set('meta_description', e.target.value)}
          rows={3}
        />
      </div>
      <Input
        label="Odak anahtar kelime"
        value={values.focus_keyword}
        onChange={(e) => set('focus_keyword', e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Robots"
          value={values.meta_robots}
          onChange={(e) => set('meta_robots', e.target.value)}
          placeholder="index,follow"
        />
        <Input
          label="Canonical path"
          value={values.canonical_path ?? ''}
          onChange={(e) => set('canonical_path', e.target.value)}
          placeholder="/ornek-sayfa"
        />
      </div>
      <Input
        label="OG başlık"
        value={values.og_title}
        onChange={(e) => set('og_title', e.target.value)}
      />
      <Textarea
        label="OG açıklama"
        value={values.og_description}
        onChange={(e) => set('og_description', e.target.value)}
        rows={2}
      />
      <Input
        label="OG görsel URL"
        value={values.og_image_url}
        onChange={(e) => set('og_image_url', e.target.value)}
        placeholder="https://... (1200×630 önerilir)"
      />

      {showPreview && (
        <div className="rounded-xl border border-navy-900/10 bg-surface/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Google önizleme</p>
          <p className="mt-2 text-lg text-[#1a0dab] line-clamp-1">
            {values.meta_title || 'Sayfa başlığı'}
          </p>
          <p className="text-sm text-[#006621]">doganisguvenligi.com › sayfa</p>
          <p className="mt-1 text-sm text-muted line-clamp-2">
            {values.meta_description || 'Meta açıklama burada görünür.'}
          </p>
        </div>
      )}
    </div>
  )
}
