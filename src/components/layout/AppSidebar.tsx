"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Role } from "@prisma/client"
import { useState } from "react"

const MANAGEMENT_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS]
const ASSET_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER]
const FINANCE_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.ACCOUNTS]
const REPORT_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS]
const PROJECT_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.TEAM_LEAD, Role.DEVELOPER, Role.DESIGNER, Role.TESTER]
const OPERATIONS_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER]
const ADMIN_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR]

interface AppSidebarProps {
  user: { id: string; name?: string | null; email?: string | null; role: Role }
  signOutAction: () => Promise<void>
}

interface NavItemProps { href: string; label: string; icon: React.ReactNode; currentPath: string; onClick?: () => void }

function SidebarNavItem({ href, label, icon, currentPath, onClick }: NavItemProps) {
  const isActive = href === "/dashboard" ? currentPath === "/dashboard" : currentPath.startsWith(href)
  return (
    <Link href={href} onClick={onClick} className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}>
      <span className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

function SidebarContent({ user, currentPath, onCloseMobile, signOutAction }: { user: AppSidebarProps["user"]; currentPath: string; onCloseMobile?: () => void; signOutAction: () => Promise<void> }) {
  const role = user.role
  const isManagement = MANAGEMENT_ROLES.includes(role)
  const canManageAssets = ASSET_ROLES.includes(role)
  const canSeeFinance = FINANCE_ROLES.includes(role)
  const canSeeReports = REPORT_ROLES.includes(role)
  const canSeeProjects = PROJECT_ROLES.includes(role)
  const canManageOperations = OPERATIONS_ROLES.includes(role)
  const canSeeAdmin = ADMIN_ROLES.includes(role)

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="flex h-20 items-center justify-between border-b border-slate-900 px-6">
        <Link href="/dashboard" className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 font-black text-white shadow-md shadow-indigo-500/20">C</div><div><p className="text-sm font-extrabold tracking-tight text-white">Company OS</p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">Workspace</p></div></Link>
        {onCloseMobile && <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <div>
          <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Core</p>
          <div className="space-y-1">
            <SidebarNavItem href="/dashboard" label="Dashboard" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
            <SidebarNavItem href="/dashboard/tasks" label="Tasks" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
            {canSeeProjects && <SidebarNavItem href="/dashboard/projects" label="Projects" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>} />}
            <SidebarNavItem href="/dashboard/attendance" label="Attendance & Time" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <SidebarNavItem href="/dashboard/leaves" label="Leave Requests" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <SidebarNavItem href="/dashboard/calendar" label="Company Calendar" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <SidebarNavItem href="/dashboard/chat" label="Messages" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
            <SidebarNavItem href="/dashboard/notifications" label="Notifications" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
          </div>
        </div>

        {canManageAssets && <div><p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Resources</p><div className="space-y-1"><SidebarNavItem href="/dashboard/assets" label="Assets & Hardware" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} /></div></div>}
        {canSeeFinance && <div><p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Business</p><div className="space-y-1"><SidebarNavItem href="/dashboard/tools" label="Finance & CRM" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} /></div></div>}
        {isManagement && <div><p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Management</p><div className="space-y-1">
          {canManageOperations && <SidebarNavItem href="/dashboard/operations" label="Operations Hub" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />}
          {canSeeReports && <SidebarNavItem href="/dashboard/reports" label="Reports & Analytics" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>} />}
          {canSeeAdmin && <SidebarNavItem href="/admin/users" label="Admin / HR Panel" currentPath={currentPath} onClick={onCloseMobile} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />}
        </div></div>}
      </nav>

      <div className="border-t border-slate-900 p-4">
        <Link href="/dashboard/profile" onClick={onCloseMobile} className="mb-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-900"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-sm font-bold text-white shadow-sm">{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{user.name || "User Profile"}</p><p className="truncate text-xs text-slate-400">{role.replace(/_/g, " ")}</p></div><span className="text-slate-500">→</span></Link>
        <form action={signOutAction}><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-900/30 bg-rose-950/20 px-4 py-2.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-900/40 hover:text-rose-300"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l-4-4m0 0l-4 4m4-4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Sign Out</button></form>
      </div>
    </div>
  )
}

export function AppSidebar({ user, signOutAction }: AppSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col lg:flex border-r border-slate-900 bg-slate-950"><SidebarContent user={user} currentPath={pathname} signOutAction={signOutAction} /></aside>
      <div className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden"><Link href="/dashboard" className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">C</div><span className="font-bold text-slate-900">Company OS</span></Link><div className="flex items-center gap-2"><Link href="/dashboard/notifications" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></Link><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Open Navigation Menu"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button></div></div>
      {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><div className="relative flex w-4/5 max-w-xs flex-1 flex-col shadow-2xl"><SidebarContent user={user} currentPath={pathname} onCloseMobile={() => setMobileOpen(false)} signOutAction={signOutAction} /></div></div>}
    </>
  )
}
