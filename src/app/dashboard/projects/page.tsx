import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createProject } from "../actions"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const canCreateProject = ["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER"].includes(session.user.role)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
      </div>

      {canCreateProject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Project</h2>
          <form action={createProject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Project Name</label>
              <input name="name" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Client Name</label>
              <input name="clientName" className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" name="startDate" className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input type="date" name="endDate" className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input name="description" className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                project.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                project.status === "PLANNING" ? "bg-blue-100 text-blue-800" :
                project.status === "ON_HOLD" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {project.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
              {project.description || "No description provided."}
            </p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex items-center justify-between">
                <span>Client:</span>
                <span className="font-medium text-gray-900">{project.clientName || "Internal"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Timeline:</span>
                <span>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - 
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
              <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">Edit</button>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            No projects found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}
