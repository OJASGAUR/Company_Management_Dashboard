import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { ReactNode } from "react"
import { Role } from "@prisma/client"
import { requireRole } from "@/lib/auth/require-role"
import { assignTask } from "../actions"

export default async function OperationsDashboard() {
  const user = await requireRole([Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER])
  const [employees, projects, activeTasks] = await Promise.all([
    prisma.user.findMany({ where: { role: { notIn: [Role.SUPER_ADMIN, Role.CLIENT] }, isActive: true }, select: { id: true, name: true, role: true, department: true } }),
    prisma.project.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true } }),
    prisma.task.findMany({ where: { status: { not: "COMPLETED" } }, include: { user: true, project: true }, orderBy: { deadline: "asc" } }),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Operations Dashboard</h1><p className="mt-2 text-sm text-slate-500">Assign work, monitor workload and manage delivery capacity.</p></div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-900">Assign New Task</h2><span className="text-xs text-slate-400">{employees.length} active people</span></div>
          <form action={assignTask} className="space-y-4">
            <Field label="Task Title"><input name="title" required className="field" /></Field>
            <Field label="Project"><select name="projectId" className="field"><option value="">No Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Assign To"><select name="userId" required className="field">{employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role.replace(/_/g, " ")})</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-4"><Field label="Priority"><select name="priority" className="field"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></Field><Field label="Deadline"><input type="date" name="deadline" className="field" /></Field></div>
            <Field label="Description"><textarea name="description" className="field h-24 resize-none" /></Field>
            <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Assign Task</button>
          </form>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-6"><div><h2 className="text-xl font-semibold text-slate-900">Active Tasks Monitoring</h2><p className="mt-1 text-xs text-slate-500">Sorted by nearest deadline.</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{activeTasks.length} Active</span></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Task</th><th className="p-4">Assigned to</th><th className="p-4">Status</th><th className="p-4 text-right">Deadline</th></tr></thead><tbody className="divide-y divide-slate-100">{activeTasks.map(task => <tr key={task.id} className="text-sm hover:bg-slate-50"><td className="p-4"><p className="font-medium text-slate-900">{task.title}</p><p className="text-xs text-slate-500">{task.project?.name || "General"}</p></td><td className="p-4 text-slate-700">{task.user.name || "Unnamed"}</td><td className="p-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{task.status.replace(/_/g, " ")}</span></td><td className="p-4 text-right text-slate-500">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</td></tr>)}{activeTasks.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-sm text-slate-500">No active tasks currently.</td></tr>}</tbody></table></div>
        </div>
      </div>
      {user.role === Role.SUPER_ADMIN && <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6"><h2 className="font-semibold text-indigo-950">Employee onboarding is centralized</h2><p className="mt-2 text-sm text-indigo-800">Use the secure HR onboarding flow for new employees so role grants, sensitive banking data, onboarding state and audit logging stay consistent.</p><Link href="/admin/users/new" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open onboarding</Link></div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="space-y-1"><span className="block text-sm font-medium text-slate-700">{label}</span>{children}</label> }
