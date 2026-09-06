import { Suspense } from "react"
import PasswordSetupClient from "./PasswordSetupClient"

function PasswordSetupFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black">C</div>
        <h1 className="text-2xl font-extrabold">Set your Company Portal password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Loading your secure password setup form…</p>
      </div>
    </main>
  )
}

export default function PasswordSetupPage() {
  return (
    <Suspense fallback={<PasswordSetupFallback />}>
      <PasswordSetupClient />
    </Suspense>
  )
}
