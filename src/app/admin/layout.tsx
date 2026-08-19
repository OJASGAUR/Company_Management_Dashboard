import Link from "next/link"
import { ReactNode } from "react"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-blue-400">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</p>
          </div>
          <Link href="/admin/users" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
            User Management
          </Link>
          <Link href="/admin/roles" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-500 cursor-not-allowed">
            Menu Permissions (WIP)
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{session.user.role}</p>
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
