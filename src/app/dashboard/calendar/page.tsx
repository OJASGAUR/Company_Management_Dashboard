import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    where: {
      date: { gte: new Date() } // Only upcoming events
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Company Calendar</h1>
        {["SUPER_ADMIN", "HR"].includes(session.user.role) && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
            + Add Event
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {events.map(event => {
            const date = new Date(event.date)
            return (
              <div key={event.id} className="p-6 flex items-center gap-6 hover:bg-gray-50">
                {/* Date Block */}
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                  <span className="text-sm font-semibold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-bold">{date.getDate()}</span>
                </div>
                
                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      event.type === 'HOLIDAY' ? 'bg-green-100 text-green-800' :
                      event.type === 'BIRTHDAY' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{event.description || "No description."}</p>
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
