import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { Role } from "@prisma/client"
import ToolsActions from "./ToolsActions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ExternalToolsPage() {
  const user = await requireRole([
    Role.SUPER_ADMIN,
    Role.DIRECTOR,
    Role.OPERATIONS_MANAGER,
    Role.ACCOUNTS,
  ])

  const [invoices, clients, domains, files] = await Promise.all([
    prisma.invoice.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    prisma.domain.findMany({ take: 8, orderBy: { expiryDate: "asc" } }),
    prisma.fileRecord.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
  ])

  const clientManagementRoles: Role[] = [
    Role.SUPER_ADMIN,
    Role.DIRECTOR,
    Role.OPERATIONS_MANAGER,
    Role.ACCOUNTS,
  ]
  const financeManagementRoles: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.ACCOUNTS]
  const canManageClients = clientManagementRoles.includes(user.role)
  const canManageFinance = financeManagementRoles.includes(user.role)

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Business & Finance"
        title="Finance, CRM & Digital Assets"
        description="Manage customer accounts, client invoices, domain infrastructure, and secure document records."
        actions={
          canManageClients ? (
            <Link href="/dashboard/tools/clients">
              <Button variant="primary" size="md" className="bg-cyan-600 hover:bg-cyan-700">
                Client Portal Management →
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Quick Action Cards */}
      {(canManageClients || canManageFinance) && <ToolsActions clients={clients} />}

      {/* 4 Multi-Data Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Invoices Panel */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Invoices & Billing</h2>
              <p className="text-xs text-slate-500">Recent customer billing statements</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {invoices.length} Records
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.length ? (
              invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-xs font-bold font-mono text-slate-900">
                      #{inv.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Due: {inv.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">₹{inv.amount.toLocaleString()}</p>
                    <StatusBadge status={inv.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No Invoices Issued" description="Create an invoice using the form above." />
            )}
          </div>
        </Card>

        {/* Clients / CRM Panel */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Client CRM Directory</h2>
              <p className="text-xs text-slate-500">Active client business contacts</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {clients.length} Accounts
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {clients.length ? (
              clients.slice(0, 8).map((client) => (
                <div key={client.id} className="flex items-center gap-3.5 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 text-sm">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{client.name}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {client.company} · {client.email}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No Clients in CRM" description="Add your first customer account above." />
            )}
          </div>
        </Card>

        {/* Domains Panel */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Domains & Web Assets</h2>
              <p className="text-xs text-slate-500">Infrastructure and certificate tracking</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {domains.length} Tracked
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {domains.length ? (
              domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-xs font-bold font-mono text-slate-900">{domain.url}</p>
                    <p className="text-[11px] text-slate-500">{domain.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">
                      Expires {domain.expiryDate.toLocaleDateString()}
                    </p>
                    <StatusBadge status={domain.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No Domains Tracked" description="No external domain entries found." />
            )}
          </div>
        </Card>

        {/* Shared Files Panel */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Secure Document Links</h2>
              <p className="text-xs text-slate-500">Client-facing files and agreements</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {files.length} Shared
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {files.length ? (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{file.fileName}</p>
                      <p className="text-[11px] text-slate-500">
                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "External Link"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    Open Link ↗
                  </a>
                </div>
              ))
            ) : (
              <EmptyState title="No Files Shared" description="Use the document share form to link files." />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
