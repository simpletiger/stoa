'use client'

import { Comment } from '@/lib/types/database'
import { User, Clock } from 'lucide-react'

interface CommentThreadProps {
  comments: Comment[]
  loading: boolean
}

const authorColors = {
  jeremiah: 'text-accent',
  marcus: 'text-green',
}

export default function CommentThread({ comments, loading }: CommentThreadProps) {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="bg-surface-elevated rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-16 h-3 bg-border rounded" />
              <div className="w-12 h-3 bg-border rounded" />
            </div>
            <div className="w-full h-12 bg-border rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-muted text-sm">
        <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border mx-auto mb-3 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <p>No comments yet</p>
        <p className="text-xs mt-1">Start the conversation</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-surface-elevated border border-border rounded-lg p-3.5 hover:border-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-foreground-muted" />
              <span className={`text-xs font-medium ${authorColors[comment.author]}`}>
                {comment.author}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
              <Clock className="w-3 h-3" />
              {formatTimestamp(comment.created_at)}
            </div>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  )
}
