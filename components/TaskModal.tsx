'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/lib/types/database'
import { X } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#1e1f29] rounded-lg border border-dark-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-[#1e1f29] border-b border-dark-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-dark-200 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none resize-none"
              placeholder="Add details about this task..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Task['status'] })
                }
                className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none"
                required
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as Task['priority'] })
                }
                className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none"
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
              <label className="block text-sm font-semibold text-foreground mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none"
                placeholder="e.g., admin, dev, design"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Creator *
            </label>
            <select
              value={formData.creator}
              onChange={(e) =>
                setFormData({ ...formData, creator: e.target.value as Task['creator'] })
              }
              className="w-full bg-background border border-dark-100 rounded-lg px-4 py-2 text-foreground focus:border-purple focus:outline-none"
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
              className="flex-1 px-4 py-2 border border-dark-100 text-foreground rounded-lg hover:bg-dark-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple text-[#282a36] font-semibold rounded-lg hover:bg-purple/90 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
