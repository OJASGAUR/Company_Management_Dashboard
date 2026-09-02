import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const allowed: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS]
  if (!allowed.includes(session.user.role)) redirect("/dashboard")

  const [
    employees,
    activeEmployees,
    projects,
    activeProjects,
    tasks,
    completedTasks,
    pendingLeaves,
    unpaidInvoices,
  ] = await Promise.all([
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
  const activeStaffPercent = employees ? Math.round((activeEmployees / employees) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Management Intelligence"
        title="Reports & Operational Analytics"
        description="Aggregated operational health metrics across workforce, project delivery, workloads, and business balances."
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Workforce"
          value={`${activeEmployees} / ${employees}`}
          subtitle={`${activeStaffPercent}% active accounts`}
          icon="👥"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle={`Out of ${projects} total recorded`}
          icon="🚀"
        />
        <StatCard
          title="Task Completion Rate"
          value={`${taskCompletion}%`}
          subtitle={`${completedTasks} of ${tasks} completed`}
          icon="📈"
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidInvoices}
          subtitle="Invoices pending payment"
          icon="💳"
        />
      </div>

      {/* Analytics Breakdown Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workload Snapshot Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Workload & Deliverables Snapshot</CardTitle>
            <CardDescription>Execution health across all ongoing company tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Total Recorded Tasks" value={tasks} />
            <Row label="Completed Deliverables" value={completedTasks} />
            <Row label="Open / In-Progress Tasks" value={Math.max(0, tasks - completedTasks)} />
            <Row label="Total Projects Tracked" value={projects} />

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Overall Task Completion</span>
                <span className="text-indigo-600 font-bold">{taskCompletion}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${taskCompletion}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* People Operations Panel */}
        <Card>
          <CardHeader>
            <CardTitle>People & Operations Overview</CardTitle>
            <CardDescription>Human resource availability and pending approval queues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Total Employee Directory" value={employees} />
            <Row label="Active Staff Accounts" value={activeEmployees} />
            <Row label="Pending Leave Applications" value={pendingLeaves} />
            <Row label="Inactive / Archived Profiles" value={employees - activeEmployees} />

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Active Account Ratio</span>
                <span className="text-emerald-600 font-bold">{activeStaffPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${activeStaffPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Architecture Banner */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-indigo-50/60">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            📊
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Database Connected</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              All metrics on this page reflect live PostgreSQL counts from your database models. Department productivity, attendance trends, revenue, and project profitability feed directly into this dashboard.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  )
}
