import { prisma } from "@/lib/prisma"
import { createProject } from "../actions"
import { requireRole } from "@/lib/auth/require-role"
import { Role } from "@prisma/client"
import type { ReactNode } from "react"

const PROJECT_CREATE_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.DIRECTOR,
  Role.OPERATIONS_MANAGER,
]

export default async function ProjectsPage() {
  const user = await requireRole([
    Role.SUPER_ADMIN,
    Role.DIRECTOR,
    Role.OPERATIONS_MANAGER,
    Role.TEAM_LEAD,
    Role.DEVELOPER,
    Role.DESIGNER,
    Role.TESTER,
  ])

  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } })
  const canCreateProject = PROJECT_CREATE_ROLES.includes(user.role)

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Delivery</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Projects</h1><p className="mt-2 text-sm text-slate-500">Plan delivery, milestones and work across active company projects.</p></div>
      {canCreateProject && <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-5 text-xl font-semibold text-slate-900">Create New Project</h2><form action={createProject} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Project Name"><input name="name" required className="field" /></Field><Field label="Client Name"><input name="clientName" className="field" /></Field><Field label="Start Date"><input type="date" name="startDate" className="field" /></Field><Field label="End Date"><input type="date" name="endDate" className="field" /></Field><Field label="Description" wide><input name="description" className="field" /></Field><div className="flex items-end lg:col-span-1"><button className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Create Project</button></div></form></div>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{projects.map(project => <div key={project.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-start justify-between gap-3"><h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{project.name}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{project.status.replace(/_/g, " ")}</span></div><p className="mb-5 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{project.description || "No description provided."}</p><div className="space-y-2 border-t border-slate-100 pt-4 text-sm"><div className="flex justify-between"><span className="text-slate-400">Client</span><span className="font-medium text-slate-800">{project.clientName || "Internal"}</span></div><div className="flex justify-between"><span className="text-slate-400">Timeline</span><span className="text-slate-600">{project.startDate ? project.startDate.toLocaleDateString() : "TBD"} – {project.endDate ? project.endDate.toLocaleDateString() : "TBD"}</span></div></div></div>)}{projects.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No projects found.</div>}</div>
    </div>
  )
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={`space-y-1.5 ${wide ? "md:col-span-3" : ""}`}><span className="block text-sm font-medium text-slate-700">{label}</span>{children}</label> }
