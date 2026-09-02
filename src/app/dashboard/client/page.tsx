import Link from "next/link"
import { getClientPortalData } from "@/lib/client-portal"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ClientHomePage() {
  const data = await getClientPortalData()

  if (!data.client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-8">
          <h1 className="text-xl font-bold text-amber-950">Client Account Needs Linking</h1>
          <p className="mt-2 text-xs sm:text-sm text-amber-800 leading-relaxed">
            The signed-in portal account ({data.user.email}) is not yet linked to a client company profile. Please contact your company account manager to link your organization.
          </p>
        </Card>
      </div>
    )
  }

  const openTasks = data.tasks.filter((t) => !["COMPLETED", "CANCELLED"].includes(t.status)).length
  const overdueInvoices = data.invoices.filter((i) => i.status === "OVERDUE").length
  const activeProjects = data.projects.filter((p) => ["ACTIVE", "IN_PROGRESS", "PLANNING"].includes(p.status)).length
  const upcoming = data.projects.filter((p) => p.endDate && new Date(p.endDate) >= new Date()).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Client Workspace"
        title={`Welcome, ${data.client.name}`}
        description={`${data.client.company} · Direct access to project deliverables, invoice billing, and team communication.`}
        actions={
          <Link href="/dashboard/client/messages">
            <Button variant="primary" size="md" className="bg-cyan-600 hover:bg-cyan-700">
              Message Your Team →
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle="Currently underway"
          icon="🚀"
        />
        <StatCard
          title="Open Deliverables"
          value={openTasks}
          subtitle="Tasks requiring attention"
          icon="📝"
        />
        <StatCard
          title="Total Invoices"
          value={data.invoices.length}
          subtitle="Billing statements issued"
          icon="💳"
        />
        <StatCard
          title="Overdue Invoices"
          value={overdueInvoices}
          subtitle={overdueInvoices > 0 ? "Action required" : "All accounts clear"}
          icon="⚠️"
        />
      </div>

      {/* Main Grid: Projects + Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Projects List Card */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Active Projects</h2>
              <p className="text-xs text-slate-500">Milestone timelines and current execution status</p>
            </div>
            <Link href="/dashboard/client/projects">
              <Button variant="ghost" size="sm" className="text-cyan-700">
                View All →
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data.projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                    {project.description || "Project deliverables in progress."}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={project.status} size="sm" />
                  <span className="text-xs text-slate-400 font-medium">
                    Due {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                  </span>
                </div>
              </div>
            ))}
            {data.projects.length === 0 && (
              <EmptyState
                title="No Active Projects"
                description="No projects are currently linked to your client account."
              />
            )}
          </div>
        </Card>

        {/* Upcoming Deadlines Card */}
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 p-5">
            <h2 className="text-base font-bold text-slate-900">Upcoming Milestones</h2>
            <p className="text-xs text-slate-500">Key delivery milestones</p>
          </div>
          <div className="p-5 space-y-3">
            {upcoming.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-xs font-bold text-slate-900">{p.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-cyan-700">
                  Target: {new Date(p.endDate!).toLocaleDateString()}
                </p>
              </div>
            ))}
            {upcoming.length === 0 && (
              <EmptyState
                title="No Pending Milestones"
                description="All upcoming milestones are on track."
              />
            )}
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link href="/dashboard/client/tasks">
          <Card hoverEffect className="h-full">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Deliverables</p>
            <h3 className="mt-1 font-bold text-base text-slate-900">Project Tasks</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {openTasks} active work items in progress across your projects.
            </p>
            <span className="mt-4 inline-block text-xs font-bold text-cyan-600">Open Task List →</span>
          </Card>
        </Link>

        <Link href="/dashboard/client/invoices">
          <Card hoverEffect className="h-full">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Finance</p>
            <h3 className="mt-1 font-bold text-base text-slate-900">Invoices & Statements</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Review statements, billing amounts, and due dates.
            </p>
            <span className="mt-4 inline-block text-xs font-bold text-indigo-600">View Invoices →</span>
          </Card>
        </Link>

        <Link href="/dashboard/client/documents">
          <Card hoverEffect className="h-full">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Assets</p>
            <h3 className="mt-1 font-bold text-base text-slate-900">Shared Documents</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {data.files.length} shared document records and resources.
            </p>
            <span className="mt-4 inline-block text-xs font-bold text-emerald-600">Access Documents →</span>
          </Card>
        </Link>
      </div>
    </div>
  )
}
