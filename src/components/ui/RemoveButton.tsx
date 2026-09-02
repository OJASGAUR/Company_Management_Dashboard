"use client"

import { useState } from "react"

interface RemoveButtonProps {
  onRemove: () => Promise<void> | void
  title?: string
  className?: string
}

export function RemoveButton({ onRemove, title = "Remove", className = "" }: RemoveButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await onRemove()
    } catch (err) {
      console.error("Failed to remove item", err)
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={title}
      aria-label={title}
      className={`absolute right-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 hover:bg-rose-600 hover:text-white hover:scale-110 active:scale-95 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  )
}
