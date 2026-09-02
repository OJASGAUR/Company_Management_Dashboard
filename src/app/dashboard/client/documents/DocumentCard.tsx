"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteDocument } from "@/app/dashboard/tools/actions"
import { Card } from "@/components/ui/Card"
import { RemoveButton } from "@/components/ui/RemoveButton"

type FileItem = {
  id: string
  fileName: string
  fileUrl: string
  size: number
  createdAt: Date
}

export function DocumentCard({ file }: { file: FileItem }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleRemove = async () => {
    setDeleting(true)
    try {
      await deleteDocument(file.id)
      router.refresh()
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <Card hoverEffect className="group relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5">
      <RemoveButton onRemove={handleRemove} title="Remove document link" />

      <div className="flex items-center gap-4 pr-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 text-xl font-bold">
          📄
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{file.fileName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Uploaded on {new Date(file.createdAt).toLocaleDateString()} ·{" "}
            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "External Link"}
          </p>
        </div>
      </div>

      <a
        href={file.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
      >
        Open Document ↗
      </a>
    </Card>
  )
}
