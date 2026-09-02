"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteAsset } from "../actions"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { RemoveButton } from "@/components/ui/RemoveButton"

type Asset = {
  id: string
  name: string
  type: string
  status: string
}

export function AssetCard({ asset }: { asset: Asset }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleRemove = async () => {
    setDeleting(true)
    try {
      await deleteAsset(asset.id)
      router.refresh()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <Card hoverEffect className="group relative flex flex-col justify-between">
      <RemoveButton onRemove={handleRemove} title="Remove asset" />

      <div>
        <div className="flex items-start justify-between mb-4 pr-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
            {asset.type === "LAPTOP" ? "💻" : asset.type === "MONITOR" ? "🖥️" : "📱"}
          </div>
          <StatusBadge status={asset.status} size="sm" />
        </div>

        <h3 className="font-bold text-base text-slate-900 mb-1">{asset.name}</h3>
        <p className="text-xs text-slate-500 font-medium">Category: {asset.type}</p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">ID: #{asset.id.slice(-6).toUpperCase()}</span>
        <span className="text-xs text-slate-400">Hover cross to remove</span>
      </div>
    </Card>
  )
}
