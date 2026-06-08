import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BlogPostForm, type BlogPostFormData } from '@/components/admin/BlogPostForm'

export function BlogEditPage() {
  const { postId } = useParams<{ postId?: string }>()
  const navigate = useNavigate()
  const isNew = !postId
  const { posts, loading } = useBlogPosts({ includeDrafts: true })
  const post = postId ? posts.find((p) => p.id === postId) : null
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: BlogPostFormData) => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmamış. Demo modda blog kaydı yapılamaz.')
      return
    }

    const supabase = getSupabase()!
    const payload = { ...data, updated_at: new Date().toISOString() }
    setError(null)

    if (isNew) {
      const { error: err } = await supabase.from('blog_posts').insert(payload)
      if (err) {
        setError(err.message)
        return
      }
    } else {
      const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', postId)
      if (err) {
        setError(err.message)
        return
      }
    }

    navigate('/admin/panel/blog')
  }

  if (!isNew && !loading && !post) {
    return <Navigate to="/admin/panel/blog" replace />
  }

  if (loading && !isNew) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        backTo="/admin/panel/blog"
        backLabel="Blog listesine dön"
        title={isNew ? 'Yeni Blog Yazısı' : 'Yazıyı Düzenle'}
        description={isNew ? 'Yeni içerik oluşturun ve SEO ayarlarını yapın.' : post?.title}
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="rounded-2xl border border-navy-900/5 bg-white p-6 shadow-sm lg:p-8">
        <BlogPostForm
          initial={post}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/panel/blog')}
        />
      </div>
    </div>
  )
}
