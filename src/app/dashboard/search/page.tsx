import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/FormField"

type SearchItem = {
  id: string
  [key: string]: unknown
}

type SearchSection = {
  key: string
  label: string
  items: SearchItem[]
  show: boolean
  render: (item: SearchItem) => string
}

const asSearchItems = <T extends { id: string }>(items: T[]): SearchItem[] => items

export default async function GlobalSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const user = await requireAuth()
  const params = await searchParams
  const q = (params.q || "").trim()
  const type = params.type || "all"

  const [users, clients, projects, tasks, invoices, files, messages] = q ? await Promise.all([
    user.role === "SUPER_ADMIN" || user.role === "HR"
      ? prisma.user.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { employeeId: { contains: q, mode: "insensitive" } }] }, take: 20, select: { id: true, name: true, email: true, employeeId: true, role: true } })
      : Promise.resolve([]),
    prisma.client.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }, take: 20 }),
    prisma.project.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { clientName: { contains: q, mode: "insensitive" } }] }, take: 20 }),
    user.role === "CLIENT"
      ? Promise.resolve([])
      : prisma.task.findMany({ where: { AND: [{ userId: user.id }, { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }] }, take: 20 }),
    prisma.invoice.findMany({ where: { client: user.role === "CLIENT" ? { email: user.email || undefined } : undefined, OR: [{ id: { contains: q, mode: "insensitive" } }, { status: { contains: q, mode: "insensitive" } }] }, take: 20 }),
    prisma.fileRecord.findMany({ where: { OR: [{ fileName: { contains: q, mode: "insensitive" } }, { fileUrl: { contains: q, mode: "insensitive" } }] }, take: 20 }),
    prisma.message.findMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }], content: { contains: q, mode: "insensitive" } }, take: 20, orderBy: { timestamp: "desc" } }),
  ]) : [[], [], [], [], [], [], []]

  const sections: SearchSection[] = [
    { key: "employees", label: "Employees", items: asSearchItems(users), show: type === "all" || type === "employees", render: (x) => `${String(x.name ?? "Unnamed")} · ${String(x.employeeId ?? x.email ?? "")}` },
    { key: "clients", label: "Clients", items: asSearchItems(clients), show: type === "all" || type === "clients", render: (x) => `${String(x.company ?? "")} · ${String(x.name ?? "")}` },
    { key: "projects", label: "Projects", items: asSearchItems(projects), show: type === "all" || type === "projects", render: (x) => `${String(x.name ?? "")} · ${String(x.clientName ?? "No client")}` },
    { key: "tasks", label: "Tasks", items: asSearchItems(tasks), show: type === "all" || type === "tasks", render: (x) => `${String(x.title ?? "")} · ${String(x.status ?? "")}` },
    { key: "invoices", label: "Invoices", items: asSearchItems(invoices), show: type === "all" || type === "invoices", render: (x) => `#${String(x.id).slice(-8).toUpperCase()} · ${String(x.status ?? "")}` },
    { key: "documents", label: "Documents", items: asSearchItems(files), show: type === "all" || type === "documents", render: (x) => `${String(x.fileName ?? "")} · ${(Number(x.size ?? 0) / 1024).toFixed(1)} KB` },
    { key: "messages", label: "Messages", items: asSearchItems(messages), show: type === "all" || type === "messages", render: (x) => String(x.content ?? "") },
  ]

  return <div className="mx-auto max-w-7xl space-y-6 font-sans">
    <PageHeader category="Workspace" title="Search & Filters" description="Find employees, clients, projects, tasks, invoices, messages, and documents from one place." />
    <Card><CardContent className="pt-6"><form className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]"><Input name="q" defaultValue={q} placeholder="Search by name, company, task, invoice, document..." /><select name="type" defaultValue={type} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">All modules</option><option value="employees">Employees</option><option value="clients">Clients</option><option value="projects">Projects</option><option value="tasks">Tasks</option><option value="invoices">Invoices</option><option value="messages">Messages</option><option value="documents">Documents</option></select><button className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white">Search</button></form></CardContent></Card>
    {!q ? <Card><CardHeader><CardTitle>Enter a search term</CardTitle></CardHeader></Card> : <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{sections.filter((s) => s.show).map((section) => <Card key={section.key}><CardHeader><CardTitle>{section.label} <span className="ml-2 text-xs font-semibold text-slate-400">{section.items.length}</span></CardTitle></CardHeader><CardContent>{section.items.length ? <div className="space-y-2">{section.items.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">{section.render(item)}</div>)}</div> : <p className="text-sm text-slate-400">No matches.</p>}</CardContent></Card>)}</div>}
  </div>
}
