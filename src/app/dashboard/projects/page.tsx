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
import { ProjectCard } from "./ProjectCard"

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
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} canDelete={canCreateProject} />
          ))}
        </div>
      )}
    </div>
  )
}
