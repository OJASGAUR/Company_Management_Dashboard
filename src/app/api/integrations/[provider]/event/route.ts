import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createGoogleCalendarEvent, createOutlookCalendarEvent } from "@/lib/calendar-integrations"

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  const { provider } = await params
  if (provider !== "google" && provider !== "outlook") {
    return NextResponse.json({ success: false, error: "Unsupported integration" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const eventId = typeof body.eventId === "string" ? body.eventId : ""
    const createMeet = Boolean(body.createMeet)
    if (!eventId) return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 })

    const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!event) return NextResponse.json({ success: false, error: "Company calendar event not found" }, { status: 404 })

    const startTime = new Date(event.startTime)
    const endTime = event.endTime ? new Date(event.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000)

    if (provider === "google") {
      const created = await createGoogleCalendarEvent(session.user.id, {
        title: event.title,
        description: event.description,
        startTime,
        endTime,
        createMeet,
      })

      const meetLink = created.hangoutLink || created.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri || null
      await prisma.calendarEvent.update({
        where: { id: event.id },
        data: {
          externalProvider: "google",
          externalEventId: created.id,
          metadata: JSON.stringify({ googleEventId: created.id, googleEventUrl: created.htmlLink || null, googleMeetUrl: meetLink }),
        },
      })

      return NextResponse.json({ success: true, eventId: created.id, eventUrl: created.htmlLink || null, meetUrl: meetLink })
    }

    const created = await createOutlookCalendarEvent(session.user.id, {
      title: event.title,
      description: event.description,
      startTime,
      endTime,
    })

    await prisma.calendarEvent.update({
      where: { id: event.id },
      data: {
        externalProvider: "outlook",
        externalEventId: created.id,
        metadata: JSON.stringify({ outlookEventId: created.id, outlookEventUrl: created.webLink || null }),
      },
    })

    return NextResponse.json({ success: true, eventId: created.id, eventUrl: created.webLink || null })
  } catch (error) {
    console.error(`POST /api/integrations/${provider}/event failed`, error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to create external calendar event" },
      { status: 400 },
    )
  }
}
