import React from "react"

interface PageHeaderProps {
  category?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  category,
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div>
        {category && (
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {category}
          </p>
        )}
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  )
}
