"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteLeave } from "../actions"
import { TableRow, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { RemoveButton } from "@/components/ui/RemoveButton"

type Leave = {
  id: string
  type: string
  startDate: Date
  endDate: Date
  reason: string
  status: string
}

export function LeaveRow({ leave }: { leave: Leave }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleRemove = async () => {
    setDeleting(true)
    try {
      await deleteLeave(leave.id)
      router.refresh()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <TableRow className="group relative">
      <TableCell className="font-semibold text-slate-800 relative">
        <RemoveButton onRemove={handleRemove} title="Cancel / remove leave request" className="left-2 top-3 right-auto" />
        <span className="pl-6">{leave.type.replace(/_/g, " ")}</span>
      </TableCell>
      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
        {new Date(leave.startDate).toLocaleDateString()} → <br />
        {new Date(leave.endDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="max-w-xs truncate text-xs text-slate-600" title={leave.reason}>
        {leave.reason}
      </TableCell>
      <TableCell className="text-right">
        <StatusBadge status={leave.status} size="sm" />
      </TableCell>
    </TableRow>
  )
}
