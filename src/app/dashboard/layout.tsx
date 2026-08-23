import Link from "next/link"
import { ReactNode } from "react"
import { signOut } from "@/auth"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/require-auth"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth().catch(() => null)
  if (!user) redirect("/")
  const role = user.role
  const isManagement = ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER", "ACCOUNTS"].includes(role)
  const canManageAssets = ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER"].includes(role)
  const canSeeFinance = ["SUPER_ADMIN", "DIRECTOR", "ACCOUNTS"].includes(role)
  const canSeeReports = ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER", "ACCOUNTS"].includes(role)
  const canSeeProjects = ["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER", "TEAM_LEAD", "DEVELOPER", "DESIGNER", "TESTER", "CLIENT"].includes(role)
  const canSeeTasks = role !== "CLIENT"
  const navClass = "block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-72 flex-col bg-slate-950 text-white">
        <div className="border-b border-slate-800 p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Company OS</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Company Portal</h2></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
          <Link href="/dashboard" className={navClass}>Dashboard</Link>
          <Link href="/dashboard/profile" className={navClass}>My Profile</Link>
          <Link href="/dashboard/notifications" className={navClass}>Notifications</Link>
          {canSeeTasks && <Link href="/dashboard/tasks" className={navClass}>Tasks</Link>}
          {canSeeProjects && <Link href="/dashboard/projects" className={navClass}>Projects</Link>}
          <Link href="/dashboard/attendance" className={navClass}>Attendance & Time</Link>
          <Link href="/dashboard/leaves" className={navClass}>Leave Management</Link>
          <Link href="/dashboard/calendar" className={navClass}>Company Calendar</Link>
          <Link href="/dashboard/chat" className={navClass}>Messages</Link>
          {canManageAssets && <><p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resources</p><Link href="/dashboard/assets" className={navClass}>Assets</Link></>}
          {canSeeFinance && <><p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Business</p><Link href="/dashboard/tools" className={navClass}>Finance & CRM</Link></>}
          {isManagement && <><p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Management</p>{["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER"].includes(role) && <Link href="/dashboard/operations" className={navClass}>Operations</Link>}{canSeeReports && <Link href="/dashboard/reports" className={navClass}>Reports & Analytics</Link>}{["SUPER_ADMIN", "DIRECTOR", "HR"].includes(role) && <Link href="/admin" className={navClass}>Admin / HR</Link>}</>}
          {!canSeeTasks && <p className="mt-6 px-4 text-xs text-slate-500">Client access is limited to shared project information.</p>}
        </nav>
        <div className="border-t border-slate-800 p-4"><div className="mb-4 flex items-center gap-3 px-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">{user.email?.charAt(0).toUpperCase() || "U"}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{user.name || "User"}</p><p className="truncate text-xs text-slate-500">{role.replace(/_/g, " ")}</p></div></div><form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }}><button type="submit" className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-slate-800">Sign Out</button></form></div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
