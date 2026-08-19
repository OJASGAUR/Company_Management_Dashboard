import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { assignTask, createEmployee } from "../actions"

export default async function OperationsDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  // Basic RBAC check
  if (!["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER"].includes(session.user.role)) {
    redirect("/unauthorized")
  }

  const [employees, projects, activeTasks] = await Promise.all([
    prisma.user.findMany({
      where: { role: { notIn: ["SUPER_ADMIN", "CLIENT"] } },
      select: { id: true, name: true, role: true, department: true }
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true }
    }),
    prisma.task.findMany({
      where: { status: { not: "COMPLETED" } },
      include: { user: true, project: true },
      orderBy: { deadline: 'asc' }
    })
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Assign New Task Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 self-start">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Assign New Task</h2>
          <form action={assignTask} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Task Title</label>
              <input name="title" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Project</label>
              <select name="projectId" className="w-full rounded-md border border-gray-300 p-2 text-black">
                <option value="">No Project (General)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <select name="userId" required className="w-full rounded-md border border-gray-300 p-2 text-black">
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select name="priority" className="w-full rounded-md border border-gray-300 p-2 text-black">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Deadline</label>
                <input type="date" name="deadline" className="w-full rounded-md border border-gray-300 p-2 text-black" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" className="w-full rounded-md border border-gray-300 p-2 text-black h-20 resize-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
              Assign Task
            </button>
          </form>
        </div>

        {/* Active Tasks Monitoring */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Tasks Monitoring</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {activeTasks.length} Active
            </span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Task</th>
                <th className="p-4 font-semibold">Assigned To</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.project?.name || "General"}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-900">{task.user.name}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                      task.status === "IN_REVIEW" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-600">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
              {activeTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No active tasks currently.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Create Employee Form (Super Admin & HR) */}
        {["SUPER_ADMIN", "HR"].includes(session.user.role) && (
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Employee</h2>
            <form action={createEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input name="name" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input name="email" type="email" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Employee ID</label>
                <input name="employeeId" required className="w-full rounded-md border border-gray-300 p-2 text-black" placeholder="e.g. EMP2001" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select name="role" required className="w-full rounded-md border border-gray-300 p-2 text-black">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="TESTER">QA Tester</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="OPERATIONS_MANAGER">Operations Manager</option>
                  <option value="HR">HR Manager</option>
                  <option value="ACCOUNTS">Finance Accounts</option>
                  <option value="DIRECTOR">Director</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Department (Optional)</label>
                <input name="department" className="w-full rounded-md border border-gray-300 p-2 text-black" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Initial Password (Optional)</label>
                <input name="password" type="password" className="w-full rounded-md border border-gray-300 p-2 text-black" placeholder="Defaults to password123" />
              </div>
              <div className="lg:col-span-3 flex justify-end">
                <button type="submit" className="bg-green-600 text-white font-medium py-2 px-8 rounded-md hover:bg-green-700 transition-colors">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
