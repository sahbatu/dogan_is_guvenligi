import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { BlogPostRow } from '@/types/cms'
import { withSyncedGalleryImages } from '@/lib/gallery-images'

function mapBlog(row: Record<string, unknown>): BlogPostRow {
  const content = row.content
  return withSyncedGalleryImages({
    ...row,
    content: Array.isArray(content) ? (content as string[]) : [],
  } as BlogPostRow)
}

export function useBlogPosts(options?: { includeDrafts?: boolean }) {
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      setPosts([])
      setLoading(false)
      return
    }

    const supabase = getSupabase()!
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (!options?.includeDrafts) query = query.eq('is_published', true)

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
      setPosts([])
    } else {
      setPosts((data ?? []).map(mapBlog))
    }
    setLoading(false)
  }, [options?.includeDrafts])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    usingDemo: !isSupabaseConfigured,
    refetch: fetchPosts,
  }
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPostRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!slug) return

      if (!isSupabaseConfigured) {
        setPost(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = getSupabase()!
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (error || !data) {
        setPost(null)
      } else {
        setPost(mapBlog(data))
      }
      setLoading(false)
    }
    load()
  }, [slug])

  return { post, loading }
}
