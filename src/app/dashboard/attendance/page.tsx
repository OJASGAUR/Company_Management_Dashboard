"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getAttendanceHistory } from "../actions"

export default function AttendancePage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttendanceHistory().then(data => {
      setHistory(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Attendance History</h1>
        <p className="text-slate-500 mb-8">View your recent check-ins and check-outs.</p>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading records...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No attendance records found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 font-semibold text-slate-600 text-sm">Date</th>
                  <th className="p-5 font-semibold text-slate-600 text-sm">Check In</th>
                  <th className="p-5 font-semibold text-slate-600 text-sm">Check Out</th>
                  <th className="p-5 font-semibold text-slate-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    key={record.id} 
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-5 font-medium text-slate-800">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-5 text-slate-600">
                      {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-5 text-slate-600">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-slate-300 italic">Active</span>}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        record.status === 'LATE' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
