import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { BlogPostRow } from '@/types/cms'
import { Button } from '@/components/ui/Button'

export function BlogAdminPage() {
  const { posts, refetch } = useBlogPosts({ includeDrafts: true })

  const remove = async (post: BlogPostRow) => {
    if (!confirm('Silinsin mi?')) return
    if (!isSupabaseConfigured) return
    await getSupabase()!.from('blog_posts').delete().eq('id', post.id)
    refetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Blog</h1>
          <p className="mt-1 text-sm text-muted">Blog yazılarını ve SEO ayarlarını yönetin.</p>
        </div>
        <Link to="/admin/panel/blog/yeni">
          <Button>
            <Plus className="h-4 w-4" />
            Yeni Yazı
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded-xl border border-navy-900/5 bg-white p-4"
          >
            <div>
              <p className="font-medium text-navy-900">{post.title}</p>
              <p className="text-xs text-muted">
                {post.slug} · {post.is_published ? 'Yayında' : 'Taslak'}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/admin/panel/blog/${post.id}/duzenle`}
                className="p-2 text-muted hover:text-accent-600"
                aria-label="Düzenle"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                onClick={() => remove(post)}
                className="p-2 text-muted hover:text-red-600"
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
