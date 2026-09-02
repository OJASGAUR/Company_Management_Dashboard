import Link from "next/link"
import { getClientPortalData } from "@/lib/client-portal"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ClientProjectsPage() {
  const { client, projects } = await getClientPortalData()
  if (!client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-amber-900 text-sm">
          This client account is not linked to a client company profile yet.
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Project Deliverables"
        description="Track all development projects and milestone deliverables associated with your organization."
      />

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon="🚀"
            title="No Projects Associated"
            description="There are currently no active development projects assigned to your company record."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-slate-900">{project.name}</h3>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 mb-5">
                  {project.description || "No project description provided."}
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</span>
                    <span className="font-semibold text-slate-800">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Delivery</span>
                    <span className="font-semibold text-slate-800">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/client/tasks?project=${project.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
                >
                  <span>View Project Tasks</span>
                  <span>→</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
