import Link from "next/link"

export function NotificationsNavItem({
  currentPath,
  onClick,
}: {
  currentPath: string
  onClick?: () => void
}) {
  const isActive = currentPath.startsWith("/dashboard/notifications")

  return (
    <Link
      href="/dashboard/notifications"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30"
          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
      }`}
    >
      <span className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </span>
      <span className="truncate">Notifications</span>
    </Link>
  )
}
