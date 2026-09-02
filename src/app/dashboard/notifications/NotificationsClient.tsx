"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, updateNotificationPreferences, broadcastNotificationToAll } from "../actions"

import { RemoveButton } from "@/components/ui/RemoveButton"

export type NotificationItem = {
  id: string
  userId: string
  title: string
  body: string
  type: string
  link: string | null
  readAt: string | Date | null
  createdAt: string | Date
}

export type UserPreferences = {
  emailTasks: boolean
  emailLeaves: boolean
  emailAnnouncements: boolean
}

const tabs = [
  ["ALL", "All"],
  ["UNREAD", "Unread"],
  ["TASK", "Tasks"],
  ["LEAVE", "Leaves"],
  ["ALERT", "Alerts"],
] as const

export default function NotificationsClient({
  initialNotifications,
  userRole,
  userEmail,
  userPreferences,
}: {
  initialNotifications: NotificationItem[]
  userRole: string
  userEmail: string
  userPreferences: UserPreferences
}) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>("ALL")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [broadcasting, setBroadcasting] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 10000)
    return () => window.clearInterval(timer)
  }, [router])

  const unreadCount = notifications.filter((item) => !item.readAt).length
  const canBroadcast = ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER"].includes(userRole)

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "UNREAD": return notifications.filter((item) => !item.readAt)
      case "TASK": return notifications.filter((item) => item.type === "TASK")
      case "LEAVE": return notifications.filter((item) => item.type === "LEAVE")
      case "ALERT": return notifications.filter((item) => ["ALERT", "WARNING", "INFO"].includes(item.type))
      default: return notifications
    }
  }, [activeTab, notifications])

  const typeStyle = (type: string) => {
    switch (type) {
      case "TASK": return { icon: "📝", label: "Task", badge: "bg-indigo-100 text-indigo-700", iconBg: "bg-indigo-50 border-indigo-100" }
      case "LEAVE": return { icon: "🏖️", label: "Leave / HR", badge: "bg-amber-100 text-amber-700", iconBg: "bg-amber-50 border-amber-100" }
      case "SUCCESS": return { icon: "✅", label: "Success", badge: "bg-emerald-100 text-emerald-700", iconBg: "bg-emerald-50 border-emerald-100" }
      case "ALERT":
      case "WARNING": return { icon: "⚠️", label: "Alert", badge: "bg-rose-100 text-rose-700", iconBg: "bg-rose-50 border-rose-100" }
      default: return { icon: "ℹ️", label: "Info", badge: "bg-blue-100 text-blue-700", iconBg: "bg-blue-50 border-blue-100" }
    }
  }

  const formatTimestamp = (value: string | Date) => {
    const date = new Date(value)
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const markRead = async (id: string) => {
    setBusyId(id)
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
    try { await markNotificationAsRead(id) } catch (error) { console.error(error); router.refresh() }
    finally { setBusyId(null) }
  }

  const markAllRead = async () => {
    setNotifications((current) => current.map((item) => item.readAt ? item : { ...item, readAt: new Date().toISOString() }))
    try { await markAllNotificationsAsRead() } catch (error) { console.error(error); router.refresh() }
  }

  const remove = async (id: string) => {
    setBusyId(id)
    setNotifications((current) => current.filter((item) => item.id !== id))
    try { await deleteNotification(id) } catch (error) { console.error(error); router.refresh() }
    finally { setBusyId(null) }
  }

  const submitSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingSettings(true)
    try {
      await updateNotificationPreferences(new FormData(event.currentTarget))
      setShowSettings(false)
      router.refresh()
    } catch (error) { console.error(error); alert("Failed to save notification preferences.") }
    finally { setSavingSettings(false) }
  }

  const submitBroadcast = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBroadcasting(true)
    try {
      const result = await broadcastNotificationToAll(new FormData(event.currentTarget))
      alert(`Notification created for ${result.totalSent} active users.`)
      setShowBroadcast(false)
      router.refresh()
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : "Failed to broadcast notification.") }
    finally { setBroadcasting(false) }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
            {unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">{unreadCount} new</span>}
          </div>
          <p className="mt-1 text-sm text-slate-500">Updates for <span className="font-semibold text-slate-700">{userEmail || "your account"}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowSettings(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">⚙️ Settings</button>
          {canBroadcast && <button onClick={() => setShowBroadcast(true)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">📢 Broadcast</button>}
          {unreadCount > 0 && <button onClick={markAllRead} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">✓ Mark all read</button>}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map(([id, label]) => {
          const count = id === "ALL" ? notifications.length : id === "UNREAD" ? unreadCount : notifications.filter((item) => id === "ALERT" ? ["ALERT", "WARNING", "INFO"].includes(item.type) : item.type === id).length
          return <button key={id} onClick={() => setActiveTab(id)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label} <span className="ml-1 rounded-full bg-black/10 px-2 py-0.5 text-xs">{count}</span></button>
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((notification) => {
          const style = typeStyle(notification.type)
          const unread = !notification.readAt
          return <div key={notification.id} className={`group relative rounded-2xl border p-5 transition ${unread ? "border-blue-200 bg-white shadow-sm" : "border-slate-200 bg-white/80"}`}>
            <RemoveButton onRemove={() => remove(notification.id)} title="Remove notification" />
            <div className="flex gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl ${style.iconBg}`}>{style.icon}</div>
              <div className="min-w-0 flex-1 pr-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${style.badge}`}>{style.label}</span>
                  <span className="text-xs text-slate-400">{formatTimestamp(notification.createdAt)}</span>
                  {unread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <h2 className={`mt-2 font-bold ${unread ? "text-slate-900" : "text-slate-700"}`}>{notification.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{notification.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {notification.link && <a href={notification.link} onClick={() => unread && void markRead(notification.id)} className="text-xs font-bold text-blue-600 hover:text-blue-800">View details →</a>}
                  {unread && <button disabled={busyId === notification.id} onClick={() => void markRead(notification.id)} className="text-xs font-semibold text-slate-600 hover:text-slate-900">Mark read</button>}
                </div>
              </div>
            </div>
          </div>
        })}
        {filtered.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center"><div className="text-4xl">🔔</div><h2 className="mt-3 font-bold text-slate-900">You're all caught up</h2><p className="mt-1 text-sm text-slate-500">No notifications match this filter.</p></div>}
      </div>

      {showSettings && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <form onSubmit={submitSettings} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-7 shadow-2xl">
          <div><h2 className="text-xl font-extrabold text-slate-900">Notification Settings</h2><p className="mt-1 text-sm text-slate-500">Choose which emails you receive.</p></div>
          {[["emailTasks", "Tasks & Projects", userPreferences.emailTasks], ["emailLeaves", "Leaves & HR", userPreferences.emailLeaves], ["emailAnnouncements", "Company Announcements", userPreferences.emailAnnouncements]].map(([name, label, checked]) => <label key={name as string} className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span className="text-sm font-semibold text-slate-800">{label as string}</span><input type="checkbox" name={name as string} defaultChecked={checked as boolean} className="h-5 w-5" /></label>)}
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowSettings(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button disabled={savingSettings} type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingSettings ? "Saving..." : "Save preferences"}</button></div>
        </form>
      </div>}

      {showBroadcast && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <form onSubmit={submitBroadcast} className="w-full max-w-lg space-y-5 rounded-3xl bg-white p-7 shadow-2xl">
          <div><h2 className="text-xl font-extrabold text-slate-900">Broadcast Notification</h2><p className="mt-1 text-sm text-slate-500">Create an in-app notification and email active users who have enabled announcements.</p></div>
          <input name="title" required maxLength={200} placeholder="Title" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
          <select name="type" defaultValue="INFO" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="INFO">Information</option><option value="SUCCESS">Success</option><option value="ALERT">Alert</option><option value="WARNING">Warning</option><option value="TASK">Task</option><option value="LEAVE">Leave / HR</option></select>
          <input name="link" placeholder="Optional portal link" maxLength={500} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
          <textarea name="message" required maxLength={4000} rows={6} placeholder="Message" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowBroadcast(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button disabled={broadcasting} type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{broadcasting ? "Sending..." : "Send broadcast"}</button></div>
        </form>
      </div>}
    </div>
  )
}
