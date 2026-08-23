import Link from "next/link"
import { ReactNode } from "react"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR] as const

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!ADMIN_ROLES.includes(session.user.role as typeof ADMIN_ROLES[number])) redirect("/dashboard")

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-72 flex-col bg-slate-950 text-white">
        <div className="border-b border-slate-800 p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Administration</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Admin Panel</h2></div>
        <nav className="flex-1 space-y-1 px-4 py-5">
          <Link href="/dashboard" className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">← Back to Dashboard</Link>
          <p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">People</p>
          <Link href="/admin/users" className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">User Management</Link>
          {session.user.role === Role.SUPER_ADMIN && <><p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Security</p><Link href="/admin/audit" className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Audit Log</Link></>}
        </nav>
        <div className="border-t border-slate-800 p-4"><div className="mb-4 flex items-center gap-3 px-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">{session.user.email?.charAt(0).toUpperCase() || "U"}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{session.user.name || "User"}</p><p className="truncate text-xs text-slate-500">{session.user.role.replace(/_/g, " ")}</p></div></div><form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }}><button type="submit" className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-slate-800">Sign Out</button></form></div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
