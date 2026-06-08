import { useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { ContactSubmission } from '@/types/cms'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function MessagesAdminPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    const { data } = await getSupabase()!
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages((data as ContactSubmission[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: string) => {
    await getSupabase()!.from('contact_submissions').update({ is_read: true }).eq('id', id)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Silinsin mi?')) return
    await getSupabase()!.from('contact_submissions').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">İletişim mesajları</h1>
      <p className="mt-1 text-sm text-muted">Formdan gelen mesajlar.</p>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" /></div>
      ) : messages.length === 0 ? (
        <p className="mt-8 text-muted">Henüz mesaj yok.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`rounded-xl border p-5 ${m.is_read ? 'border-navy-900/5 bg-white' : 'border-accent-600/30 bg-accent-600/5'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-navy-900">{m.name}</p>
                  <p className="text-sm text-muted">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(m.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  {!m.is_read && <Button size="sm" variant="outline" onClick={() => markRead(m.id)}>Okundu</Button>}
                  <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>Sil</Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-navy-900 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
