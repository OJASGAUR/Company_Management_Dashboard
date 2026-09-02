"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteTask } from "../actions"
import { TableRow, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { RemoveButton } from "@/components/ui/RemoveButton"

type Task = {
  id: string
  title: string
  status: string
  deadline: Date | null
  project: { name: string } | null
  user: { name: string | null }
}

export function DeliverableRow({ task }: { task: Task }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleRemove = async () => {
    setDeleting(true)
    try {
      await deleteTask(task.id)
      router.refresh()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <TableRow className="group relative">
      <TableCell className="relative">
        <RemoveButton onRemove={handleRemove} title="Remove deliverable" className="left-2 top-3 right-auto" />
        <div className="pl-6">
          <p className="font-bold text-slate-900 leading-snug">{task.title}</p>
          <p className="text-xs text-slate-500">{task.project?.name || "General Operational"}</p>
        </div>
      </TableCell>
      <TableCell className="text-xs font-semibold text-slate-700">
        {task.user.name || "Unnamed"}
      </TableCell>
      <TableCell>
        <StatusBadge status={task.status} size="sm" />
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-slate-600">
        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
      </TableCell>
    </TableRow>
  )
}
