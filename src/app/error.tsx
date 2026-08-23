"use client"

import { useEffect } from "react"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error", error)
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn't load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">The error has been isolated so you can retry without losing the rest of the application.</p>
        <button onClick={() => reset()} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Try again</button>
      </section>
    </main>
  )
}
