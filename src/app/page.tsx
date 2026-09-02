"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/* ──────────────────────────── Data ──────────────────────────── */

const features = [
  {
    title: "People & HR Operations",
    description: "Employee directories, self-service profiles, digital attendance, multi-level leave approvals, and centralized onboarding.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    tag: "Workforce",
  },
  {
    title: "Operations & Workload",
    description: "Task delegation, interactive Kanban boards, delivery capacity management, and deadline monitoring for operations leaders.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    tag: "Execution",
  },
  {
    title: "Project Delivery Control",
    description: "Multi-project tracking, client associations, timeline visibility, and progress milestones across engineering teams.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      </svg>
    ),
    tag: "Delivery",
  },
  {
    title: "Finance & CRM Hub",
    description: "Client relationship management, invoice generation, domain and hosting asset tracking, and secured file storage.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    tag: "Business",
  },
  {
    title: "Management Intelligence",
    description: "Real-time dashboards aggregating workforce presence, active project counts, task completion rates, and financial metrics.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    tag: "Analytics",
  },
  {
    title: "Enterprise Security",
    description: "Role-based server authorization, AES-256 encrypted payroll data, comprehensive audit trails, and isolated client portals.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    tag: "Security",
  },
]

const heroPillars = [
  {
    title: "Workforce & HR",
    subtitle: "Attendance, leaves & profile management",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
      </svg>
    ),
  },
  {
    title: "Task & Project Hub",
    subtitle: "Kanban boards & real-time milestones",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Financial & Client Portal",
    subtitle: "Invoicing, contracts & CRM tracking",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5A2.25 2.25 0 0 1 22.5 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 3.75 4.5z" />
      </svg>
    ),
  },
  {
    title: "Enterprise Defense",
    subtitle: "Role permissions & audit trails",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
]

const securityPillars = [
  {
    title: "Role-Aware Server Authorization",
    description: "Access privileges are strictly validated on the server at the database and mutation boundary — not just visually hidden in the browser.",
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
    description: "High-privilege actions — user onboarding, status toggles, leave approvals, role updates — are recorded with timestamps, actor IDs, and payload metadata.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Isolated Client Multi-Tenancy",
    description: "Client portal users are isolated to their specific assigned records, documents, and invoice histories via strict foreign-key tenant scoping.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
]

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

/* ──────────────────────────── Page ──────────────────────────── */

export default function LandingPage() {
  const [role, setRole] = useState<"employee" | "admin">("employee")

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ── Sticky Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
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

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-slate-900">
                {l.label}
              </a>
            ))}
          </nav>

          <a
            href="#sign-in"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Sign in
          </a>
        </div>
      </header>

      {/* ── Hero Section + Login ── */}
      <section id="sign-in" className="scroll-mt-20 border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          
          {/* ── Redesigned Left Content Area ── */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Unified Enterprise Operating System
            </div>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              Run your company.{" "}
              <span className="block text-slate-400 font-extrabold mt-1">Not the paperwork.</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-500 sm:text-lg">
              A single workspace for workforce management, project execution, time tracking, invoices, and executive intelligence. Built with strict role-based access control.
            </p>

            {/* Feature Highlight Cards Grid */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {heroPillars.map((p) => (
                <div
                  key={p.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{p.title}</h3>
                    <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{p.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-slate-200/60 pt-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                AES-256 Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Server-Side Authorization
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Audit-Ready Logging
              </span>
            </div>
          </div>

          {/* ── Enlarged Sign In Card ── */}
          <div className="flex justify-center lg:justify-end">
            <LoginCard role={role} setRole={setRole} />
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="scroll-mt-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Platform Capabilities</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything your company needs to operate.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-500">
            Replace fragmented single-purpose tools with a unified, role-aware operating system built for modern teams.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="group rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    {f.icon}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Section ── */}
      <section id="security" className="scroll-mt-20 border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Enterprise Defense in Depth</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Built for controlled, compliant enterprise operations.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-500">
            Authorization, sensitive data protection, and operational accountability are core engineering tenets — not afterthoughts.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {securityPillars.map((s) => (
              <article
                key={s.title}
                className="rounded-xl border border-slate-200 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  {s.icon}
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="scroll-mt-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Mission & Vision</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            One unified operating layer for the entire company.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-500">
            Company OS eliminates operational silos across people management, project execution, financial visibility, and administrative oversight.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Centralize",
                description: "Unify personnel, projects, attendance, and client relations in one responsive system.",
                color: "text-indigo-500",
              },
              {
                step: "02",
                title: "Control",
                description: "Enforce role-based boundaries so stakeholders only access what they need to deliver.",
                color: "text-slate-900",
              },
              {
                step: "03",
                title: "Accelerate",
                description: "Transform raw activity data into actionable operational clarity for leadership.",
                color: "text-emerald-500",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-100"
              >
                <p className={`text-3xl font-black ${item.color}`}>{item.step}</p>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="scroll-mt-20 border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Get in Touch</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ready to streamline your operations?
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Reach out to our team to learn how Company OS can transform your company&apos;s workflow.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              {
                label: "Email",
                value: "support@companyos.com",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                ),
              },
              {
                label: "Phone",
                value: "+1 (555) 123-4567",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                ),
              },
              {
                label: "Office",
                value: "123 Enterprise Blvd, Suite 400",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                ),
              },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  {c.icon}
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{c.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-slate-900">
              C
            </div>
            <p className="text-sm font-semibold text-white">Company OS</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-medium">
            <Link href="/features" className="transition hover:text-white">Features</Link>
            <Link href="/security" className="transition hover:text-white">Security</Link>
            <Link href="/about" className="transition hover:text-white">About</Link>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Company OS. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

/* ──────────────────────────── Login Card ──────────────────────────── */

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
            ? "Invalid admin credentials. Only administrators can sign in here."
            : "Invalid credentials. Only employees can sign in here."
        )
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Unable to sign in. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/60">
      <div className="rounded-xl bg-white p-7 sm:p-10">
        
        {/* Role Toggle Tabs — Larger & Prominent */}
        <div className="mb-8 flex rounded-xl border border-slate-200 bg-slate-100/80 p-1.5">
          <button
            type="button"
            onClick={() => {
              setRole("employee")
              setError("")
            }}
            className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
              role === "employee"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Employee / Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("admin")
              setError("")
            }}
            className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
              role === "admin"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Administrator / HR
          </button>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {role === "admin" ? "Administrator Access" : "Welcome back"}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {role === "admin"
            ? "Sign in with your authorized admin credentials."
            : "Sign in with your employee email or ID."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
              {role === "admin" ? "Admin Email or Employee ID" : "Email or Employee ID"}
            </span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your email or employee ID"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-base sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Authenticating..." : `Sign in as ${role === "admin" ? "Administrator" : "Employee"}`}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          Authorized personnel only · Session secured with HTTPS
        </p>
      </div>
    </div>
  )
}
