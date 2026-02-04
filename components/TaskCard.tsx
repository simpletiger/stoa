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
  high: 'bg-red text-[#282a36]',
  medium: 'bg-yellow text-[#282a36]',
  low: 'bg-blue text-[#282a36]',
}

const creatorColors = {
  jeremiah: 'text-purple',
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
      className={`bg-background border border-dark-100 rounded-lg p-4 cursor-pointer hover:border-purple transition-all ${
        isDragging ? 'shadow-xl rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-foreground flex-1 line-clamp-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-dark-200 hover:text-red transition-colors flex-shrink-0"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-dark-200 mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>

        {task.category && (
          <span className="flex items-center gap-1 text-xs text-dark-200">
            <Tag className="w-3 h-3" />
            {task.category}
          </span>
        )}

        {task.due_date && (
          <span className="flex items-center gap-1 text-xs text-dark-200">
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
          </span>
        )}

        <span
          className={`flex items-center gap-1 text-xs ${
            creatorColors[task.creator]
          } ml-auto`}
        >
          <User className="w-3 h-3" />
          {task.creator}
        </span>
      </div>
    </div>
  )
}
