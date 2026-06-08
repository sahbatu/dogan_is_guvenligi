import { useState } from 'react'
import type { BlogPostRow } from '@/types/cms'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { MultiImageUpload } from '@/components/admin/MultiImageUpload'
import { SeoFieldsForm, seoFromEntity, type SeoFormValues } from '@/components/admin/SeoFieldsForm'
import { blogContentFromEditorHtml, blogContentToEditorHtml } from '@/lib/blog-content'
import { MAX_BLOG_IMAGES, normalizeGalleryImages } from '@/lib/gallery-images'
import { slugify, cn } from '@/lib/utils'

export interface BlogPostFormData {
  title: string
  slug: string
  excerpt: string
  content: string[]
  category: string
  image_url: string | null
  image_urls: string[]
  published_at: string | null
  read_time: number
  is_published: boolean
  meta_title: string | null
  meta_description: string | null
  meta_robots: string | null
  canonical_path: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  og_type: string
  twitter_card: string | null
  focus_keyword: string | null
}

interface BlogPostFormProps {
  initial?: BlogPostRow | null
  onSubmit: (data: BlogPostFormData) => Promise<void>
  onCancel: () => void
}

export function BlogPostForm({ initial, onSubmit, onCancel }: BlogPostFormProps) {
  const [tab, setTab] = useState<'content' | 'seo'>('content')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [content, setContent] = useState(() => blogContentToEditorHtml(initial?.content ?? []))
  const [category, setCategory] = useState(initial?.category ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(() =>
    initial ? normalizeGalleryImages(initial) : [],
  )
  const [publishedAt, setPublishedAt] = useState(
    initial?.published_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  )
  const [readTime, setReadTime] = useState(initial?.read_time ?? 5)
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false)
  const [seo, setSeo] = useState<SeoFormValues>(() =>
    seoFromEntity(initial, {
      title: initial?.title,
      description: initial?.excerpt ?? undefined,
      image: normalizeGalleryImages(initial ?? {})[0],
    }),
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      title,
      slug,
      excerpt,
      content: blogContentFromEditorHtml(content),
      category,
      image_url: imageUrls[0] ?? null,
      image_urls: imageUrls,
      published_at: publishedAt || null,
      read_time: readTime,
      is_published: isPublished,
      meta_title: seo.meta_title || null,
      meta_description: seo.meta_description || null,
      meta_robots: seo.meta_robots || 'index,follow',
      canonical_path: seo.canonical_path || null,
      og_title: seo.og_title || null,
      og_description: seo.og_description || null,
      og_image_url: seo.og_image_url || imageUrls[0] || null,
      og_type: 'article',
      twitter_card: seo.twitter_card || 'summary_large_image',
      focus_keyword: seo.focus_keyword || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-2 border-b border-navy-900/10 pb-2">
        {(['content', 'seo'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              tab === t ? 'bg-navy-900 text-white' : 'text-muted hover:text-navy-900',
            )}
          >
            {t === 'content' ? 'İçerik' : 'SEO'}
          </button>
        ))}
      </div>

      {tab === 'content' ? (
        <div className="space-y-4">
          <Input
            label="Başlık"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!initial) setSlug(slugify(e.target.value))
            }}
            required
          />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <Textarea label="Özet" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          <RichTextEditor
            label="İçerik"
            value={content}
            onChange={setContent}
            placeholder="Blog yazısının tam metni…"
            minHeight="320px"
          />
          <Input label="Kategori" value={category} onChange={(e) => setCategory(e.target.value)} />
          <MultiImageUpload
            label="Blog Görselleri"
            value={imageUrls}
            onChange={setImageUrls}
            max={MAX_BLOG_IMAGES}
            bucket="site-images"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Yayın tarihi"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
            <Input
              label="Okuma süresi (dk)"
              type="number"
              min={1}
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Yayında
          </label>
        </div>
      ) : (
        <SeoFieldsForm values={seo} onChange={setSeo} />
      )}

      <div className="flex justify-end gap-3 border-t border-navy-900/10 pt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Yayınla'}
        </Button>
      </div>
    </form>
  )
}
