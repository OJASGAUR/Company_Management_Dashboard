import { prisma } from "@/lib/prisma"
import { createProject } from "../actions"
import { requireRole } from "@/lib/auth/require-role"
import { Role } from "@prisma/client"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { FormField, Input } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

const PROJECT_CREATE_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.DIRECTOR,
  Role.OPERATIONS_MANAGER,
]

export default async function ProjectsPage() {
  const user = await requireRole([
    Role.SUPER_ADMIN,
    Role.DIRECTOR,
    Role.OPERATIONS_MANAGER,
    Role.TEAM_LEAD,
    Role.DEVELOPER,
    Role.DESIGNER,
    Role.TESTER,
  ])

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: { id: true, status: true },
      },
    },
  })

  const canCreateProject = PROJECT_CREATE_ROLES.includes(user.role)

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Delivery"
        title="Projects & Milestones"
        description="Monitor company project deliverables, timelines, and client engagements."
      />

      {/* Create Project Form for Authorized Managers */}
      {canCreateProject && (
        <Card className="border-indigo-100 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
              <CardTitle>Launch New Project</CardTitle>
            </div>
            <CardDescription>Initiate a new project record and configure milestones.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProject} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
              <FormField label="Project Name" required>
                <Input name="name" required placeholder="e.g. Acme Mobile App" />
              </FormField>

              <FormField label="Client / Account Name">
                <Input name="clientName" placeholder="e.g. Acme Corp or Internal" />
              </FormField>

              <FormField label="Start Date">
                <Input type="date" name="startDate" />
              </FormField>

              <FormField label="Target Delivery Date">
                <Input type="date" name="endDate" />
              </FormField>

              <div className="md:col-span-2 lg:col-span-3">
                <FormField label="Project Scope & Objectives">
                  <Input name="description" placeholder="Brief outline of deliverables and tech stack..." />
                </FormField>
              </div>

              <div>
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <EmptyState
            title="No Active Projects"
            description="There are currently no projects recorded. Managers can launch a new project using the form above."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const completedCount = project.tasks.filter((t) => t.status === "COMPLETED").length
            const totalTasks = project.tasks.length
            const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

            return (
              <Card key={project.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-900" title={project.name}>
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} size="sm" />
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 mb-5">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Client / Account</span>
                    <span className="font-semibold text-slate-800">{project.clientName || "Internal"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Timeline</span>
                    <span className="font-medium text-slate-600">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} –{" "}
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>

                  {totalTasks > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Progress ({completedCount}/{totalTasks} tasks)</span>
                        <span className="font-bold text-indigo-600">{completionPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
