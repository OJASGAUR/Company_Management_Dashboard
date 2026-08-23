import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import type { ReactNode } from "react"

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const allowed = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS]
  if (!allowed.includes(session.user.role)) redirect("/dashboard")

  const [employees, activeEmployees, projects, activeProjects, tasks, completedTasks, pendingLeaves, unpaidInvoices] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: "COMPLETED" } }),
    prisma.leave.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: { in: ["UNPAID", "OVERDUE"] } } }),
  ])

  const taskCompletion = tasks ? Math.round((completedTasks / tasks) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Management Intelligence</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1><p className="mt-2 text-sm text-slate-500">Live operational metrics from employees, projects, tasks, leave and finance.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Active employees" value={`${activeEmployees}/${employees}`} />
        <Metric title="Active projects" value={activeProjects} />
        <Metric title="Task completion" value={`${taskCompletion}%`} />
        <Metric title="Unpaid invoices" value={unpaidInvoices} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Workload snapshot"><Row label="Total tasks" value={tasks} /><Row label="Completed tasks" value={completedTasks} /><Row label="Open tasks" value={Math.max(0, tasks - completedTasks)} /><Row label="Total projects" value={projects} /></Panel>
        <Panel title="People operations"><Row label="Employees" value={employees} /><Row label="Active accounts" value={activeEmployees} /><Row label="Pending leave requests" value={pendingLeaves} /></Panel>
      </div>
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6"><h2 className="font-semibold text-indigo-950">Analytics foundation</h2><p className="mt-2 text-sm leading-6 text-indigo-800">The reporting surface is connected to live database counts. Department productivity, attendance trends, revenue, project profitability and monthly dashboards can be layered onto the same reporting system as those data models mature.</p></div>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string | number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div> }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-slate-900">{title}</h2>{children}</section> }
function Row({ label, value }: { label: string; value: string | number }) { return <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"><span className="text-sm text-slate-500">{label}</span><span className="font-semibold text-slate-900">{value}</span></div> }
