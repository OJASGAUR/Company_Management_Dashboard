"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error", error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 text-2xl font-bold">
          ⚠️
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Application Notice</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
          Unable to Load Workspace
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          An unexpected error occurred. The session has been isolated so you can retry safely without losing your state.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => reset()} variant="primary" size="lg" className="w-full">
            Try Again
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" size="md" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
