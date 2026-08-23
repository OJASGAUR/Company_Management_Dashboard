import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ToolsActions from "./ToolsActions"

export default async function ExternalToolsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [invoices, clients, domains, files] = await Promise.all([
    prisma.invoice.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    prisma.domain.findMany({ take: 8, orderBy: { expiryDate: "asc" } }),
    prisma.fileRecord.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
  ])

  const canManageClients = ["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER", "ACCOUNTS"].includes(session.user.role)
  const canManageFinance = ["SUPER_ADMIN", "DIRECTOR", "ACCOUNTS"].includes(session.user.role)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Business Operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Finance & External Tools</h1><p className="mt-2 text-sm text-slate-500">CRM, invoices, domains and document-storage foundations.</p></div>

      {(canManageClients || canManageFinance) && <ToolsActions clients={clients} />}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Panel title="Accounts & Invoices" action={canManageFinance ? "Create above" : undefined}>
          {invoices.length ? <ul className="divide-y divide-slate-100">{invoices.map(inv => <li key={inv.id} className="flex items-center justify-between p-4"><div><p className="font-medium text-slate-900">Invoice #{inv.id.slice(-5).toUpperCase()}</p><p className="text-xs text-slate-500">Due: {inv.dueDate.toLocaleDateString()}</p></div><div className="text-right"><p className="font-semibold text-slate-900">₹{inv.amount.toLocaleString()}</p><span className={`text-[10px] rounded-full px-2 py-0.5 font-bold ${inv.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{inv.status}</span></div></li>)}</ul> : <Empty text="No invoices found." />}
        </Panel>

        <Panel title="Client Management / CRM" action={canManageClients ? "Create above" : undefined}>
          {clients.length ? <ul className="divide-y divide-slate-100">{clients.slice(0, 8).map(client => <li key={client.id} className="flex items-center gap-4 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{client.name.charAt(0).toUpperCase()}</div><div><p className="font-medium text-slate-900">{client.name}</p><p className="text-xs text-slate-500">{client.company} · {client.email}</p></div></li>)}</ul> : <Empty text="No clients found in CRM." />}
        </Panel>

        <Panel title="Domains & Hosting"><ul className="divide-y divide-slate-100">{domains.length ? domains.map(domain => <li key={domain.id} className="flex items-center justify-between p-4"><div><p className="font-medium text-slate-900">{domain.url}</p><p className="text-xs text-slate-500">{domain.provider}</p></div><div className="text-right"><p className="text-xs text-slate-500">Expires {domain.expiryDate.toLocaleDateString()}</p><span className="text-[10px] font-bold text-slate-600">{domain.status}</span></div></li>) : <li><Empty text="No domains being tracked." /></li>}</ul></Panel>

        <Panel title="File Storage"><ul className="divide-y divide-slate-100">{files.length ? files.map(file => <li key={file.id} className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><span className="text-xl">📄</span><div><p className="font-medium text-slate-900">{file.fileName}</p><p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p></div></div><a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Open</a></li>) : <li><Empty text="No files uploaded yet." /></li>}</ul></Panel>
      </div>
    </div>
  )
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) { return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4"><h2 className="font-semibold text-slate-900">{title}</h2>{action && <span className="text-xs font-medium text-slate-400">{action}</span>}</div>{children}</section> }
function Empty({ text }: { text: string }) { return <div className="p-8 text-center text-sm text-slate-500">{text}</div> }
