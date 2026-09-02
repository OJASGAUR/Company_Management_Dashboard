import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">
              C
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">Company OS</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Management Platform</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/features" className="transition-colors hover:text-slate-900">
              Features
            </Link>
            <Link href="/security" className="transition-colors hover:text-slate-900">
              Security
            </Link>
            <Link href="/about" className="font-semibold text-slate-900">
              About
            </Link>
            <Link
              href="/#sign-in"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Mission & Vision</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          One unified operating layer for the entire company.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-slate-500 sm:text-lg">
          Company OS is built to eliminate operational silos across people management, project execution, financial visibility, and administrative oversight. Every team member and executive works from a shared source of truth.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-100">
            <p className="text-3xl font-black text-indigo-500">01</p>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Centralize</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Unify personnel, projects, attendance, and client relations in one responsive system.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-100">
            <p className="text-3xl font-black text-slate-900">02</p>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Control</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Enforce role-based boundaries so stakeholders only access what they need to deliver.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-100">
            <p className="text-3xl font-black text-emerald-500">03</p>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Accelerate</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Transform raw activity data into actionable operational clarity for leadership.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
