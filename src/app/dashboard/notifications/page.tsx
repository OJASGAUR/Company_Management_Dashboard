import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { markNotificationRead } from "./actions"

export default async function NotificationsPage() {
  const user = await requireAuth()
  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Updates</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Notifications</h1><p className="mt-2 text-sm text-slate-500">Approvals, onboarding updates and other company activity.</p></div>
      <div className="space-y-3">
        {notifications.map(notification => <article key={notification.id} className={`rounded-2xl border p-5 shadow-sm ${notification.readAt ? "border-slate-200 bg-white" : "border-indigo-200 bg-indigo-50/40"}`}><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-900">{notification.title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p></div><div className="shrink-0 text-right"><time className="block text-xs text-slate-400">{notification.createdAt.toLocaleString()}</time>{!notification.readAt && <form action={markNotificationRead} className="mt-2"><input type="hidden" name="notificationId" value={notification.id} /><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Mark read</button></form>}</div></div></article>)}
        {notifications.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">You're all caught up.</div>}
      </div>
    </div>
  )
}
