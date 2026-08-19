"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { punchIn, punchOut } from "./actions"

export default function DashboardClient({ stats }: { stats: any }) {
  const [isPunching, setIsPunching] = useState(false)

  if (!stats) return <div className="p-8">Loading...</div>

  const { user, isAdmin, todaysAttendance, activeTasks, pendingLeaves, totalEmployees } = stats

  const handlePunch = async (type: 'in' | 'out') => {
    setIsPunching(true)
    try {
      if (type === 'in') await punchIn()
      else await punchOut()
    } catch (error) {
      console.error(error)
      alert("Action failed")
    } finally {
      setIsPunching(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as any }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <motion.div initial="hidden" animate="show" variants={containerVariants}>
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            {isAdmin 
              ? `You are viewing the ${user.role.replace('_', ' ')} Management Dashboard.`
              : `Here's what's happening today in your workspace.`}
          </p>
        </motion.div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Attendance / Total Employees Widget */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10">
              {isAdmin ? (
                <>
                  <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span>👥</span> Workforce
                  </h2>
                  <div className="mb-6">
                    <p className="text-4xl font-extrabold text-slate-900">
                      {totalEmployees}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Total Active Employees</p>
                  </div>
                  <a href="/dashboard/operations" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    Manage Users <span className="ml-1">→</span>
                  </a>
                </>
              ) : (
                <>
                  <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span>⏱️</span> Time Clock
                  </h2>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-slate-900">
                      {todaysAttendance ? (todaysAttendance.checkOut ? 'Finished' : 'Working') : 'Not Started'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Status for today</p>
                  </div>
                  
                  {!todaysAttendance ? (
                    <button 
                      onClick={() => handlePunch('in')} disabled={isPunching}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isPunching ? 'Processing...' : 'Punch In'}
                    </button>
                  ) : !todaysAttendance.checkOut ? (
                    <button 
                      onClick={() => handlePunch('out')} disabled={isPunching}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isPunching ? 'Processing...' : 'Punch Out'}
                    </button>
                  ) : (
                    <div className="w-full bg-green-50 text-green-700 font-bold py-3 px-4 rounded-xl text-center">
                      Shift Completed ✅
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Tasks Widget */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>📝</span> Active Tasks
              </h2>
              <div className="mb-6">
                <p className="text-4xl font-extrabold text-indigo-600">
                  {activeTasks}
                </p>
                <p className="text-sm text-slate-400 mt-1">Tasks requiring your attention</p>
              </div>
              <a href="/dashboard/tasks" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                Go to Kanban Board <span className="ml-1">→</span>
              </a>
            </div>
          </motion.div>

          {/* Quick Links Widget */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            {isAdmin ? (
               <div className="relative z-10">
                 <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span>📥</span> Pending Approvals
                 </h2>
                 <div className="mb-6">
                   <p className="text-4xl font-extrabold text-orange-500">
                     {pendingLeaves}
                   </p>
                   <p className="text-sm text-slate-400 mt-1">Leave requests requiring review</p>
                 </div>
                 <a href="/dashboard/leaves" className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
                   Review Leaves <span className="ml-1">→</span>
                 </a>
               </div>
            ) : (
              <>
                <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>🚀</span> Quick Links
                </h2>
                <div className="flex flex-col gap-3">
                  <a href="/dashboard/leaves" className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between font-medium text-slate-700">
                    Apply for Leave
                    <span className="text-slate-400">›</span>
                  </a>
                  <a href="/dashboard/chat" className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between font-medium text-slate-700">
                    Company Chat
                    <span className="text-slate-400">›</span>
                  </a>
                </div>
              </>
            )}
          </motion.div>

        </div>

      </motion.div>
    </div>
  )
}
