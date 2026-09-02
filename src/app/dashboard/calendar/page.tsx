import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CalendarClient from "./CalendarClient"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const events = await prisma.calendarEvent.findMany({
    orderBy: { startTime: 'asc' },
    where: {
      startTime: { gte: new Date() } // Only upcoming events
    }
  })

  const isAdmin = ["SUPER_ADMIN", "HR"].includes(session.user.role)

  return (
    <CalendarClient initialEvents={events} isAdmin={isAdmin} />
  )
}
