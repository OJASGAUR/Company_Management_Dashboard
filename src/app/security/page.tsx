import Link from "next/link"

const controls = [
  {
    title: "Role-Aware Server Authorization",
    description: "Access privileges are strictly validated on the server at the database and mutation boundary, not just visually hidden in the browser UI.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "AES-256 Encrypted Banking Records",
    description: "Employee bank accounts, IFSC codes, and payroll secrets are protected at rest with authenticated AES-256-GCM symmetric encryption.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: "Immutable Security Audit Logging",
    description: "High-privilege actions (user onboarding, status toggles, leave approvals, and role updates) are recorded with timestamps, actor IDs, and payload records.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Isolated Client Multi-Tenancy",
    description: "Client portal users are isolated to their specific assigned company records, documents, and invoice histories via strict foreign-key tenant scoping.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
]

export default function SecurityPage() {
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
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Security Architecture</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/features" className="transition-colors hover:text-slate-900">
              Features
            </Link>
            <Link href="/security" className="font-semibold text-slate-900">
              Security
            </Link>
            <Link href="/about" className="transition-colors hover:text-slate-900">
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
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Enterprise Defense in Depth</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Built for controlled, compliant enterprise operations.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Company OS treats authorization, sensitive personnel data, and operational accountability as core engineering tenets.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {controls.map((c) => (
            <article
              key={c.title}
              className="rounded-xl border border-slate-200 bg-white p-8 transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                {c.icon}
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-900">{c.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{c.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
