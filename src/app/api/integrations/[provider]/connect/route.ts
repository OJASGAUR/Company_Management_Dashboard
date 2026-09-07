import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { CalendarProvider, connectUrl } from "@/lib/calendar-integrations"

export async function GET(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"))

  const { provider } = await params
  if (provider !== "google" && provider !== "outlook") {
    return NextResponse.json({ success: false, error: "Unsupported integration" }, { status: 400 })
  }

  try {
    return NextResponse.redirect(connectUrl(provider as CalendarProvider, session.user.id))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Integration is not configured"
    const target = new URL("/dashboard/integrations", process.env.NEXTAUTH_URL || "http://localhost:3000")
    target.searchParams.set("error", message)
    return NextResponse.redirect(target)
  }
}
