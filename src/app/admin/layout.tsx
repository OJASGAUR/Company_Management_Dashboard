import { ReactNode } from "react"
import { signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { requireAuth } from "@/lib/auth/require-auth"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR] as const

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth().catch(() => null)
  if (!user) redirect("/dashboard")
  if (!ADMIN_ROLES.includes(user.role as typeof ADMIN_ROLES[number])) redirect("/dashboard")

  async function handleSignOut() {
    "use server"
    await signOut({ redirectTo: "/" })
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 text-slate-900">
      <AdminSidebar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        signOutAction={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  )
}
