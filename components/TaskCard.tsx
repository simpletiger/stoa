'use client'

import { Task } from '@/lib/types/database'
import { Calendar, Tag, Trash2, User } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  isDragging?: boolean
}

const priorityColors = {
  high: 'bg-red/10 text-red border-red/20',
  medium: 'bg-yellow/10 text-yellow border-yellow/20',
  low: 'bg-blue/10 text-blue border-blue/20',
}

const creatorColors = {
  jeremiah: 'text-accent',
  marcus: 'text-green',
}

export default function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      onClick={onEdit}
      className={`bg-surface border border-border rounded-lg p-3.5 cursor-pointer hover:border-white/20 hover:bg-surface-elevated transition-all group ${
        isDragging ? 'shadow-2xl shadow-white/10 rotate-2 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-foreground flex-1 line-clamp-2 text-sm leading-snug">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-red transition-all flex-shrink-0"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-foreground-muted mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority.toUpperCase()}
        </span>

        {task.category && (
          <span className="flex items-center gap-1 text-[10px] text-foreground-muted px-2 py-0.5 bg-surface-elevated rounded-md border border-border">
            <Tag className="w-2.5 h-2.5" />
            {task.category}
          </span>
        )}

        {task.due_date && (
          <span className="flex items-center gap-1 text-[10px] text-foreground-muted px-2 py-0.5 bg-surface-elevated rounded-md border border-border">
            <Calendar className="w-2.5 h-2.5" />
            {formatDate(task.due_date)}
          </span>
        )}

        <span
          className={`flex items-center gap-1 text-[10px] font-medium ${
            creatorColors[task.creator]
          } ml-auto`}
        >
          <User className="w-2.5 h-2.5" />
          {task.creator}
        </span>
      </div>
    </div>
  )
}
