import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const EVENT_ROLES = ["SUPER_ADMIN", "HR", "DIRECTOR"]
const EVENT_CATEGORIES = [
  "team_meeting",
  "client_meeting",
  "project_deadline",
  "company_event",
  "public_holiday",
]

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    const events = await prisma.calendarEvent.findMany({
      where: {
        ...(start ? { startTime: { gte: new Date(start) } } : {}),
        ...(end ? { startTime: { lte: new Date(end) } } : {}),
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error("GET /api/calendar failed", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch calendar events" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!EVENT_ROLES.includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const description = typeof body.description === "string" ? body.description.trim() : null
    const category = typeof body.category === "string" ? body.category : "team_meeting"
    const startTime = typeof body.startTime === "string" ? new Date(body.startTime) : null
    const endTime = typeof body.endTime === "string" && body.endTime ? new Date(body.endTime) : null
    const allDay = Boolean(body.allDay)

    if (!title || title.length > 200) {
      return NextResponse.json({ success: false, error: "A valid event title is required" }, { status: 400 })
    }
    if (!EVENT_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, error: "Invalid event category" }, { status: 400 })
    }
    if (!startTime || Number.isNaN(startTime.getTime())) {
      return NextResponse.json({ success: false, error: "A valid start time is required" }, { status: 400 })
    }
    if (endTime && Number.isNaN(endTime.getTime())) {
      return NextResponse.json({ success: false, error: "A valid end time is required" }, { status: 400 })
    }
    if (endTime && endTime < startTime) {
      return NextResponse.json({ success: false, error: "End time cannot be before start time" }, { status: 400 })
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        category,
        startTime,
        endTime: endTime || startTime,
        allDay,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 })
  } catch (error) {
    console.error("POST /api/calendar failed", error)
    return NextResponse.json(
      { success: false, error: "Failed to create calendar event" },
      { status: 400 },
    )
  }
}
