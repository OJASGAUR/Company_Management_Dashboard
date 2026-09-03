import Link from "next/link"

export function NotificationsNav({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link
      href="/dashboard/notifications"
      className={mobile
        ? "rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        : "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-100"}
      aria-label="Notifications"
    >
      <svg className={mobile ? "h-5 w-5" : "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {!mobile && <span className="truncate">Notifications</span>}
    </Link>
  )
}
