import { NextResponse } from "next/server"
import { exchangeCode, fetchGooglePrimaryCalendar, fetchOutlookPrimaryCalendar, saveProviderConnection, verifyOAuthState, CalendarProvider } from "@/lib/calendar-integrations"

function dashboardUrl(path = "/dashboard/integrations") {
  return new URL(path, process.env.NEXTAUTH_URL || "http://localhost:3000")
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerParam } = await params
  if (providerParam !== "google" && providerParam !== "outlook") {
    return NextResponse.redirect(dashboardUrl("/dashboard/integrations?error=Unsupported%20integration"))
  }
  const provider = providerParam as CalendarProvider
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const oauthError = url.searchParams.get("error")

  if (oauthError || !code || !state) {
    const target = dashboardUrl()
    target.searchParams.set("error", oauthError || "OAuth callback was incomplete")
    return NextResponse.redirect(target)
  }

  const userId = verifyOAuthState(state, provider)
  if (!userId) return NextResponse.redirect(dashboardUrl("/dashboard/integrations?error=Invalid%20or%20expired%20OAuth%20state"))

  try {
    const tokens = await exchangeCode(provider, code)
    if (!tokens.access_token) throw new Error("OAuth provider did not return an access token")

    let externalCalendarId: string | null = null
    if (provider === "google") {
      const calendar = await fetchGooglePrimaryCalendar(tokens.access_token)
      externalCalendarId = calendar.id
    } else {
      const calendar = await fetchOutlookPrimaryCalendar(tokens.access_token)
      externalCalendarId = calendar.id
    }

    await saveProviderConnection(userId, provider, tokens, externalCalendarId)
    const target = dashboardUrl()
    target.searchParams.set("connected", provider)
    return NextResponse.redirect(target)
  } catch (error) {
    console.error(`OAuth callback failed for ${provider}`, error)
    const target = dashboardUrl()
    target.searchParams.set("error", error instanceof Error ? error.message : "Unable to connect the calendar")
    return NextResponse.redirect(target)
  }
}
