import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Role } from "@prisma/client"
import { requireRole } from "@/lib/auth/require-role"
import { assignTask } from "../actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function OperationsDashboard() {
  const user = await requireRole([Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER])

  const [employees, projects, activeTasks] = await Promise.all([
    prisma.user.findMany({
      where: { role: { notIn: [Role.SUPER_ADMIN, Role.CLIENT] }, isActive: true },
      select: { id: true, name: true, role: true, department: true },
    }),
    prisma.project.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true } }),
    prisma.task.findMany({
      where: { status: { not: "COMPLETED" } },
      include: { user: true, project: true },
      orderBy: { deadline: "asc" },
    }),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Operations"
        title="Operations Control Hub"
        description="Delegate deliverables, manage workforce capacity, and monitor company-wide task deadlines."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Active Personnel"
          value={employees.length}
          subtitle="Available for task assignment"
          icon="👥"
        />
        <StatCard
          title="Active Projects"
          value={projects.length}
          subtitle="Currently underway"
          icon="🚀"
        />
        <StatCard
          title="Deliverables in Flight"
          value={activeTasks.length}
          subtitle="Sorted by nearest deadline"
          icon="⚡"
        />
      </div>

      {/* Main Grid: Assignment Form + Task Monitor */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Assign Task Form Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Assign New Task</CardTitle>
            <CardDescription>Delegate a deliverable to a team member.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={assignTask} className="space-y-4">
              <FormField label="Task Title" required>
                <Input name="title" required placeholder="e.g. Audit API Endpoints" />
              </FormField>

              <FormField label="Associated Project">
                <Select name="projectId">
                  <option value="">No Project (General)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Assignee" required>
                <Select name="userId" required>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || "Employee"} ({e.role.replace(/_/g, " ")})
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Priority">
                  <Select name="priority" defaultValue="MEDIUM">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </FormField>
                <FormField label="Deadline">
                  <Input type="date" name="deadline" />
                </FormField>
              </div>

              <FormField label="Description">
                <Textarea
                  name="description"
                  rows={3}
                  placeholder="Specific requirements or acceptance criteria..."
                  className="resize-none"
                />
              </FormField>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Assign Deliverable
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Tasks Monitoring Table Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Deliverables Monitoring</CardTitle>
              <CardDescription>Real-time queue sorted by nearest deadline.</CardDescription>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
              {activeTasks.length} In Progress
            </span>
          </CardHeader>
          <CardContent>
            {activeTasks.length === 0 ? (
              <EmptyState
                title="No Active Deliverables"
                description="All tasks are completed. Use the form to assign new work."
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Deliverable</TableHeaderCell>
                      <TableHeaderCell>Owner</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell className="text-right">Deadline</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {activeTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <p className="font-bold text-slate-900 leading-snug">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.project?.name || "General Operational"}</p>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700">
                          {task.user.name || "Unnamed"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-600">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Super Admin / HR Onboarding Alert */}
      {user.role === Role.SUPER_ADMIN && (
        <Card className="border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-sm">
                👤
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Centralized Employee Onboarding</h3>
                <p className="mt-1 text-xs text-slate-600 max-w-xl">
                  Register new employees through the secure HR onboarding portal to automatically set up role permissions, AES-encrypted banking, and activity audit trails.
                </p>
              </div>
            </div>
            <Link href="/admin/users/new" className="shrink-0">
              <Button variant="primary" size="md">
                Open Onboarding Wizard →
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
