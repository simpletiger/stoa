'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/lib/types/database'
import { X, MessageSquare } from 'lucide-react'
import CommentThread from './CommentThread'
import CommentInput from './CommentInput'
import { useComments } from '@/lib/hooks/useComments'

interface TaskModalProps {
  task: Task | null
  onClose: () => void
  onSave: (taskData: Partial<Task>) => void
}

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'backlog',
    priority: task?.priority || 'medium',
    category: task?.category || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    creator: task?.creator || 'jeremiah',
  })

  const { comments, loading, addComment, commentCount } = useComments(task?.id || null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const taskData: Partial<Task> = {
      ...formData,
      due_date: formData.due_date || null,
      category: formData.category || null,
    }

    onSave(taskData)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-border p-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 resize-none transition-all"
              placeholder="Add details about this task..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Task['status'] })
                }
                className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                required
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as Task['priority'] })
                }
                className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                placeholder="e.g., admin, dev, design"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Creator *
            </label>
            <select
              value={formData.creator}
              onChange={(e) =>
                setFormData({ ...formData, creator: e.target.value as Task['creator'] })
              }
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
              required
            >
              <option value="jeremiah">Jeremiah</option>
              <option value="marcus">Marcus</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-surface-elevated transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-all"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>

        {task && (
          <div className="border-t border-border p-5 bg-surface/50">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-foreground-muted" />
              <h3 className="text-sm font-semibold text-foreground">
                Comments {commentCount > 0 && `(${commentCount})`}
              </h3>
            </div>

            <div className="space-y-4">
              <CommentThread comments={comments} loading={loading} />
              <CommentInput onSubmit={addComment} disabled={loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
