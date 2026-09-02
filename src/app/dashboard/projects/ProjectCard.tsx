"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteProject } from "../actions"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { RemoveButton } from "@/components/ui/RemoveButton"

type Project = {
  id: string
  name: string
  description: string | null
  clientName: string | null
  status: string
  startDate: Date | null
  endDate: Date | null
  tasks: { id: string; status: string }[]
}

export function ProjectCard({ project, canDelete }: { project: Project; canDelete: boolean }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const completedCount = project.tasks.filter((t) => t.status === "COMPLETED").length
  const totalTasks = project.tasks.length
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const handleRemove = async () => {
    setDeleting(true)
    try {
      await deleteProject(project.id)
      router.refresh()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <Card hoverEffect className="group relative flex flex-col justify-between">
      {canDelete && <RemoveButton onRemove={handleRemove} title="Remove project" />}

      <div>
        <div className="flex items-start justify-between gap-3 mb-3 pr-6">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900" title={project.name}>
            {project.name}
          </h3>
          <StatusBadge status={project.status} size="sm" />
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 mb-5">
          {project.description || "No project description provided."}
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Client / Account</span>
          <span className="font-semibold text-slate-800">{project.clientName || "Internal"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Timeline</span>
          <span className="font-medium text-slate-600">
            {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} –{" "}
            {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
          </span>
        </div>

        {totalTasks > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Progress ({completedCount}/{totalTasks} tasks)</span>
              <span className="font-bold text-indigo-600">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
