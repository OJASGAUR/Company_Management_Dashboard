"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getTasks, updateTaskStatus, createTask, deleteTask } from "../actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { FormField, Input, Select } from "@/components/ui/FormField"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { RemoveButton } from "@/components/ui/RemoveButton"
import CalendarBar from "./CalendarBar"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
}

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "border-slate-300" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-indigo-400" },
  { id: "IN_REVIEW", label: "In Review", color: "border-amber-400" },
  { id: "COMPLETED", label: "Completed", color: "border-emerald-400" },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    getTasks().then((data) => {
      setTasks(data as Task[])
      setLoading(false)
    })
  }, [])

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
    setActiveDragId(taskId)
  }

  const handleDragEnd = () => {
    setActiveDragId(null)
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    setActiveDragId(null)
    if (!taskId) return

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))

    try {
      await updateTaskStatus(taskId, status)
    } catch (error) {
      console.error(error)
      const reloaded = await getTasks()
      setTasks(reloaded as Task[])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDeleteTask = async (taskId: string) => {
    setDeletingId(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error(error)
      const reloaded = await getTasks()
      setTasks(reloaded as Task[])
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-sans">
      <PageHeader
        category="Workload"
        title="Kanban Task Board"
        description="Drag tasks between columns to update status in real-time."
        actions={
          <Button
            onClick={() => setShowNewTask(!showNewTask)}
            variant={showNewTask ? "secondary" : "primary"}
            size="md"
          >
            {showNewTask ? "✕ Cancel" : "+ New Task"}
          </Button>
        }
      />

      <CalendarBar />

      <AnimatePresence>
        {showNewTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-indigo-200 bg-indigo-50/20 shadow-md">
              <form
                action={async (formData) => {
                  await createTask(formData)
                  setShowNewTask(false)
                  const newTasks = await getTasks()
                  setTasks(newTasks as Task[])
                }}
                className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <FormField label="Task Title" required>
                  <Input name="title" required placeholder="e.g. Design Landing Hero" />
                </FormField>

                <FormField label="Priority">
                  <Select name="priority" defaultValue="MEDIUM">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </FormField>

                <FormField label="Description (Optional)">
                  <Input name="description" placeholder="Brief task details..." />
                </FormField>

                <div>
                  <Button type="submit" variant="primary" size="md" className="w-full">
                    Create Task
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex h-80 items-center justify-center text-slate-400 text-sm">
          Loading Kanban board...
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
                className={`flex min-h-[480px] flex-col rounded-2xl border ${col.color} bg-slate-100/70 p-4 shadow-sm transition-colors`}
              >
                <div className="mb-4 flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-slate-800">{col.label}</h3>
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  <AnimatePresence>
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`group relative cursor-grab rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md active:cursor-grabbing ${
                          activeDragId === task.id ? "opacity-40" : "opacity-100"
                        } ${deletingId === task.id ? "pointer-events-none opacity-50" : ""}`}
                      >
                        <RemoveButton onRemove={() => handleDeleteTask(task.id)} title="Remove task" />
                        <div className="mb-2 flex items-start justify-between gap-2 pr-6">
                          <StatusBadge status={task.priority} size="sm" />
                        </div>
                        <h4 className="text-sm font-bold leading-snug text-slate-900">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {task.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs font-medium text-slate-400">
                      Drop items here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
