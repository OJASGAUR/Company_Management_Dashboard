import { getClientPortalData } from "@/lib/client-portal"
import { PageHeader } from "@/components/ui/PageHeader"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ClientTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { tasks, client } = await getClientPortalData()
  if (!client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-amber-900 text-sm">
          This client account is not linked to a client company profile yet.
        </Card>
      </div>
    )
  }

  const { project } = await searchParams
  const visible = project ? tasks.filter((task) => task.projectId === project) : tasks

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Project Work Items"
        description="Real-time visibility into development deliverables and tickets associated with your projects."
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon="📝"
            title="No Work Items Recorded"
            description="There are currently no tasks associated with this project view."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Deliverable Title</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Priority</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Target Date</TableHeaderCell>
                <TableHeaderCell className="text-right">Lead</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {visible.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <p className="font-bold text-slate-900 leading-snug">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-semibold text-slate-700">
                    {task.project?.name || "General"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={task.priority} size="sm" />
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={task.status} size="sm" />
                  </TableCell>

                  <TableCell className="text-xs font-mono text-slate-600">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                  </TableCell>

                  <TableCell className="text-right text-xs font-medium text-slate-600">
                    {task.user?.name || "Team"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
