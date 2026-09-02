import { ReactNode } from "react"
import { signOut } from "@/auth"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/require-auth"
import { Role } from "@prisma/client"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { ClientSidebar } from "@/components/layout/ClientSidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth().catch(() => null)
  if (!user) redirect("/")

  async function handleSignOut() {
    "use server"
    await signOut({ redirectTo: "/" })
  }

  if (user.role === Role.CLIENT) {
    return (
      <div className="flex h-screen overflow-hidden flex-col lg:flex-row bg-slate-50 text-slate-900">
        <ClientSidebar
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
          }}
          signOutAction={handleSignOut}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col lg:flex-row bg-slate-50 text-slate-900">
      <AppSidebar
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

