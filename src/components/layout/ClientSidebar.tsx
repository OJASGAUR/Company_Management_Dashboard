"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface ClientSidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
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

function ClientNavItem({ href, label, icon, currentPath, onClick }: NavItemProps) {
  const isActive = href === "/dashboard/client" ? currentPath === "/dashboard/client" : currentPath.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/30"
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

function ClientSidebarContent({
  user,
  currentPath,
  onCloseMobile,
  signOutAction,
}: {
  user: ClientSidebarProps["user"]
  currentPath: string
  onCloseMobile?: () => void
  signOutAction: () => Promise<void>
}) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-900 px-6">
        <Link href="/dashboard/client" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 font-black text-white shadow-md shadow-cyan-500/20">
            C
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-white">Client Portal</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">Company OS</p>
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
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Client Workspace</p>
        <ClientNavItem
          href="/dashboard/client"
          label="Overview"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <ClientNavItem
          href="/dashboard/client/projects"
          label="Projects"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <ClientNavItem
          href="/dashboard/client/tasks"
          label="Project Tasks"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <ClientNavItem
          href="/dashboard/client/invoices"
          label="Invoices & Billing"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />
        <ClientNavItem
          href="/dashboard/client/documents"
          label="Documents"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <ClientNavItem
          href="/dashboard/client/calendar"
          label="Calendar & Milestones"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <ClientNavItem
          href="/dashboard/client/messages"
          label="Messages"
          currentPath={currentPath}
          onClick={onCloseMobile}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      </nav>

      {/* User Section & Sign out */}
      <div className="border-t border-slate-900 p-4">
        <Link
          href="/dashboard/profile"
          onClick={onCloseMobile}
          className="mb-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-900"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 font-bold text-white shadow-sm">
            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name || "Client"}</p>
            <p className="truncate text-xs text-slate-400">Client Portal</p>
          </div>
          <span className="text-slate-500">→</span>
        </Link>
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

export function ClientSidebar({ user, signOutAction }: ClientSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col lg:flex border-r border-slate-900">
        <ClientSidebarContent
          user={user}
          currentPath={pathname}
          signOutAction={signOutAction}
        />
      </aside>

      {/* Mobile Top Header */}
      <div className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/dashboard/client" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 font-bold text-white">
            C
          </div>
          <span className="font-bold text-slate-900">Client Portal</span>
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
            <ClientSidebarContent
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
