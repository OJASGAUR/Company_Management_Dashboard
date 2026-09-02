import React from "react"

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "neutral"
  size?: "sm" | "md"
  dot?: boolean
  children: React.ReactNode
  className?: string
}

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  }

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-800 border-amber-200/60",
    danger: "bg-rose-50 text-rose-700 border-rose-200/60",
    info: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
    neutral: "bg-slate-900 text-slate-100 border-slate-800",
  }

  const dotColors = {
    default: "bg-slate-400",
    primary: "bg-indigo-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-cyan-500",
    neutral: "bg-slate-300",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
