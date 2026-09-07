"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CalendarEvent } from "@prisma/client"

export default function CalendarClient({ initialEvents, isAdmin }: { initialEvents: CalendarEvent[], isAdmin: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [integrations, setIntegrations] = useState({ google: false, outlook: false })
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/integrations")
      .then(async (response) => {
        if (!response.ok) return
        const payload = await response.json()
        const connected = new Set<string>((payload.data || []).map((item: { provider: string }) => item.provider))
        setIntegrations({ google: connected.has("google"), outlook: connected.has("outlook") })
      })
      .catch(() => undefined)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const body = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime") || formData.get("startTime"),
      allDay: formData.get("allDay") === "on",
    }

    const res = await fetch("/api/calendar", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    if (res.ok) {
      const { data } = await res.json()
      setEvents((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
      )
      setShowForm(false)
      form.reset()
    } else {
      alert("Failed to create event")
    }
  }

  async function handleDelete(eventId: string) {
    if (!isAdmin || deletingId) return

    setDeletingId(eventId)
    const previousEvents = events
    setEvents((prev) => prev.filter((event) => event.id !== eventId))

    try {
      const res = await fetch(`/api/calendar?id=${encodeURIComponent(eventId)}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete event")
    } catch (error) {
      console.error(error)
      setEvents(previousEvents)
      alert("Failed to delete event")
    } finally {
      setDeletingId(null)
    }
  }

  async function syncEvent(eventId: string, provider: "google" | "outlook", createMeet = false) {
    setSyncing(`${eventId}:${provider}:${createMeet ? "meet" : "event"}`)
    setSyncMessage(null)
    try {
      const response = await fetch(`/api/integrations/${provider}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, createMeet }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Unable to sync event")

      if (createMeet && payload.meetUrl) {
        setSyncMessage(`Google Meet created: ${payload.meetUrl}`)
      } else if (payload.eventUrl) {
        setSyncMessage(`Event created successfully: ${payload.eventUrl}`)
      } else {
        setSyncMessage("Event created successfully in the connected calendar.")
      }
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Unable to sync event")
    } finally {
      setSyncing(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Create company events and send them to your connected calendars.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Event"}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">External calendars</p>
            <p className="mt-1 text-sm text-slate-600">Connect services to create calendar events and Google Meet links from this workspace.</p>
          </div>
          <Link href="/dashboard/integrations" className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Manage integrations →
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${integrations.google ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>Google Calendar {integrations.google ? "Connected" : "Not connected"}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${integrations.google ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>Google Meet {integrations.google ? "Available" : "Requires Google Calendar"}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${integrations.outlook ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>Outlook Calendar {integrations.outlook ? "Connected" : "Not connected"}</span>
        </div>
        {syncMessage && <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{syncMessage}</p>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Event Title</label>
            <input name="title" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="team_meeting">Team Meeting</option>
              <option value="client_meeting">Client Meeting</option>
              <option value="project_deadline">Project Deadline</option>
              <option value="company_event">Company Event</option>
              <option value="public_holiday">Public Holiday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">All Day</label>
            <input type="checkbox" name="allDay" className="mt-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input type="datetime-local" name="startTime" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input type="datetime-local" name="endTime" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Save Event</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-200">
          {events.map((event) => {
            const eventDate = new Date(event.startTime)
            const isDeleting = deletingId === event.id
            const googleKey = `${event.id}:google:event`
            const meetKey = `${event.id}:google:meet`
            const outlookKey = `${event.id}:outlook:event`

            return (
              <div key={event.id} className={`group relative p-5 transition-colors hover:bg-gray-50 sm:p-6 ${isDeleting ? "opacity-50" : ""}`}>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    disabled={isDeleting || deletingId !== null}
                    aria-label={`Delete ${event.title}`}
                    title="Delete event"
                    className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 opacity-0 shadow-sm ring-1 ring-slate-200 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    <span aria-hidden="true" className="text-lg leading-none">×</span>
                  </button>
                )}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <span className="text-sm font-semibold uppercase">{eventDate.toLocaleString("default", { month: "short" })}</span>
                    <span className="text-3xl font-bold">{eventDate.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 pr-8">
                      <h3 className="truncate text-lg font-bold text-gray-900">{event.title}</h3>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-800">{event.category.replace(/_/g, " ")}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{event.description || "No description."}</p>
                    <p className="mt-2 text-sm text-gray-500">{event.allDay ? "All day" : eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {integrations.google && (
                        <>
                          <button type="button" onClick={() => syncEvent(event.id, "google")} disabled={syncing !== null} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                            {syncing === googleKey ? "Adding…" : "Add to Google Calendar"}
                          </button>
                          <button type="button" onClick={() => syncEvent(event.id, "google", true)} disabled={syncing !== null} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                            {syncing === meetKey ? "Creating…" : "Create Google Meet"}
                          </button>
                        </>
                      )}
                      {integrations.outlook && (
                        <button type="button" onClick={() => syncEvent(event.id, "outlook")} disabled={syncing !== null} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          {syncing === outlookKey ? "Adding…" : "Add to Outlook"}
                        </button>
                      )}
                      {!integrations.google && !integrations.outlook && (
                        <Link href="/dashboard/integrations" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Connect a calendar to sync this event →</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {events.length === 0 && <div className="p-12 text-center text-gray-500">No upcoming events in the calendar.</div>}
        </div>
      </div>
    </div>
  )
}
