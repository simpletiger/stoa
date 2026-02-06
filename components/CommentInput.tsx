'use client'

import { useState } from 'react'
import { Send, User } from 'lucide-react'

interface CommentInputProps {
  onSubmit: (content: string, author: 'jeremiah' | 'marcus') => Promise<void>
  disabled?: boolean
}

export default function CommentInput({ onSubmit, disabled }: CommentInputProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState<'jeremiah' | 'marcus'>('jeremiah')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      await onSubmit(content.trim(), author)
      setContent('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-foreground-muted flex-shrink-0" />
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value as 'jeremiah' | 'marcus')}
          className="text-xs bg-surface-elevated border border-border rounded px-2 py-1 text-foreground focus:border-white focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
          disabled={disabled || submitting}
        >
          <option value="jeremiah">Jeremiah</option>
          <option value="marcus">Marcus</option>
        </select>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          disabled={disabled || submitting}
          className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled || submitting}
          className="absolute bottom-2 right-2 p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
          title="Send comment"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
