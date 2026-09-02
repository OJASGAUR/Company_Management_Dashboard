import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    where: {
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  })

  const canAddEvent = ["SUPER_ADMIN", "HR", "DIRECTOR"].includes(session.user.role)

  return (
    <div className="mx-auto max-w-4xl space-y-8 font-sans">
      <PageHeader
        category="Schedule"
        title="Company Calendar & Events"
        description="Upcoming company all-hands, public holidays, milestones, and team celebrations."
        actions={
          canAddEvent ? (
            <Button variant="primary" size="md">
              + Add Event
            </Button>
          ) : undefined
        }
      />

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {events.map((event) => {
            const date = new Date(event.date)
            const isHoliday = event.type === "HOLIDAY"
            const isBirthday = event.type === "BIRTHDAY"

            return (
              <div
                key={event.id}
                className="flex items-center gap-5 p-5 sm:p-6 transition-colors hover:bg-slate-50/70"
              >
                {/* Date Block */}
                <div
                  className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border ${
                    isHoliday
                      ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
                      : isBirthday
                      ? "border-purple-200 bg-purple-50/80 text-purple-700"
                      : "border-indigo-200 bg-indigo-50/80 text-indigo-700"
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {date.toLocaleString("default", { month: "short" })}
                  </span>
                  <span className="text-2xl font-black leading-none mt-0.5">
                    {date.getDate()}
                  </span>
                </div>

                {/* Event Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{event.title}</h3>
                    <Badge
                      variant={isHoliday ? "success" : isBirthday ? "primary" : "info"}
                      size="sm"
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {event.description || "Company scheduled event."}
                  </p>
                </div>

                {/* Full Date Subtext */}
                <div className="hidden sm:block text-right text-xs text-slate-400">
                  {date.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
              </div>
            )
          })}

          {events.length === 0 && (
            <EmptyState
              icon="📅"
              title="No Upcoming Events"
              description="There are no scheduled company holidays or all-hands meetings in the immediate calendar."
            />
          )}
        </div>
      </Card>
    </div>
  )
}
