import React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
}

export function Card({ children, className = "", hoverEffect = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 ${
        hoverEffect ? "hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-5 flex flex-col space-y-1.5 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-bold tracking-tight text-slate-900 ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs text-slate-500 ${className}`}>{children}</p>
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-6 flex items-center border-t border-slate-100 pt-4 ${className}`}>{children}</div>
}
