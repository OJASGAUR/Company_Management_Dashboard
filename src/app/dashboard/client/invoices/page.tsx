import Link from "next/link"
import { getClientPortalData } from "@/lib/client-portal"
import { PageHeader } from "@/components/ui/PageHeader"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { StatCard } from "@/components/ui/StatCard"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ClientInvoicesPage() {
  const { client, invoices } = await getClientPortalData()
  if (!client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-amber-900 text-sm">
          This client account is not linked to a client company profile yet.
        </Card>
      </div>
    )
  }

  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const outstanding = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Invoices & Billing Statements"
        description="Review billing statements, balances, and due dates. Official receipts are issued upon payment reconciliation."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Billed"
          value={`₹${total.toLocaleString()}`}
          subtitle="Cumulative invoices issued"
          icon="💳"
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${outstanding.toLocaleString()}`}
          subtitle={outstanding > 0 ? "Pending payment" : "All statements settled"}
          icon="⏳"
        />
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <Card>
          <EmptyState
            icon="💳"
            title="No Invoices Issued"
            description="There are currently no billing statements associated with your company profile."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Invoice Reference</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Due Date</TableHeaderCell>
                <TableHeaderCell>Payment Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Action</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-bold text-slate-900 text-xs">
                    #{invoice.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-extrabold text-slate-900">
                    ₹{invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/client/invoices/${invoice.id}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-cyan-300 hover:text-cyan-700 transition-all"
                    >
                      View Details →
                    </Link>
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
