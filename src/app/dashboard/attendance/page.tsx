"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getAttendanceHistory } from "../actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { Skeleton } from "@/components/ui/Skeleton"

interface AttendanceRecord {
  id: string
  date: Date | string
  checkIn: Date | string
  checkOut: Date | string | null
  status: string
  user?: { id: string; name: string | null; email: string | null; employeeId: string | null; department: string | null }
}

export default function AttendancePage() {
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isGlobal, setIsGlobal] = useState(false)

  useEffect(() => {
    getAttendanceHistory().then((data) => {
      const typed = data as AttendanceRecord[]
      setHistory(typed)
      setIsGlobal(Boolean(typed[0]?.user))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const presentCount = history.filter((r) => r.status === "PRESENT").length
  const lateCount = history.filter((r) => r.status === "LATE").length

  return <div className="mx-auto max-w-7xl space-y-8 font-sans">
    <PageHeader category="Time & Attendance" title={isGlobal ? "Company Attendance" : "Attendance History"} description={isGlobal ? "Super Admin view of all employee attendance records in one place." : "Review your recent check-in timestamps, working durations, and attendance status."} />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><StatCard title="Total Shifts Logged" value={loading ? "..." : history.length} subtitle={isGlobal ? "Across all employees" : "Recent recorded shifts"} icon="📅" /><StatCard title="On-Time Days" value={loading ? "..." : presentCount} subtitle="Shifts logged before 10:00 AM" icon="✅" /><StatCard title="Late Check-ins" value={loading ? "..." : lateCount} subtitle="Shifts logged after 10:00 AM" icon="⏱️" /></div>

    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm"><Skeleton className="h-6 w-1/4" /><div className="space-y-3 pt-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></div> : history.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6"><EmptyState title="No Attendance Records Found" description="No attendance records are available yet." /></div> :
      <TableContainer><Table><TableHead><tr>{isGlobal && <TableHeaderCell>Employee</TableHeaderCell>}<TableHeaderCell>Date</TableHeaderCell><TableHeaderCell>Check In</TableHeaderCell><TableHeaderCell>Check Out</TableHeaderCell><TableHeaderCell className="text-right">Status</TableHeaderCell></tr></TableHead><TableBody>
        {history.map((record, idx) => <motion.tr key={record.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.01 }} className="transition-colors hover:bg-slate-50/70">
          {isGlobal && <TableCell className="font-semibold text-slate-900"><p>{record.user?.name || "Employee"}</p><p className="text-xs font-normal text-slate-500">{record.user?.employeeId || record.user?.email || "—"}</p></TableCell>}
          <TableCell className="font-semibold text-slate-900">{new Date(record.date).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</TableCell>
          <TableCell className="font-mono text-xs text-slate-600">{new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
          <TableCell className="font-mono text-xs text-slate-600">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : <span className="inline-flex items-center gap-1.5 font-sans font-medium text-amber-600"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />In Progress</span>}</TableCell>
          <TableCell className="text-right"><StatusBadge status={record.status} size="sm" /></TableCell>
        </motion.tr>)}
      </TableBody></Table></TableContainer>}
  </div>
}
