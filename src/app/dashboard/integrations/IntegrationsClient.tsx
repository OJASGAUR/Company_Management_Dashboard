"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

const providers = [
  {
    key: "google",
    name: "Google Calendar",
    description: "Connect your Google Calendar to create company events directly in your calendar.",
    detail: "Google Meet is included through the same Google authorization.",
  },
  {
    key: "google-meet",
    name: "Google Meet",
    description: "Generate Google Meet links when creating company meetings.",
    detail: "Requires a connected Google Calendar account.",
  },
  {
    key: "outlook",
    name: "Outlook Calendar",
    description: "Connect Microsoft Outlook Calendar for work and school accounts.",
    detail: "Calendar events are created through Microsoft Graph.",
  },
] as const

type Status = { google: boolean; outlook: boolean }

export default function IntegrationsClient({ initialStatus }: { initialStatus: Status }) {
  const searchParams = useSearchParams()
  const connected = searchParams.get("connected")
  const error = searchParams.get("error")
  const [status, setStatus] = useState(initialStatus)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(() => {
    if (connected) return `${connected === "google" ? "Google Calendar" : "Outlook Calendar"} connected successfully.`
    return error
  })

  useEffect(() => {
    if (connected || error) window.history.replaceState({}, "", "/dashboard/integrations")
  }, [connected, error])

  async function disconnect(provider: "google" | "outlook") {
    setBusy(provider)
    setMessage(null)
    try {
      const response = await fetch(`/api/integrations?provider=${provider}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Unable to disconnect integration")
      setStatus((current) => ({ ...current, [provider]: false }))
      setMessage(`${provider === "google" ? "Google Calendar" : "Outlook Calendar"} disconnected.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to disconnect integration")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Integrations</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Calendar & meeting integrations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Connect the company workspace to the calendars your team already uses. OAuth credentials stay on the server and refresh tokens are encrypted before storage.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {providers.map((provider) => {
          const connected = provider.key === "google-meet" ? status.google : status[provider.key]

          return (
            <article key={provider.key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                  {provider.key === "outlook" ? "O" : provider.key === "google-meet" ? "M" : "G"}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {connected ? "Connected" : "Not connected"}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-950">{provider.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{provider.description}</p>
              <p className="mt-3 text-xs leading-5 text-slate-400">{provider.detail}</p>

              <div className="mt-6 flex items-center gap-3">
                {provider.key === "google-meet" ? (
                  <a
                    href="/dashboard/calendar"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Use with Calendar
                  </a>
                ) : connected ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => disconnect(provider.key)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {busy === provider.key ? "Disconnecting…" : "Disconnect"}
                  </button>
                ) : (
                  <a
                    href={`/api/integrations/${provider.key}/connect`}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Connect {provider.name}
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
        <h2 className="text-sm font-semibold text-slate-900">How it works</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Google Calendar and Outlook use OAuth 2.0. After a connection is approved, Company OS can create calendar events on the authenticated user&apos;s calendar. Google Meet is generated as conference data on a Google Calendar event, so no separate Meet credential is required.
        </p>
        <a href="/dashboard/calendar" className="mt-4 inline-flex rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50">
          Open Company Calendar →
        </a>
      </div>
    </div>
  )
}
