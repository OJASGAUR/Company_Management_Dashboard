"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

const features = [
  { icon: "▦", title: "One company workspace", text: "Projects, people, tasks and operations in one controlled environment." },
  { icon: "◈", title: "Role-based access", text: "Every workspace is tailored to what each employee or administrator can access." },
  { icon: "↗", title: "Real-time visibility", text: "Track delivery, attendance, leaves, finance and business activity at a glance." },
]

export default function LandingPage() {
  const [role, setRole] = useState<"employee" | "admin">("employee")
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-0 h-[620px] w-[620px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
          <header className="flex h-20 items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-slate-950 shadow-lg">C</div><div><p className="text-sm font-bold tracking-wide">COMPANY OS</p><p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Management Platform</p></div></div>
            <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex"><span>People</span><span>Operations</span><span>Projects</span><span>Insights</span></div>
            <div className="flex items-center gap-3"><span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 sm:inline-flex">● Secure workspace</span><a href="#sign-in" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10">Sign in</a></div>
          </header>
          <section className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-2 text-xs font-semibold text-indigo-200"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />The operating system for your company</div>
              <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Run the company.<br /><span className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-white bg-clip-text text-transparent">Not the paperwork.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">A single workspace for your people, projects, operations and business intelligence — built around secure, role-aware access.</p>
              <div className="mt-10 grid gap-5 sm:grid-cols-3">{features.map(feature => <div key={feature.title} className="border-l border-white/10 pl-4"><span className="text-xl text-indigo-300">{feature.icon}</span><h2 className="mt-3 text-sm font-bold text-white">{feature.title}</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">{feature.text}</p></div>)}</div>
              <div className="mt-10 flex flex-wrap items-center gap-5 text-xs text-slate-500"><span>✓ Encrypted sensitive data</span><span>✓ Server-side authorization</span><span>✓ Audit-ready activity</span></div>
            </div>
            <div id="sign-in" className="scroll-mt-8"><LoginCard role={role} setRole={setRole} /></div>
          </section>
          <footer className="flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Company OS</span><span>Internal company platform · Authorized users only</span></footer>
        </div>
      </div>
    </main>
  )
}

function LoginCard({ role, setRole }: { role: "employee" | "admin"; setRole: (role: "employee" | "admin") => void }) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true)
    try { const result = await signIn("credentials", { identifier, password, redirect: false }); if (result?.error) setError("Invalid ID or password"); else { router.push("/dashboard"); router.refresh() } } catch { setError("Unable to sign in. Please try again.") } finally { setLoading(false) }
  }
  return <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/10 bg-white p-2 text-slate-900 shadow-2xl shadow-black/40">
    <div className="rounded-[22px] bg-slate-50 p-6 sm:p-8">
      <div className="mb-7 flex rounded-xl border border-slate-200 bg-white p-1"><button type="button" onClick={() => { setRole("employee"); setError("") }} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${role === "employee" ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Employee</button><button type="button" onClick={() => { setRole("admin"); setError("") }} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${role === "admin" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Administrator</button></div>
      <div className="mb-7"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-xl text-indigo-700">{role === "admin" ? "◆" : "◉"}</div><h2 className="text-2xl font-black tracking-tight">{role === "admin" ? "Administrator access" : "Welcome back"}</h2><p className="mt-1.5 text-sm text-slate-500">{role === "admin" ? "Manage the company from your control center." : "Sign in to continue to your workspace."}</p></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{role === "admin" ? "Admin ID" : "Email or Employee ID"}</span><input value={identifier} onChange={e => setIdentifier(e.target.value)} required autoComplete="username" placeholder={role === "admin" ? "e.g. SA00001" : "you@company.com"} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /></label>
        <label className="block"><div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</span><button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Forgot password?</button></div><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-700">{showPassword ? "Hide" : "Show"}</button></div></label>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        <button disabled={loading} className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : `Sign in as ${role === "admin" ? "Administrator" : "Employee"}`}</button>
      </form>
      <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">Access is restricted to authorized company users. Your account permissions determine which areas of the platform are available.</p>
    </div>
  </div>
}
