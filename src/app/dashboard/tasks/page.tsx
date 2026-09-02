"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getTasks, updateTaskStatus, createTask, getUpcomingCalendarEvents } from "../actions"
import { CalendarEvent } from "@prisma/client"

type Task = { id: string; title: string; description: string | null; status: string; priority: string }

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)

  useEffect(() => {
    Promise.all([getTasks(), getUpcomingCalendarEvents()]).then(([taskData, eventData]) => {
      setTasks(taskData)
      setEvents(eventData)
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

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    
    try {
      await updateTaskStatus(taskId, status)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col font-sans space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Task Board</h1>
          <p className="text-slate-500">Manage your tasks and upcoming delivery deadlines.</p>
        </div>
        <button 
          onClick={() => setShowNewTask(!showNewTask)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-colors"
        >
          {showNewTask ? "Cancel" : "+ New Task"}
        </button>
      </motion.div>

      {/* Calendar Bar */}
      {!loading && events.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 overflow-x-auto shrink-0 shadow-sm items-center"
        >
          <div className="shrink-0 flex items-center justify-center bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white px-4 py-3 rounded-xl border border-indigo-50 shadow-sm shrink-0 min-w-[200px]">
                <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider mb-1">{event.category.replace(/_/g, ' ')}</p>
                <h4 className="font-bold text-slate-800 text-sm truncate">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{new Date(event.startTime).toLocaleDateString()} {event.allDay ? "(All Day)" : new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showNewTask && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="shrink-0">
          <form action={async (formData) => {
            await createTask(formData)
            setShowNewTask(false)
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
                          ?
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
