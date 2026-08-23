import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AuditPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.SUPER_ADMIN) redirect("/admin/users")

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true, employeeId: true } } },
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Security</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Audit Log</h1><p className="mt-2 text-sm text-slate-500">Recent privileged actions across the company platform.</p></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Time</th><th className="p-4">Actor</th><th className="p-4">Action</th><th className="p-4">Entity</th><th className="p-4">Entity ID</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map(log => <tr key={log.id}><td className="p-4 text-xs text-slate-500">{log.createdAt.toLocaleString()}</td><td className="p-4 text-sm text-slate-700">{log.actor?.name || log.actor?.employeeId || log.actor?.email || "System"}</td><td className="p-4"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{log.action}</span></td><td className="p-4 text-sm font-medium text-slate-800">{log.entity}</td><td className="p-4 font-mono text-xs text-slate-500">{log.entityId || "—"}</td></tr>)}{logs.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-500">No audit events recorded yet.</td></tr>}</tbody></table></div></div>
    </div>
  )
}
