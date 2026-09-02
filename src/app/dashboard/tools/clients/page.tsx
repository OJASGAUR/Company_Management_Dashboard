import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { Role } from "@prisma/client"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

import { ClientRow } from "./ClientRow"

export default async function ClientsManagementPage() {
  await requireRole([Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS])

  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
  const clientEmails = clients.map((client) => client.email)
  const users = clientEmails.length
    ? await prisma.user.findMany({
        where: { email: { in: clientEmails } },
        select: { email: true, isActive: true, role: true },
      })
    : []
  const statusByEmail = new Map(users.map((user) => [user.email, user]))

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Client Operations"
        title="Client Portal Management"
        description="Verify portal enablement status and manage client organization accounts."
        actions={
          <Link href="/dashboard/tools">
            <Button variant="outline" size="md">
              ← Back to Business & Finance
            </Button>
          </Link>
        }
      />

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            title="No Client Records Found"
            description="Create client records in the Finance & CRM section to manage portal accounts."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Client Name</TableHeaderCell>
                <TableHeaderCell>Company</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Portal Login</TableHeaderCell>
                <TableHeaderCell className="text-right">Account Status</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {clients.map((client) => {
                const user = statusByEmail.get(client.email)
                return <ClientRow key={client.id} client={client} user={user} />
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Guide Banner */}
      <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50/70 via-white to-cyan-50/70">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white font-bold">
            💡
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">How the Limited Client Portal Works</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Create a client record in CRM first, then use <strong>Enable client portal</strong> in Finance & CRM to generate the client&apos;s credentials. When the client signs in with their email, they are automatically routed to the limited client portal with isolated project, invoice, and document views.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
