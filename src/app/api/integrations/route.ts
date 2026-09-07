import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  const integrations = await prisma.calendarIntegration.findMany({
    where: { userId: session.user.id },
    select: { provider: true, externalCalendarId: true, connectedAt: true },
  })

  return NextResponse.json({
    success: true,
    data: integrations.map((item) => ({
      provider: item.provider,
      connected: true,
      externalCalendarId: item.externalCalendarId,
      connectedAt: item.connectedAt,
    })),
  })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  const provider = new URL(request.url).searchParams.get("provider")
  if (provider !== "google" && provider !== "outlook") {
    return NextResponse.json({ success: false, error: "Unsupported integration" }, { status: 400 })
  }

  await prisma.calendarIntegration.deleteMany({
    where: { userId: session.user.id, provider },
  })

  return NextResponse.json({ success: true })
}
