"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, broadcastNotificationToAll } from "../actions"

export type NotificationItem = {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string | Date
}

export default function NotificationsClient({
  initialNotifications,
  userRole = "EMPLOYEE",
  userEmail = ""
}: {
  initialNotifications: NotificationItem[]
  userRole?: string
  userEmail?: string
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "TASK" | "LEAVE" | "ALERT">("ALL")
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState("")

  const canBroadcast = ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER"].includes(userRole)
  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "ALL") return true
    if (activeTab === "UNREAD") return !item.read
    if (activeTab === "TASK") return item.type === "TASK"
    if (activeTab === "LEAVE") return item.type === "LEAVE"
    if (activeTab === "ALERT") return item.type === "ALERT" || item.type === "WARNING" || item.type === "INFO"
    return true
  })

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    try {
      await markNotificationAsRead(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return
    setIsMarkingAll(true)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsAsRead()
    } catch (err) {
      console.error(err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await deleteNotification(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleBroadcastSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsBroadcasting(true)
    setBroadcastSuccessMsg("")

    const formData = new FormData(e.currentTarget)
    try {
      const res = await broadcastNotificationToAll(formData)
      if (res?.success) {
        setBroadcastSuccessMsg(`Announcement and emails successfully sent to all ${res.totalSent} employees!`)
        setTimeout(() => {
          setShowBroadcastModal(false)
          setBroadcastSuccessMsg("")
          window.location.reload()
        }, 1500)
      }
    } catch (err: any) {
      alert(err.message || "Failed to broadcast announcement")
    } finally {
      setIsBroadcasting(false)
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "TASK":
        return {
          icon: "📝",
          bg: "bg-indigo-50",
          border: "border-indigo-100",
          badge: "bg-indigo-100 text-indigo-700",
          label: "Task"
        }
      case "LEAVE":
        return {
          icon: "🏖️",
          bg: "bg-amber-50",
          border: "border-amber-100",
          badge: "bg-amber-100 text-amber-700",
          label: "Leave / HR"
        }
      case "SUCCESS":
        return {
          icon: "✅",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          badge: "bg-emerald-100 text-emerald-700",
          label: "Success"
        }
      case "ALERT":
      case "WARNING":
        return {
          icon: "⚠️",
          bg: "bg-rose-50",
          border: "border-rose-100",
          badge: "bg-rose-100 text-rose-700",
          label: "Alert"
        }
      default:
        return {
          icon: "ℹ️",
          bg: "bg-blue-50",
          border: "border-blue-100",
          badge: "bg-blue-100 text-blue-700",
          label: "Info"
        }
    }
  }

  const formatTimestamp = (dateInput: string | Date) => {
    const d = new Date(dateInput)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span>Notifications connected to:</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
              {userEmail || "your employee email"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {canBroadcast && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <span>📢</span>
              <span>Broadcast Email to All</span>
            </button>
          )}

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <span>✓</span>
              {isMarkingAll ? "Updating..." : "Mark all as read"}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "ALL", label: "All", count: notifications.length },
          { id: "UNREAD", label: "Unread", count: unreadCount },
          { id: "TASK", label: "Tasks", count: notifications.filter((n) => n.type === "TASK").length },
          { id: "LEAVE", label: "Leaves", count: notifications.filter((n) => n.type === "LEAVE").length },
          { id: "ALERT", label: "Alerts & News", count: notifications.filter((n) => ["ALERT", "WARNING", "INFO"].includes(n.type)).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification, idx) => {
            const typeStyle = getTypeStyle(notification.type)
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={`p-5 rounded-2xl border transition-all relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notification.read
                    ? "bg-white border-blue-200/70 shadow-sm ring-1 ring-blue-500/10"
                    : "bg-white/80 border-slate-200/80 hover:bg-white text-slate-600"
                }`}
              >
                {/* Left icon & content */}
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${typeStyle.bg} ${typeStyle.border}`}
                  >
                    {typeStyle.icon}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${typeStyle.badge}`}>
                        {typeStyle.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        <span>📧</span> Sent to email
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      )}
                      <span className="text-xs text-slate-400 font-medium ml-auto sm:ml-0">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>

                    <h3 className={`font-bold ${!notification.read ? "text-slate-900" : "text-slate-700"}`}>
                      {notification.title}
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                      {notification.message}
                    </p>

                    {notification.link && (
                      <div className="pt-2">
                        <Link
                          href={notification.link}
                          onClick={() => {
                            if (!notification.read) handleMarkAsRead(notification.id)
                          }}
                          className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors gap-1"
                        >
                          View Details <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete notification"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🔔
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No notifications here</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {activeTab === "UNREAD"
                ? "You're all caught up! There are no unread notifications."
                : "You don't have any notifications in this category right now."}
            </p>
          </div>
        )}
      </div>

      {/* Broadcast Modal (Admins / HR / Managers) */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                  📢
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Broadcast Email Announcement</h2>
                  <p className="text-xs text-slate-500">Send an in-app alert and email to all company employees.</p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {broadcastSuccessMsg ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-center font-bold text-sm">
                ✅ {broadcastSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Announcement Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Q3 All-Hands Meeting & Roadmap Presentation"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Category Type</label>
                    <select
                      name="type"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="INFO">ℹ️ General Info / Update</option>
                      <option value="ALERT">⚠️ Important Notice / Alert</option>
                      <option value="SUCCESS">✅ Company Achievement</option>
                      <option value="TASK">📝 Work & Project Directive</option>
                      <option value="LEAVE">🏖️ Holiday / Policy Change</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Target Link (Optional)</label>
                    <input
                      name="link"
                      placeholder="/dashboard/calendar"
                      defaultValue="/dashboard"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Detailed Message Body</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Type the message that will appear on employee dashboards and be delivered to their email inboxes..."
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  ></textarea>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-2">
                  <span>✉️</span>
                  <span>This will be delivered to every active employee's registered email address in the system.</span>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isBroadcasting ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        <span>Dispatching Emails...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Send to All Employees</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
