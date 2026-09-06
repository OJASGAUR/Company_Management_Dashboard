"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const highlights = [
  {
    title: "People & HR",
    description: "Attendance, leave, onboarding and employee records in one place.",
  },
  {
    title: "Projects & Operations",
    description: "Tasks, projects, workload and delivery progress with clear ownership.",
  },
  {
    title: "Finance & Clients",
    description: "Invoices, payments, client records and business documents together.",
  },
]

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M5.5 14.5 14.5 5.5M7 5.5h7.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LandingPage() {
  const [role, setRole] = useState<"employee" | "admin">("employee")

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">Company OS</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Management Platform</p>
            </div>
          </Link>

          <a
            href="#sign-in"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
            <ArrowUpRight />
          </a>
        </div>
      </header>

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Company management platform
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
              One system for running your company.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              Manage people, projects, clients and finances from a single secure workspace built for day-to-day business operations.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Role-based access
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Centralized operations
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Audit-ready activity
              </span>
            </div>

            <div className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="sign-in" className="scroll-mt-24">
            <LoginCard role={role} setRole={setRole} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-[#f7f8fa]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Designed for daily operations</p>
            <p className="mt-1 text-sm text-slate-600">Keep teams, work and business information in one controlled environment.</p>
          </div>
          <p className="text-xs font-medium text-slate-400">Authorized personnel only</p>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Company OS</p>
          <p>Secure company management workspace</p>
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
        setError(
          role === "admin"
            ? "Invalid administrator credentials."
            : "Invalid employee credentials."
        )
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
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
      <div className="rounded-xl border border-slate-100 bg-white p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Secure access</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">
              {role === "admin" ? "Administrator sign in" : "Employee sign in"}
            </h2>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M12 3.75 5.25 6v5.1c0 4.35 2.8 8.28 6.75 9.15 3.95-.87 6.75-4.8 6.75-9.15V6L12 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="m9.75 12 1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setRole("employee")
              setError("")
            }}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition ${role === "employee" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}
          >
            Employee / Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("admin")
              setError("")
            }}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition ${role === "admin" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}
          >
            Administrator / HR
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-600">
              {role === "admin" ? "Admin email or Employee ID" : "Email or Employee ID"}
            </span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-600">Password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-center text-[11px] leading-5 text-slate-400">
            Access is restricted to authorized company personnel. Your session is protected by the platform authentication layer.
          </p>
        </div>
      </div>
    </div>
  )
}
