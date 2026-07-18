import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { BlogPostRow, ContactSubmission, PageSection, PageSeo, SiteSettings } from '@/types/cms'
import type { SeoFields } from '@/types/seo'
import { getRemoteSupabaseUrl, resolveSupabaseClientUrl } from '@/lib/storage-url'

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product extends SeoFields {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  image_url: string | null
  image_urls: string[]
  price: number | null
  stock: number | null
  sku: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category | null
}

export type ProductInsert = {
  name: string
  slug: string
  description?: string | null
  category_id?: string | null
  image_url?: string | null
  image_urls?: string[]
  price?: number | null
  stock?: number | null
  sku?: string | null
  is_active?: boolean
  sort_order?: number
} & Partial<SeoFields>

export type ProductUpdate = Partial<ProductInsert> & { updated_at?: string }

export type { SiteSettings, PageSection, PageSeo, BlogPostRow, ContactSubmission }

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const supabaseClientUrl = resolveSupabaseClientUrl()

const PLACEHOLDER_MARKERS = [
  'your-project',
  'your-anon-key',
  'example.com',
  'placeholder',
  'changeme',
]

function isRealSupabaseConfig(url?: string, key?: string): boolean {
  if (!url || !key) return false
  const combined = `${url} ${key}`.toLowerCase()
  return !PLACEHOLDER_MARKERS.some((marker) => combined.includes(marker))
}

export const isSupabaseConfigured = isRealSupabaseConfig(getRemoteSupabaseUrl(), supabaseAnonKey)

/** Ağ hatası / timeout durumunda demo veriye hızlı düşmek için */
export async function withFetchTimeout<T>(promise: PromiseLike<T>, ms = 4000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Supabase isteği zaman aşımına uğradı')), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseClientUrl!, supabaseAnonKey!)
  }
  return supabaseInstance
}

export const supabase = getSupabase()
