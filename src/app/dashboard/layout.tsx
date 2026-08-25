import Link from "next/link"
import { ReactNode } from "react"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/")
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false }
  })

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-blue-400">Company Portal</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/notifications" className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/attendance" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Attendance
          </Link>
          <Link href="/dashboard/leaves" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Leaves
          </Link>
          <Link href="/dashboard/chat" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Messages (Chat)
          </Link>
          
          {session.user.role !== 'CLIENT' && (
            <Link href="/dashboard/calendar" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Calendar
            </Link>
          )}

          {/* Only IT/HR/Admin should manage assets */}
          {["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER"].includes(session.user.role) && (
            <Link href="/dashboard/assets" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Assets
            </Link>
          )}

          {/* Only Finance and Admins see this */}
          {["SUPER_ADMIN", "DIRECTOR", "ACCOUNTS"].includes(session.user.role) && (
            <Link href="/dashboard/tools" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Finance & Tools
            </Link>
          )}

          {/* Projects are for dev teams and management */}
          {["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER", "TEAM_LEAD", "DEVELOPER", "DESIGNER", "TESTER", "CLIENT"].includes(session.user.role) && (
            <Link href="/dashboard/projects" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Projects
            </Link>
          )}

          {/* Everyone except maybe Client needs Tasks */}
          {session.user.role !== 'CLIENT' && (
            <Link href="/dashboard/tasks" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Tasks (Kanban)
            </Link>
          )}
          
          {["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER"].includes(session.user.role) && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</p>
              </div>
              
              {["SUPER_ADMIN", "DIRECTOR", "OPERATIONS_MANAGER"].includes(session.user.role) && (
                <Link href="/dashboard/operations" className="block px-4 py-2 rounded-md bg-indigo-900/30 text-indigo-300 hover:bg-slate-800 transition-colors">
                  Ops Dashboard
                </Link>
              )}
              {["SUPER_ADMIN", "DIRECTOR", "HR"].includes(session.user.role) && (
                <Link href="/admin" className="block px-4 py-2 mt-2 rounded-md bg-blue-900/30 text-blue-300 hover:bg-slate-800 transition-colors">
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{session.user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}>
            <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
