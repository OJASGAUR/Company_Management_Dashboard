import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { decryptSecret, encryptSecret } from "@/lib/crypto"

export type CalendarProvider = "google" | "outlook"

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar",
].join(" ")

const OUTLOOK_SCOPES = ["openid", "email", "profile", "offline_access", "Calendars.ReadWrite", "User.Read"].join(" ")

function appUrl() {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function signState(payload: string) {
  return createHmac("sha256", requireEnv("AUTH_SECRET")).update(payload).digest("base64url")
}

export function createOAuthState(userId: string, provider: CalendarProvider) {
  const payload = `${userId}.${provider}.${Date.now()}.${randomUUID()}`
  return `${Buffer.from(payload).toString("base64url")}.${signState(payload)}`
}

export function verifyOAuthState(state: string, provider: CalendarProvider) {
  const [encoded, signature] = state.split(".")
  if (!encoded || !signature) return null

  const payload = Buffer.from(encoded, "base64url").toString("utf8")
  const expected = signState(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const [userId, stateProvider, issuedAt] = payload.split(".")
  const age = Date.now() - Number(issuedAt)
  if (!userId || stateProvider !== provider || !Number.isFinite(age) || age < 0 || age > 10 * 60 * 1000) return null
  return userId
}

export function callbackUrl(provider: CalendarProvider) {
  return `${appUrl()}/api/integrations/${provider}/callback`
}

export function connectUrl(provider: CalendarProvider, userId: string) {
  const state = createOAuthState(userId, provider)
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      redirect_uri: callbackUrl("google"),
      response_type: "code",
      scope: GOOGLE_SCOPES,
      access_type: "offline",
      prompt: "consent",
      state,
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const params = new URLSearchParams({
    client_id: requireEnv("OUTLOOK_CLIENT_ID"),
    redirect_uri: callbackUrl("outlook"),
    response_type: "code",
    response_mode: "query",
    scope: OUTLOOK_SCOPES,
    state,
  })
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
}

export async function exchangeCode(provider: CalendarProvider, code: string) {
  const body = new URLSearchParams({
    client_id: requireEnv(provider === "google" ? "GOOGLE_CLIENT_ID" : "OUTLOOK_CLIENT_ID"),
    client_secret: requireEnv(provider === "google" ? "GOOGLE_CLIENT_SECRET" : "OUTLOOK_CLIENT_SECRET"),
    code,
    redirect_uri: callbackUrl(provider),
    grant_type: "authorization_code",
  })

  const response = await fetch(
    provider === "google" ? "https://oauth2.googleapis.com/token" : "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
  )
  if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status})`)
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in?: number; scope?: string }>
}

async function refreshGoogle(integration: { id: string; refreshToken: string | null }) {
  if (!integration.refreshToken) throw new Error("Google refresh token is unavailable; reconnect Google Calendar")
  const body = new URLSearchParams({
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
    refresh_token: decryptSecret(integration.refreshToken),
    grant_type: "refresh_token",
  })
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!response.ok) throw new Error("Google access token refresh failed")
  const data = (await response.json()) as { access_token: string; expires_in?: number }
  const tokenExpiresAt = new Date(Date.now() + Math.max(60, data.expires_in || 3600) * 1000)
  await prisma.calendarIntegration.update({
    where: { id: integration.id },
    data: { accessToken: encryptSecret(data.access_token), tokenExpiresAt },
  })
  return data.access_token
}

async function refreshOutlook(integration: { id: string; refreshToken: string | null }) {
  if (!integration.refreshToken) throw new Error("Outlook refresh token is unavailable; reconnect Outlook Calendar")
  const body = new URLSearchParams({
    client_id: requireEnv("OUTLOOK_CLIENT_ID"),
    client_secret: requireEnv("OUTLOOK_CLIENT_SECRET"),
    refresh_token: decryptSecret(integration.refreshToken),
    grant_type: "refresh_token",
    scope: OUTLOOK_SCOPES,
  })
  const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!response.ok) throw new Error("Outlook access token refresh failed")
  const data = (await response.json()) as { access_token: string; refresh_token?: string; expires_in?: number }
  const tokenExpiresAt = new Date(Date.now() + Math.max(60, data.expires_in || 3600) * 1000)
  await prisma.calendarIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: encryptSecret(data.access_token),
      refreshToken: data.refresh_token ? encryptSecret(data.refresh_token) : integration.refreshToken,
      tokenExpiresAt,
    },
  })
  return data.access_token
}

export async function getProviderAccessToken(userId: string, provider: CalendarProvider) {
  const integration = await prisma.calendarIntegration.findFirst({ where: { userId, provider } })
  if (!integration) throw new Error(`${provider === "google" ? "Google Calendar" : "Outlook Calendar"} is not connected`)

  if (!integration.tokenExpiresAt || integration.tokenExpiresAt.getTime() > Date.now() + 60_000) {
    return decryptSecret(integration.accessToken)
  }

  return provider === "google" ? refreshGoogle(integration) : refreshOutlook(integration)
}

export async function saveProviderConnection(
  userId: string,
  provider: CalendarProvider,
  tokenData: { access_token: string; refresh_token?: string; expires_in?: number },
  externalCalendarId: string | null,
) {
  const existing = await prisma.calendarIntegration.findFirst({ where: { userId, provider } })
  const data = {
    accessToken: encryptSecret(tokenData.access_token),
    refreshToken: tokenData.refresh_token ? encryptSecret(tokenData.refresh_token) : existing?.refreshToken || null,
    tokenExpiresAt: new Date(Date.now() + Math.max(60, tokenData.expires_in || 3600) * 1000),
    externalCalendarId,
    connectedAt: new Date(),
  }

  if (existing) {
    return prisma.calendarIntegration.update({ where: { id: existing.id }, data })
  }

  return prisma.calendarIntegration.create({ data: { userId, provider, ...data } })
}

export async function fetchGooglePrimaryCalendar(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList/primary", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error("Unable to read the Google primary calendar")
  return response.json() as Promise<{ id: string; summary?: string; timeZone?: string }>
}

export async function fetchOutlookPrimaryCalendar(accessToken: string) {
  const response = await fetch("https://graph.microsoft.com/v1.0/me/calendar?$select=id,name", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error("Unable to read the Outlook calendar")
  const data = (await response.json()) as { value?: Array<{ id: string; name?: string }> }
  const first = data.value?.[0]
  if (!first) throw new Error("No Outlook calendar was returned")
  return first
}

export async function createGoogleCalendarEvent(userId: string, event: { title: string; description?: string | null; startTime: Date; endTime: Date; createMeet?: boolean }) {
  const accessToken = await getProviderAccessToken(userId, "google")
  const payload: Record<string, unknown> = {
    summary: event.title,
    description: event.description || undefined,
    start: { dateTime: event.startTime.toISOString(), timeZone: "UTC" },
    end: { dateTime: event.endTime.toISOString(), timeZone: "UTC" },
  }
  if (event.createMeet) {
    payload.conferenceData = {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    }
  }

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  )
  if (!response.ok) throw new Error(`Google Calendar event creation failed (${response.status})`)
  return response.json() as Promise<{ id: string; htmlLink?: string; hangoutLink?: string; conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> } }>
}

export async function createOutlookCalendarEvent(userId: string, event: { title: string; description?: string | null; startTime: Date; endTime: Date }) {
  const accessToken = await getProviderAccessToken(userId, "outlook")
  const payload = {
    subject: event.title,
    body: { contentType: "HTML", content: event.description || "" },
    start: { dateTime: event.startTime.toISOString(), timeZone: "UTC" },
    end: { dateTime: event.endTime.toISOString(), timeZone: "UTC" },
  }

  const response = await fetch("https://graph.microsoft.com/v1.0/me/calendar/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Outlook Calendar event creation failed (${response.status})`)
  return response.json() as Promise<{ id: string; webLink?: string; subject?: string }>
}
