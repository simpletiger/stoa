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
  { id: 'backlog', title: 'Backlog', color: 'border-dark-200' },
  { id: 'todo', title: 'To Do', color: 'border-blue' },
  { id: 'in-progress', title: 'In Progress', color: 'border-yellow' },
  { id: 'done', title: 'Done', color: 'border-green' },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
        <button
          onClick={onTaskCreate}
          className="flex items-center gap-2 bg-purple text-[#282a36] font-semibold px-4 py-2 rounded-lg hover:bg-purple/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)

            return (
              <div key={column.id} className="flex flex-col">
                <div className={`bg-[#1e1f29] rounded-lg border-2 ${column.color} p-4 flex-1`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <span className="text-xs bg-dark-100 text-dark-200 px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-dark-100/30 rounded-lg' : ''
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
