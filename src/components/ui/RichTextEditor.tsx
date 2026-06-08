import { useEffect, useState, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link2,
  Undo2,
  Redo2,
  Code2,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  normalizeRichTextHtml,
  RICH_TEXT_ALLOWED_TAGS,
  sanitizeRichTextHtml,
} from '@/lib/rich-text'
import { RichTextContent } from '@/components/ui/RichTextContent'

interface RichTextEditorProps {
  label?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

type EditorMode = 'visual' | 'html'

function toEditorContent(value: string): string {
  if (!value.trim()) return ''
  return sanitizeRichTextHtml(value)
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Ürün açıklamasını yazın…',
  minHeight = '200px',
}: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [htmlSource, setHtmlSource] = useState(value)
  const [htmlError, setHtmlError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: toEditorContent(value),
    onUpdate: ({ editor: ed }) => {
      if (mode === 'visual') {
        onChange(normalizeRichTextHtml(ed.getHTML()))
      }
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor__content outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor || mode !== 'visual') return
    const current = normalizeRichTextHtml(editor.getHTML())
    const next = normalizeRichTextHtml(toEditorContent(value))
    if (current !== next) {
      editor.commands.setContent(next || '<p></p>', { emitUpdate: false })
    }
  }, [editor, value, mode])

  useEffect(() => {
    if (mode === 'html') {
      setHtmlSource(value)
    }
  }, [value, mode])

  const applyHtmlSource = (raw: string) => {
    setHtmlSource(raw)
    const sanitized = sanitizeRichTextHtml(raw)
    const textOnly = sanitized.replace(/<[^>]*>/g, '').trim()
    if (raw.trim() && !textOnly) {
      setHtmlError('Geçersiz veya desteklenmeyen HTML. İçerik temizlendi.')
    } else if (raw.trim() && sanitized.length < raw.trim().length * 0.5 && raw.includes('<')) {
      setHtmlError('Bazı etiketler güvenlik nedeniyle kaldırıldı.')
    } else {
      setHtmlError(null)
    }
    onChange(normalizeRichTextHtml(raw))
  }

  const switchMode = (next: EditorMode) => {
    if (next === mode) return
    if (next === 'html') {
      setHtmlSource(value || '')
      setHtmlError(null)
      setMode('html')
      return
    }
    const normalized = normalizeRichTextHtml(htmlSource)
    onChange(normalized)
    editor?.commands.setContent(normalized || '<p></p>', { emitUpdate: false })
    setMode('visual')
  }

  const setLink = () => {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Bağlantı URL', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const ToolBtn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void
    active?: boolean
    children: ReactNode
    title: string
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'rounded-md p-2 transition-colors',
        active
          ? 'bg-navy-900 text-white'
          : 'text-muted hover:bg-surface hover:text-navy-900',
      )}
    >
      {children}
    </button>
  )

  const allowedTagsHint = RICH_TEXT_ALLOWED_TAGS.join(', ')

  return (
    <div className="space-y-2">
      {label && <span className="block text-sm font-medium text-navy-900">{label}</span>}

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => switchMode('visual')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'visual' ? 'bg-navy-900 text-white' : 'bg-surface text-muted hover:text-navy-900',
          )}
        >
          Görsel editör
        </button>
        <button
          type="button"
          onClick={() => switchMode('html')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'html' ? 'bg-navy-900 text-white' : 'bg-surface text-muted hover:text-navy-900',
          )}
        >
          <Code2 className="h-3.5 w-3.5" />
          HTML
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy-900/10 bg-white">
        {mode === 'visual' && editor && (
          <div className="flex flex-wrap gap-1 border-b border-navy-900/10 bg-surface/60 p-2">
            <ToolBtn
              title="Kalın"
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn
              title="İtalik"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn
              title="Başlık 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn
              title="Başlık 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn
              title="Madde işaretli liste"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
            >
              <List className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn
              title="Numaralı liste"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn title="Bağlantı" onClick={setLink} active={editor.isActive('link')}>
              <Link2 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn title="Geri al" onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn title="Yinele" onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 className="h-4 w-4" />
            </ToolBtn>
          </div>
        )}

        {mode === 'visual' ? (
          <div className="p-4" style={{ minHeight }}>
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="border-b border-navy-900/10 lg:border-b-0 lg:border-r">
              <div className="border-b border-navy-900/10 bg-surface/60 px-3 py-2 text-xs font-medium text-muted">
                HTML kaynağı
              </div>
              <textarea
                value={htmlSource}
                onChange={(e) => applyHtmlSource(e.target.value)}
                spellCheck={false}
                className="w-full resize-y bg-white p-4 font-mono text-xs leading-relaxed text-navy-900 outline-none"
                style={{ minHeight }}
                placeholder={'<p>Ürün açıklaması...</p>\n<ul>\n  <li>Madde 1</li>\n</ul>'}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 border-b border-navy-900/10 bg-surface/60 px-3 py-2 text-xs font-medium text-muted">
                <Eye className="h-3.5 w-3.5" />
                Ziyaretçi önizlemesi
              </div>
              <div className="p-4" style={{ minHeight }}>
                {htmlSource.trim() ? (
                  <RichTextContent html={htmlSource} />
                ) : (
                  <p className="text-sm text-muted">HTML yazdıkça önizleme burada görünür.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {htmlError && mode === 'html' && (
        <p className="text-xs text-amber-700">{htmlError}</p>
      )}

      <p className="text-xs text-muted">
        Görsel editör veya HTML modu kullanabilirsiniz. Desteklenen etiketler:{' '}
        <code className="rounded bg-surface px-1">{allowedTagsHint}</code>
        . Script ve güvenli olmayan kodlar otomatik temizlenir.
      </p>
    </div>
  )
}
