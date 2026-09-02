import Link from "next/link"
import { bootstrapAdmin } from "./actions"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; employeeId?: string }>
}) {
  const params = await searchParams
  const adminExists = (await prisma.user.count({ where: { role: Role.SUPER_ADMIN } })) > 0

  return (
    <main className="min-h-screen bg-[#060b14] px-6 py-16 text-white selection:bg-indigo-500">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            Initial Environment Setup
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Super Administrator Setup
          </h1>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
            This one-time bootstrap wizard is active only when no Super Admin exists in the database.
          </p>
        </div>

        {params.created === "1" ? (
          <section className="rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-8 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl mb-4">
              ✓
            </div>
            <h2 className="text-xl font-bold text-emerald-300">Administrator Profile Created</h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Your primary Super Admin account has been securely provisioned in the database.
            </p>
            {params.employeeId && (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Admin Identifier</p>
                <p className="mt-1 font-mono text-lg font-bold text-emerald-400">{params.employeeId}</p>
              </div>
            )}
            <Link
              href="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Proceed to Sign In →
            </Link>
          </section>
        ) : adminExists ? (
          <section className="rounded-3xl border border-amber-500/30 bg-amber-950/30 p-8 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 text-2xl mb-4">
              🔒
            </div>
            <h2 className="text-xl font-bold text-amber-300">Bootstrap Locked</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              A Super Admin account already exists. For enterprise security, this wizard cannot create additional administrators.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Back to Sign In
            </Link>
          </section>
        ) : (
          <form
            action={bootstrapAdmin}
            className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          >
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Bootstrap Secret <span className="text-rose-400">*</span>
              </span>
              <input
                name="setupSecret"
                type="password"
                required
                placeholder="Matches BOOTSTRAP_ADMIN_SECRET"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Name <span className="text-rose-400">*</span>
                </span>
                <input
                  name="name"
                  required
                  placeholder="Administrator Name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address <span className="text-rose-400">*</span>
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@company.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Master Password <span className="text-rose-400">*</span>
              </span>
              <input
                name="password"
                type="password"
                minLength={10}
                required
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <span className="mt-1.5 block text-xs text-slate-400">Minimum 10 characters required.</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.99]"
            >
              Create Super Administrator
            </button>

            <p className="text-center text-xs text-slate-500 leading-relaxed">
              Environment configuration must contain matching <code>BOOTSTRAP_ADMIN_SECRET</code>.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
