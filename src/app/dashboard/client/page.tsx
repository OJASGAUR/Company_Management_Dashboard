import Link from "next/link"
import { getClientPortalData } from "@/lib/client-portal"

export default async function ClientHomePage() {
  const data = await getClientPortalData()

  if (!data.client) {
    return <EmptyClientLink email={data.user.email} />
  }

  const openTasks = data.tasks.filter(task => !["COMPLETED", "CANCELLED"].includes(task.status)).length
  const overdueInvoices = data.invoices.filter(invoice => invoice.status === "OVERDUE").length
  const upcoming = data.projects.filter(project => project.endDate && project.endDate >= new Date()).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Client Portal</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Welcome, {data.client.name}</h1><p className="mt-2 text-sm text-slate-500">{data.client.company} · Project delivery, documents, invoices and communication.</p></div><Link href="/dashboard/client/messages" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Contact your team</Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Active projects" value={data.projects.filter(p => ["ACTIVE", "IN_PROGRESS"].includes(p.status)).length} /><Metric label="Open tasks" value={openTasks} /><Metric label="Invoices" value={data.invoices.length} /><Metric label="Overdue invoices" value={overdueInvoices} /></div>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold">Your projects</h2><p className="text-xs text-slate-500">Current delivery status and deadlines</p></div><Link href="/dashboard/client/projects" className="text-sm font-semibold text-indigo-600">View all →</Link></div><div className="divide-y divide-slate-100">{data.projects.slice(0, 5).map(project => <div key={project.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{project.name}</p><p className="mt-1 text-sm text-slate-500">{project.description || "No project description yet."}</p></div><div className="text-left sm:text-right"><Status value={project.status} /><p className="mt-2 text-xs text-slate-400">Due {project.endDate ? project.endDate.toLocaleDateString() : "TBD"}</p></div></div>)}{data.projects.length === 0 && <Empty text="No projects are linked to this account yet." />}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Upcoming deadlines</h2><div className="mt-4 space-y-3">{upcoming.map(project => <div key={project.id} className="rounded-xl bg-slate-50 p-4"><p className="font-medium text-slate-900">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.endDate?.toLocaleDateString()}</p></div>)}{upcoming.length === 0 && <Empty text="No upcoming project deadlines." />}</div></section>
      </div>
      <div className="grid gap-6 md:grid-cols-3"><Quick href="/dashboard/client/tasks" title="Tasks" text={`${openTasks} items require attention.`} /><Quick href="/dashboard/client/invoices" title="Invoices" text="Review balances and due dates." /><Quick href="/dashboard/client/documents" title="Documents" text={`${data.files.length} shared documents available.`} /></div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div> }
function Status({ value }: { value: string }) { return <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{value.replace(/_/g, " ")}</span> }
function Quick({ href, title, text }: { href: string; title: string; text: string }) { return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"><p className="font-semibold text-slate-900">{title}</p><p className="mt-2 text-sm text-slate-500">{text}</p><span className="mt-4 inline-block text-sm font-semibold text-indigo-600">Open →</span></Link> }
function Empty({ text }: { text: string }) { return <div className="p-8 text-center text-sm text-slate-500">{text}</div> }
function EmptyClientLink({ email }: { email: string | null }) { return <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-8"><h1 className="text-2xl font-bold text-amber-950">Client account needs linking</h1><p className="mt-2 text-sm leading-6 text-amber-800">The signed-in account {email || ""} does not yet match a client record. Ask an administrator to create or link the client record before using the portal.</p></div> }
