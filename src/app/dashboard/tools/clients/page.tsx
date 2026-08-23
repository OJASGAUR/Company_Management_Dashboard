import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { Role } from "@prisma/client"

export default async function ClientsManagementPage() {
  await requireRole([Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS])

  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
  const clientEmails = clients.map(client => client.email)
  const users = clientEmails.length
    ? await prisma.user.findMany({ where: { email: { in: clientEmails } }, select: { email: true, isActive: true, role: true } })
    : []
  const statusByEmail = new Map(users.map(user => [user.email, user]))

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Client Operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Client Portal Management</h1><p className="mt-2 text-sm text-slate-500">Manage client records and see whether each client has an active portal account.</p></div>
        <Link href="/dashboard/tools" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">← Back to Business</Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Client</th><th className="p-4">Company</th><th className="p-4">Email</th><th className="p-4">Portal</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">
          {clients.map(client => { const user = statusByEmail.get(client.email); return <tr key={client.id} className="text-sm"><td className="p-4 font-semibold text-slate-900">{client.name}</td><td className="p-4 text-slate-600">{client.company}</td><td className="p-4 text-slate-600">{client.email}</td><td className="p-4">{user?.role === "CLIENT" ? <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">ENABLED</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">NOT ENABLED</span>}</td><td className="p-4">{user ? (user.isActive ? <span className="text-xs font-semibold text-emerald-700">Active</span> : <span className="text-xs font-semibold text-red-700">Disabled</span>) : <span className="text-xs text-slate-400">No account</span>}</td></tr> })}
          {clients.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-500">No client records exist yet. Create one from Finance & CRM.</td></tr>}
        </tbody></table></div>
      </section>

      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6"><h2 className="font-semibold text-cyan-950">How the Limited Portal works</h2><p className="mt-2 text-sm leading-6 text-cyan-900">Create a client record first, then use <strong>Enable client portal</strong> in Finance & CRM to create the client's secure login. The client then signs in with their client email and is automatically routed to the limited portal.</p></div>
    </div>
  )
}
