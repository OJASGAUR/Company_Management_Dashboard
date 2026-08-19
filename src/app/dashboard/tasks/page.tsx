"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getTasks, updateTaskStatus, createTask } from "../actions"

type Task = { id: string; title: string; description: string | null; status: string; priority: string }

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)

  useEffect(() => {
    getTasks().then(data => {
      setTasks(data)
      setLoading(false)
    })
  }, [])

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    if (!taskId) return

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    
    try {
      await updateTaskStatus(taskId, status)
    } catch (error) {
      console.error(error)
      // Revert if failed (simplified for now)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col font-sans">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Task Board</h1>
          <p className="text-slate-500">Drag and drop tasks across columns to update their status.</p>
        </div>
        <button 
          onClick={() => setShowNewTask(!showNewTask)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-colors"
        >
          {showNewTask ? "Cancel" : "+ New Task"}
        </button>
      </motion.div>

      {showNewTask && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
          <form action={async (formData) => {
            await createTask(formData)
            setShowNewTask(false)
            // Reload tasks manually since it's a client component
            const newTasks = await getTasks()
            setTasks(newTasks)
          }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Task Title</label>
              <input name="title" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select name="priority" className="w-full rounded-md border border-gray-300 p-2 text-black">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input name="description" className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                Create
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">Loading board...</div>
      ) : (
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div 
              key={col} 
              className="flex-1 min-w-[300px] max-w-[400px] bg-slate-50/50 rounded-3xl p-4 border border-slate-100 flex flex-col"
              onDrop={(e) => handleDrop(e, col)}
              onDragOver={handleDragOver}
            >
              <h3 className="font-bold text-slate-700 mb-4 px-2 flex justify-between items-center">
                {col.replace('_', ' ')}
                <span className="bg-slate-200 text-slate-600 text-xs py-1 px-2 rounded-full">
                  {tasks.filter(t => t.status === col).length}
                </span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <AnimatePresence>
                  {tasks.filter(t => t.status === col).map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      key={task.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, task.id)}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                          task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {task.priority}
                        </span>
                        <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          ⋮
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1 leading-snug">{task.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {tasks.filter(t => t.status === col).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
