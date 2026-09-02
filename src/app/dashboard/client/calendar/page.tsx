import { getClientPortalData } from "@/lib/client-portal"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ClientCalendarPage() {
  const { client } = await getClientPortalData()
  if (!client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-amber-900 text-sm">
          This client account is not linked to a client company profile yet.
        </Card>
      </div>
    )
  }

  const projects = await prisma.project.findMany({
    where: { clientName: client.company, endDate: { not: null } },
    orderBy: { endDate: "asc" },
    take: 50,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Delivery Milestones & Calendar"
        description="Release schedules, phase handoffs, and target milestone delivery dates for your organization."
      />

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 p-5">
          <h2 className="text-base font-bold text-slate-900">Project Delivery Milestones</h2>
          <p className="text-xs text-slate-500">Upcoming target deadlines</p>
        </div>

        <div className="divide-y divide-slate-100">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 font-bold text-cyan-700 text-xl">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={project.status} size="sm" />
                    {project.startDate && (
                      <span className="text-xs text-slate-400">
                        Started: {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Delivery</p>
                <p className="font-mono text-sm font-extrabold text-cyan-700 mt-0.5">
                  {new Date(project.endDate!).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <EmptyState
              icon="📅"
              title="No Upcoming Project Milestones"
              description="No target completion dates have been scheduled for your projects."
            />
          )}
        </div>
      </Card>
    </div>
  )
}
