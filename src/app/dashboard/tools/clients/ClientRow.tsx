"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteClient } from "../actions"
import { TableRow, TableCell } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { RemoveButton } from "@/components/ui/RemoveButton"

type Client = {
  id: string
  name: string
  company: string
  email: string
}

type User = {
  email: string | null
  isActive: boolean
  role: string
} | undefined

export function ClientRow({ client, user }: { client: Client; user: User }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const isEnabled = user?.role === "CLIENT"

  const handleRemove = async () => {
    setDeleting(true)
    try {
      await deleteClient(client.id)
      router.refresh()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <TableRow className="group relative">
      <TableCell className="font-bold text-slate-900 relative">
        <RemoveButton onRemove={handleRemove} title="Remove client" className="left-2 top-3 right-auto" />
        <span className="pl-6">{client.name}</span>
      </TableCell>
      <TableCell className="font-medium text-slate-700">{client.company}</TableCell>
      <TableCell className="font-mono text-xs text-slate-500">{client.email}</TableCell>
      <TableCell>
        <Badge variant={isEnabled ? "info" : "default"} size="sm">
          {isEnabled ? "ENABLED" : "NOT PROVISIONED"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {user ? (
          <Badge variant={user.isActive ? "success" : "danger"} size="sm">
            {user.isActive ? "Active" : "Disabled"}
          </Badge>
        ) : (
          <span className="text-xs text-slate-400 font-medium">No Account</span>
        )}
      </TableCell>
    </TableRow>
  )
}
