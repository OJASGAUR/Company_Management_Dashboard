import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { assignTask } from "../../actions"

export default async function AssignTechnicalTaskPage() {
  await requireRole(permissions.assignTasks)

  const [employees, projects] = await Promise.all([
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: [Role.EMPLOYEE, Role.DEVELOPER, Role.DESIGNER, Role.TESTER] },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Technical Leadership</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Assign Technical Task</h1>
        <p className="mt-2 text-sm text-slate-500">
          Assign technical work to an employee or developer. The assignee receives an in-app TASK notification and, when enabled, an email automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <form action={assignTask} className="space-y-6">
          <div>
            <label htmlFor="userId" className="mb-2 block text-sm font-semibold text-slate-700">Assign To</label>
            <select id="userId" name="userId" required className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name || "Unnamed"} — {employee.role.replace(/_/g, " ")} {employee.email ? `(${employee.email})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-700">Task Title</label>
            <input id="title" name="title" required maxLength={200} placeholder="Fix authentication bug" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label htmlFor="projectId" className="mb-2 block text-sm font-semibold text-slate-700">Project</label>
            <select id="projectId" name="projectId" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="priority" className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
              <select id="priority" name="priority" defaultValue="HIGH" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="mb-2 block text-sm font-semibold text-slate-700">Deadline</label>
              <input id="deadline" type="date" name="deadline" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea id="description" name="description" rows={5} maxLength={5000} placeholder="Please fix the authentication bug by Friday." className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-indigo-950">Automatic notification</p>
              <p className="text-xs text-indigo-700">The assignee will receive an in-app notification and task email when enabled.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">TASK</span>
          </div>

          <button type="submit" disabled={employees.length === 0} className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            Assign Technical Task
          </button>
        </form>
      </div>
    </div>
  )
}
