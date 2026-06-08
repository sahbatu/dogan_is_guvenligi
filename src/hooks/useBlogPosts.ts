import { useCallback, useEffect, useState } from 'react'
import { getDefaultBlogPosts } from '@/lib/cms-defaults'
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

function getDemoPosts(includeDrafts?: boolean) {
  const demo = getDefaultBlogPosts()
  return includeDrafts ? demo : demo.filter((p) => p.is_published)
}

export function useBlogPosts(options?: { includeDrafts?: boolean }) {
  const [posts, setPosts] = useState<BlogPostRow[]>(() =>
    isSupabaseConfigured ? [] : getDemoPosts(options?.includeDrafts),
  )
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [usingDemo, setUsingDemo] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    if (!isSupabaseConfigured) {
      setPosts(getDemoPosts(options?.includeDrafts))
      setUsingDemo(true)
      setLoading(false)
      return
    }
    const supabase = getSupabase()!
    let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false })
    if (!options?.includeDrafts) query = query.eq('is_published', true)
    const { data, error } = await query
    if (error || !data?.length) {
      const demo = getDefaultBlogPosts()
      setPosts(options?.includeDrafts ? demo : demo.filter((p) => p.is_published))
      setUsingDemo(true)
    } else {
      setPosts(data.map(mapBlog))
      setUsingDemo(false)
    }
    setLoading(false)
  }, [options?.includeDrafts])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, usingDemo, refetch: fetchPosts }
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPostRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!slug) return
      if (!isSupabaseConfigured) {
        setPost(getDefaultBlogPosts().find((p) => p.slug === slug) ?? null)
        setLoading(false)
        return
      }
      const supabase = getSupabase()!
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()
      if (error || !data) {
        setPost(getDefaultBlogPosts().find((p) => p.slug === slug) ?? null)
      } else {
        setPost(mapBlog(data))
      }
      setLoading(false)
    }
    load()
  }, [slug])

  return { post, loading }
}
