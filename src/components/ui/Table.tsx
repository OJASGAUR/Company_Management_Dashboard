import React from "react"

export function TableContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function Table({ children, className = "", ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full text-left border-collapse ${className}`} {...props}>{children}</table>
}

export function TableHead({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`} {...props}>{children}</thead>
}

export function TableBody({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>{children}</tbody>
}

export function TableRow({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`transition-colors hover:bg-slate-50/70 ${className}`} {...props}>{children}</tr>
}

export function TableHeaderCell({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 ${className}`} {...props}>{children}</th>
}

export function TableCell({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`p-4 text-sm text-slate-700 ${className}`} {...props}>{children}</td>
}
