"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { punchIn, punchOut } from "./actions"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StatusBadge } from "@/components/ui/StatusBadge"

interface DashboardStats {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
    employeeId?: string | null
    department?: string | null
  }
  isAdmin: boolean
  isManager: boolean
  todaysAttendance: {
    id: string
    date: Date
    checkIn: Date
    checkOut: Date | null
    status: string
  } | null
  activeTasks: number
  pendingLeaves: number
  totalEmployees: number
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const [isPunching, setIsPunching] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-semibold text-sm">Loading workspace data...</span>
        </div>
      </div>
    )
  }

  const { user, isAdmin, todaysAttendance, activeTasks, pendingLeaves, totalEmployees } = stats

  const handlePunch = async (type: "in" | "out") => {
    setIsPunching(true)
    try {
      if (type === "in") await punchIn()
      else await punchOut()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Attendance action failed")
    } finally {
      setIsPunching(false)
    }
  }

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl"
      >
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="primary" size="sm">
                {user.role.replace(/_/g, " ")}
              </Badge>
              {user.department && (
                <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300">
                  {user.department}
                </span>
              )}
              <span className="text-xs text-slate-400">· {todayFormatted}</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, {user.name?.split(" ")[0] || "Team Member"}! 👋
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isAdmin
                ? "Here is the operational overview of people, active deliverables, and pending approvals."
                : "Here is your personal workstation for attendance, active tasks, and team updates."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">System Time</p>
              <p className="font-mono text-xl font-bold text-white tracking-wider">
                {currentTime || "--:--:--"}
              </p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 text-lg">
              ⏱️
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Card / Workforce Card */}
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isAdmin ? "Workforce Strength" : "Shift Clock"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg">
                {isAdmin ? "👥" : "⏱️"}
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-900 mt-2">
              {isAdmin ? (
                totalEmployees
              ) : todaysAttendance ? (
                todaysAttendance.checkOut ? (
                  "Completed"
                ) : (
                  "Active Shift"
                )
              ) : (
                "Not Punched In"
              )}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Active personnel across all departments"
                : todaysAttendance
                ? `Punched in at ${new Date(todaysAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : "No punch recorded for today"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isAdmin ? (
              <Link href="/dashboard/operations">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>Manage Workforce</span>
                  <span>→</span>
                </Button>
              </Link>
            ) : (
              <div>
                {!todaysAttendance ? (
                  <Button
                    onClick={() => handlePunch("in")}
                    isLoading={isPunching}
                    variant="primary"
                    size="md"
                    className="w-full shadow-md"
                  >
                    Punch In for Today
                  </Button>
                ) : !todaysAttendance.checkOut ? (
                  <Button
                    onClick={() => handlePunch("out")}
                    isLoading={isPunching}
                    variant="dark"
                    size="md"
                    className="w-full shadow-md"
                  >
                    Punch Out
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <span>✓</span> Shift Completed ({todaysAttendance.status})
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Tasks Card */}
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isAdmin ? "Company Tasks" : "My Active Tasks"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg">
                📝
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-indigo-600 mt-2">
              {activeTasks}
            </CardTitle>
            <CardDescription>
              {isAdmin ? "Active items in Todo or In Progress" : "Tasks currently assigned to you"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/dashboard/tasks">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>View Kanban Board</span>
                <span>→</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Approvals / Quick Actions Card */}
        <Card hoverEffect className="flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isAdmin ? "Action Required" : "Quick Operations"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg">
                {isAdmin ? "📥" : "⚡"}
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-900 mt-2">
              {isAdmin ? pendingLeaves : "Shortcuts"}
            </CardTitle>
            <CardDescription>
              {isAdmin ? "Pending leave requests awaiting decision" : "Fast actions to get work done"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isAdmin ? (
              <Link href="/dashboard/leaves">
                <Button variant="primary" size="sm" className="w-full justify-between bg-amber-600 hover:bg-amber-700">
                  <span>Review Pending Leaves</span>
                  <span>→</span>
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/leaves">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Apply Leave
                  </Button>
                </Link>
                <Link href="/dashboard/chat">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Open Chat
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Dashboard Modules Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workspace Hub Links */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Workspace Navigation</h2>
              <p className="text-xs text-slate-500">Direct shortcuts to operational systems</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/attendance"
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                  ⏱️
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Attendance History
                  </p>
                  <p className="text-xs text-slate-500">View check-in logs & trends</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">→</span>
            </Link>

            <Link
              href="/dashboard/leaves"
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-700">
                  🌴
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Leave Management
                  </p>
                  <p className="text-xs text-slate-500">Apply & monitor leave balance</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-amber-600 transition-colors">→</span>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                  📅
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Company Calendar
                  </p>
                  <p className="text-xs text-slate-500">Upcoming events & holidays</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-emerald-600 transition-colors">→</span>
            </Link>

            <Link
              href="/dashboard/chat"
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 font-bold text-cyan-700">
                  💬
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    Direct Messenger
                  </p>
                  <p className="text-xs text-slate-500">Internal colleague communication</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-cyan-600 transition-colors">→</span>
            </Link>
          </div>
        </Card>

        {/* User Identity Snapshot Card */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900">My Identity</h2>
            <StatusBadge status="ACTIVE" size="sm" />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-md shadow-indigo-200">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-bold text-slate-900">{user.name || "Employee"}</p>
              <p className="text-xs text-slate-500">{user.email || "No email on record"}</p>
            </div>
          </div>
          <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Employee ID</span>
              <span className="font-mono font-bold text-slate-700">{user.employeeId || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role</span>
              <span className="font-semibold text-slate-800">{user.role.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-slate-800">{user.department || "General"}</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100">
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm" className="w-full text-indigo-600 justify-center">
                View Full Profile →
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
