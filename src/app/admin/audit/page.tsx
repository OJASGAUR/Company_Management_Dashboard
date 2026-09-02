import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function AuditPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.SUPER_ADMIN) redirect("/admin/users")

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true, employeeId: true } } },
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Security & Compliance"
        title="System Audit Log"
        description="Immutable audit trail of privileged administrative actions and state modifications."
      />

      {logs.length === 0 ? (
        <Card>
          <EmptyState
            icon="📜"
            title="No Audit Events Recorded"
            description="Privileged actions and role updates will be logged here automatically."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>Actor / User</TableHeaderCell>
                <TableHeaderCell>Action Performed</TableHeaderCell>
                <TableHeaderCell>Target Entity</TableHeaderCell>
                <TableHeaderCell className="text-right">Entity Reference</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString()} ·{" "}
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>

                  <TableCell>
                    <p className="font-bold text-slate-900 leading-snug">
                      {log.actor?.name || log.actor?.employeeId || log.actor?.email || "System"}
                    </p>
                    {log.actor?.employeeId && (
                      <p className="text-[11px] text-slate-400 font-mono">{log.actor.employeeId}</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {log.action}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs font-semibold text-slate-700">
                    {log.entity}
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs text-slate-500">
                    {log.entityId || "—"}
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
