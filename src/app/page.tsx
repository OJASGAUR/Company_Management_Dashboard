"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const capabilities = [
  {
    eyebrow: "01",
    title: "People & HR",
    description: "Centralize employee records, attendance, leave workflows and onboarding without fragmented spreadsheets.",
    visual: "people",
  },
  {
    eyebrow: "02",
    title: "Projects & Operations",
    description: "Keep tasks, ownership, workload and delivery progress visible to the people responsible for execution.",
    visual: "projects",
  },
  {
    eyebrow: "03",
    title: "Finance & Clients",
    description: "Manage clients, invoices, payments and business documents from one controlled workspace.",
    visual: "finance",
  },
]

const operatingLayers = [
  { title: "Executive oversight", description: "A clear operating view across people, work and finance." },
  { title: "Team execution", description: "The tools teams need to manage day-to-day work." },
  { title: "Administrative control", description: "Permissions, approvals and records stay governed." },
  { title: "Client coordination", description: "Client-facing information remains organized and accessible." },
]

function ArrowUpRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5 15 15 5M7 5h8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CapabilityVisual({ type }: { type: string }) {
  if (type === "people") {
    return (
      <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">People</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Workforce overview</p>
          </div>
          <div className="h-8 w-8 rounded-lg border border-slate-200 bg-white" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {["142", "18", "07"].map((value, index) => (
            <div key={value} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-lg font-semibold text-slate-900">{value}</p>
              <p className="mt-1 text-[9px] uppercase tracking-wider text-slate-400">
                {index === 0 ? "Employees" : index === 1 ? "On leave" : "New this month"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Attendance</span><span>94%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[94%] rounded-full bg-indigo-600" /></div>
        </div>
      </div>
    )
  }

  if (type === "projects") {
    return (
      <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Operations</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Project delivery</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">On track</span>
        </div>
        <div className="mt-5 space-y-3">
          {[['Website redesign', '72%'], ['Mobile release', '54%'], ['Client portal', '88%']].map(([name, progress]) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-700">{name}</span>
                <span className="text-slate-400">{progress}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-slate-900" style={{ width: progress }} /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Finance</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Business snapshot</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">September</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[9px] uppercase tracking-wider text-slate-400">Outstanding</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">₹8.4L</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[9px] uppercase tracking-wider text-slate-400">Collected</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">₹24.7L</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-end gap-1.5 pt-3">
          {[38, 52, 44, 68, 61, 82, 76, 92].map((height, index) => (
            <div key={index} className="flex-1 rounded-t bg-slate-800" style={{ height: `${height}%`, minHeight: 16 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [role, setRole] = useState<"employee" | "admin">("employee")

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950 selection:bg-indigo-100 selection:text-indigo-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm transition group-hover:bg-indigo-700">
              C
            </div>
            <div className="leading-none">
              <p className="text-[14px] font-semibold tracking-[-0.01em] text-slate-950">Company OS</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Management platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#platform" className="text-[13px] font-medium text-slate-500 transition hover:text-slate-950">Platform</a>
            <a href="#capabilities" className="text-[13px] font-medium text-slate-500 transition hover:text-slate-950">Capabilities</a>
            <a href="#security" className="text-[13px] font-medium text-slate-500 transition hover:text-slate-950">Security</a>
            <a href="#about" className="text-[13px] font-medium text-slate-500 transition hover:text-slate-950">About</a>
          </nav>

          <a href="#sign-in" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-indigo-700">
            Sign in <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <section id="platform" className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Company management platform
              </div>

              <h1 className="mt-7 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.65rem]">
                Run the business.<br />
                <span className="text-slate-400">Keep the complexity out.</span>
              </h1>

              <p className="mt-7 max-w-xl text-[16px] leading-7 text-slate-500 sm:text-[18px]">
                A single operating workspace for people, projects, clients and finance — designed to give teams clarity and leadership control without the clutter.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#sign-in" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-[13px] font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-indigo-700">
                  Access your workspace <ArrowUpRight />
                </a>
                <a href="#capabilities" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  Explore the platform
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-medium text-slate-500">
                {['Role-based access', 'Centralized operations', 'Audit-ready activity'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2"><CheckIcon />{item}</span>
                ))}
              </div>
            </div>

            <div id="sign-in" className="relative scroll-mt-28">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-100/60 via-transparent to-slate-100 blur-2xl" />
              <div className="relative rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.32)]">
                <LoginCard role={role} setRole={setRole} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
          <div className="grid gap-6 md:grid-cols-4 md:divide-x md:divide-slate-200">
            {operatingLayers.map((item) => (
              <div key={item.title} className="md:px-7 first:md:pl-0 last:md:pr-0">
                <p className="text-[12px] font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="border-b border-slate-200 bg-white scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">The platform</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                The operating layer behind everyday work.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500 lg:text-right">
              Built around the workflows that keep a company moving — with enough control for administrators and enough simplicity for teams.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.25)]">
                <CapabilityVisual type={item.visual} />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">{item.eyebrow}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-b border-slate-200 bg-slate-950 text-white scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">Trust & governance</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Control where it matters.</h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
                The platform is designed around controlled access, sensitive-data protection and accountability across day-to-day operations.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Role-aware authorization', 'Permissions are enforced around the actions and information each user should access.'],
                ['Sensitive data protection', 'Protected business records are handled separately from ordinary operational data.'],
                ['Audit-ready activity', 'High-privilege administrative actions are recorded for operational accountability.'],
                ['Client data boundaries', 'Client-facing records remain associated with the appropriate business relationship.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-indigo-200"><CheckIcon /></div>
                  <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-slate-200 bg-[#f8fafc] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">A simpler operating model</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Less switching. More visibility.</h2>
            <p className="mt-5 text-sm leading-6 text-slate-500 sm:text-base">
              Company OS brings the everyday operating layers of a company into one coherent workspace so teams can spend less time coordinating tools and more time doing the work.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
            {[
              ['01', 'Centralize', 'Bring people, work and business records into one system.'],
              ['02', 'Coordinate', 'Give every role the context it needs to act quickly.'],
              ['03', 'Control', 'Keep access, approvals and sensitive actions governed.'],
            ].map(([step, title, description]) => (
              <div key={step} className="bg-white p-7 sm:p-8">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600">{step}</p>
                <h3 className="mt-5 text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="rounded-3xl bg-slate-950 px-7 py-10 text-white sm:px-12 sm:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">Ready when you are</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your company workspace, in one place.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Sign in to continue to the workspace and pick up where your team left off.</p>
              </div>
              <a href="#sign-in" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-[13px] font-semibold text-slate-950 transition hover:bg-indigo-50">
                Sign in to Company OS <ArrowUpRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">C</span>
                <span className="text-sm font-semibold text-slate-950">Company OS</span>
              </Link>
              <p className="mt-3 max-w-sm text-xs leading-5 text-slate-400">A unified management workspace for people, projects, clients and business operations.</p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-slate-500">
              <a href="#platform" className="transition hover:text-slate-950">Platform</a>
              <a href="#capabilities" className="transition hover:text-slate-950">Capabilities</a>
              <a href="#security" className="transition hover:text-slate-950">Security</a>
              <a href="#about" className="transition hover:text-slate-950">About</a>
              <a href="#sign-in" className="transition hover:text-slate-950">Sign in</a>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Company OS. All rights reserved.</p>
            <p>Authorized company personnel only.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function LoginCard({
  role,
  setRole,
}: {
  role: "employee" | "admin"
  setRole: (r: "employee" | "admin") => void
}) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        loginRole: role,
        redirect: false,
      })

      if (result?.error) {
        setError(role === "admin" ? "Invalid administrator credentials." : "Invalid employee credentials.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Unable to sign in. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Secure access</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Sign in</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">Access the Company OS workspace.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M12 3.75 5.25 6v5.1c0 4.35 2.8 8.28 6.75 9.15 3.95-.87 6.75-4.8 6.75-9.15V6L12 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m9.75 12 1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button type="button" onClick={() => { setRole("employee"); setError("") }} className={`rounded-md px-3 py-2.5 text-xs font-semibold transition ${role === "employee" ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
          Employee / Staff
        </button>
        <button type="button" onClick={() => { setRole("admin"); setError("") }} className={`rounded-md px-3 py-2.5 text-xs font-semibold transition ${role === "admin" ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
          Administrator / HR
        </button>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-600">{role === "admin" ? "Admin email or Employee ID" : "Email or Employee ID"}</span>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" placeholder="you@company.com" className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-600">Password</span>
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
            <button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700">{show ? "Hide" : "Show"}</button>
          </div>
        </label>

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">{error}</div>}

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-center text-[10px] leading-5 text-slate-400">Access is restricted to authorized company personnel.</p>
      </div>
    </div>
  )
}
