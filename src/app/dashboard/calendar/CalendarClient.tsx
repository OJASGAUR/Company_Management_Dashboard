"use client"

import { useState } from "react"
import { CalendarEvent } from "@prisma/client"

export default function CalendarClient({ initialEvents, isAdmin }: { initialEvents: CalendarEvent[], isAdmin: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

      if (!res.ok) {
        throw new Error("Failed to delete event")
      }
    } catch (error) {
      console.error(error)
      setEvents(previousEvents)
      alert("Failed to delete event")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Company Calendar</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "+ Add Event"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Event Title</label>
            <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
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
            <input type="datetime-local" name="startTime" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time (Optional)</label>
            <input type="datetime-local" name="endTime" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"></textarea>
          </div>
          <div className="col-span-2">
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">Save Event</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {events.map((event) => {
            const eventDate = new Date(event.startTime)
            const isDeleting = deletingId === event.id

            return (
              <div
                key={event.id}
                className={`group relative p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors ${isDeleting ? "opacity-50" : ""}`}
              >
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

                <div className="flex flex-col items-center justify-center w-20 h-20 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                  <span className="text-sm font-semibold uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-bold">{eventDate.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 pr-8">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{event.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-800 shrink-0">
                      {event.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{event.description || "No description."}</p>
                </div>
                <div className="text-right text-sm text-gray-500 shrink-0">
                  {event.allDay ? "All day" : eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
          {events.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No upcoming events in the calendar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
