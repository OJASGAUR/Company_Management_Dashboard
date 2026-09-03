"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { setOnboardingPassword } from "./actions"

export default function PasswordSetupPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(event.currentTarget)
    formData.set("token", token)
    const result = await setOnboardingPassword(formData)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Unable to set password.")
    }
    setSubmitting(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black">C</div>
        <h1 className="text-2xl font-extrabold">Set your Company Portal password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Create the password you will use with your login email or Employee ID.</p>

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              Your password has been set successfully. This setup link can no longer be used.
            </div>
            <a href="/" className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200">
              Go to Sign In →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!token && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300">Invalid setup link.</div>}
            {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300">{error}</div>}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">New Password</span>
              <input name="password" type="password" minLength={8} required autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20" placeholder="Minimum 8 characters" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Confirm Password</span>
              <input name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20" placeholder="Enter the same password again" />
            </label>
            <button disabled={submitting || !token} type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? "Saving password…" : "Set Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
