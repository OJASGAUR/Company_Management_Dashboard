"use client"

import { useEffect, useState } from "react"

type CalendarEvent = {
  id: string
  title: string
  category: string
  startTime: string | Date
  allDay: boolean
}

export default function CalendarBar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      try {
        const response = await fetch("/api/calendar", { cache: "no-store" })
        if (!response.ok) throw new Error("Failed to load calendar")
        const result = await response.json()
        if (!cancelled) setEvents(Array.isArray(result.data) ? result.data.slice(0, 10) : [])
      } catch (error) {
        console.error(error)
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadEvents()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || events.length === 0) return null

  return (
    <div className="shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
      <div className="flex items-center gap-4 overflow-x-auto">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex gap-4">
          {events.map((event) => {
            const date = new Date(event.startTime)
            return (
              <div key={event.id} className="min-w-[210px] shrink-0 rounded-xl border border-indigo-50 bg-white px-4 py-3 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  {event.category.replace(/_/g, " ")}
                </p>
                <h4 className="truncate text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="mt-1 text-xs text-slate-500">
                  {date.toLocaleDateString()} {event.allDay ? "(All Day)" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
