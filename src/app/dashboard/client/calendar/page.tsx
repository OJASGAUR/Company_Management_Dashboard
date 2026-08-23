import { getClientPortalData } from "@/lib/client-portal"
import { prisma } from "@/lib/prisma"

export default async function ClientCalendarPage() {
  const { client } = await getClientPortalData()
  if (!client) return <div className="rounded-2xl bg-amber-50 p-8 text-amber-900">This client account is not linked to a client record yet.</div>
  const projects = await prisma.project.findMany({ where: { clientName: client.company, endDate: { not: null } }, orderBy: { endDate: "asc" }, take: 50 })
  return <div className="mx-auto max-w-6xl space-y-7"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Client Portal</p><h1 className="mt-1 text-3xl font-bold">Delivery Calendar</h1><p className="mt-2 text-sm text-slate-500">Only milestones and delivery dates associated with your projects are shown here.</p></div><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Project milestones</h2><div className="mt-5 space-y-3">{projects.map(project => <div key={project.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.status.replace(/_/g, " ")}</p></div><p className="text-sm font-semibold text-indigo-700">{project.endDate?.toLocaleDateString()}</p></div>)}{projects.length===0 && <Empty text="No project milestones available." />}</div></section></div>
}
function Empty({ text }: { text: string }) { return <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{text}</div> }
