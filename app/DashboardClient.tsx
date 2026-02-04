'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/lib/types/database'
import KanbanBoard from '@/components/KanbanBoard'
import TaskModal from '@/components/TaskModal'

interface DashboardClientProps {
  initialTasks: Task[]
}

export default function DashboardClient({ initialTasks }: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((current) => [payload.new as Task, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((current) =>
              current.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((current) =>
              current.filter((task) => task.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleTaskCreate = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id)

        if (error) throw error
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert([taskData])

        if (error) throw error
      }

      setIsModalOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleTaskMove = async (taskId: string, newStatus: Task['status']) => {
    // Optimistic update
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    // Sync with server
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
    } catch (error) {
      console.error('Error moving task:', error)
      // Revert on error
      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status: task.status } : task
        )
      )
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <>
      <KanbanBoard
        tasks={tasks}
        onTaskCreate={handleTaskCreate}
        onTaskEdit={handleTaskEdit}
        onTaskMove={handleTaskMove}
        onTaskDelete={handleTaskDelete}
      />

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
          onSave={handleTaskSave}
        />
      )}
    </>
  )
}
