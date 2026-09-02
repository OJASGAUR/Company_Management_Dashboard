"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Role } from "@prisma/client"
import { useState } from "react"

interface AdminSidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: Role
  }
  signOutAction: () => Promise<void>
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ReactNode
  currentPath: string
  onClick?: () => void
}

function AdminNavItem({ href, label, icon, currentPath, onClick }: NavItemProps) {
  const isActive = currentPath === href || currentPath.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30"
          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
      }`}
    >
      <span className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

function AdminSidebarContent({
  user,
  currentPath,
  onCloseMobile,
  signOutAction,
}: {
  user: AdminSidebarProps["user"]
  currentPath: string
  onCloseMobile?: () => void
  signOutAction: () => Promise<void>
}) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-900 px-6">
        <Link href="/admin/users" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 font-black text-white shadow-md shadow-indigo-500/20">
            A
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-white">Admin Panel</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">Management</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <div>
          <Link
            href="/dashboard"
            className="mb-4 flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">People & Access</p>
          <div className="space-y-1">
            <AdminNavItem
              href="/admin/users"
              label="User Management"
              currentPath={currentPath}
              onClick={onCloseMobile}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {user.role === Role.SUPER_ADMIN && (
          <div>
            <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Security & Logs</p>
            <div className="space-y-1">
              <AdminNavItem
                href="/admin/audit"
                label="Audit Log"
                currentPath={currentPath}
                onClick={onCloseMobile}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
            </div>
          </div>
        )}
      </nav>

      {/* User Section & Sign out */}
      <div className="border-t border-slate-900 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-sm font-bold text-white shadow-sm">
            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name || "Administrator"}</p>
            <p className="truncate text-xs text-slate-400">{user.role.replace(/_/g, " ")}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-900/30 bg-rose-950/20 px-4 py-2.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-900/40 hover:text-rose-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}

export function AdminSidebar({ user, signOutAction }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col lg:flex border-r border-slate-900">
        <AdminSidebarContent
          user={user}
          currentPath={pathname}
          signOutAction={signOutAction}
        />
      </aside>

      {/* Mobile Top Header */}
      <div className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/admin/users" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            A
          </div>
          <span className="font-bold text-slate-900">Admin Panel</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Open Navigation Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col shadow-2xl">
            <AdminSidebarContent
              user={user}
              currentPath={pathname}
              onCloseMobile={() => setMobileOpen(false)}
              signOutAction={signOutAction}
            />
          </div>
        </div>
      )}
    </>
  )
}
