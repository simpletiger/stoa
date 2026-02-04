'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task } from '@/lib/types/database'
import TaskCard from './TaskCard'
import { Plus } from 'lucide-react'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskCreate: () => void
  onTaskEdit: (task: Task) => void
  onTaskMove: (taskId: string, newStatus: Task['status']) => void
  onTaskDelete: (taskId: string) => void
}

const columns: { id: Task['status']; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-foreground-muted/20' },
  { id: 'todo', title: 'To Do', color: 'border-blue/30' },
  { id: 'in-progress', title: 'In Progress', color: 'border-yellow/30' },
  { id: 'done', title: 'Done', color: 'border-green/30' },
]

export default function KanbanBoard({
  tasks,
  onTaskCreate,
  onTaskEdit,
  onTaskMove,
  onTaskDelete,
}: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result

    if (!destination) return

    const newStatus = destination.droppableId as Task['status']
    onTaskMove(draggableId, newStatus)
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Tasks</h2>
          <p className="text-xs text-foreground-muted mt-0.5">Drag cards to change status</p>
        </div>
        <button
          onClick={onTaskCreate}
          className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)

            return (
              <div key={column.id} className="flex flex-col">
                <div className={`bg-surface/50 backdrop-blur-sm rounded-lg border ${column.color} p-3 flex-1`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground text-sm">{column.title}</h3>
                    <span className="text-[10px] bg-surface-elevated text-foreground-muted px-2 py-0.5 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[200px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/5 rounded-lg' : ''
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  onEdit={() => onTaskEdit(task)}
                                  onDelete={() => onTaskDelete(task.id)}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
