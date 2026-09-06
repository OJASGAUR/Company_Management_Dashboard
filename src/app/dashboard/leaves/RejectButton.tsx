"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateLeaveStatus } from "../actions"

export function RejectButton({ leaveId }: { leaveId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (busy) return
        setBusy(true)
        const formData = new FormData()
        formData.set("leaveId", leaveId)
        formData.set("status", "REJECTED")
        try {
          await updateLeaveStatus(formData)
          router.refresh()
        } catch (error) {
          console.error(error)
          setBusy(false)
        }
      }}
      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Rejecting…" : "Reject"}
    </button>
  )
}
