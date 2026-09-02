import React from "react"
import { Card } from "./Card"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card hoverEffect className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
              <span className={trend.isPositive ? "text-emerald-600" : "text-rose-600"}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl">
            {icon}
          </div>
        )}
        {badge && <div>{badge}</div>}
      </div>
    </Card>
  )
}
