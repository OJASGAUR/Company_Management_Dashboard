import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Link 
          href="/admin/users/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Onboard New Joiner
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Name / Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Department</th>
              <th className="p-4 font-semibold">Joined Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{user.name || "N/A"}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{user.department || "-"}</td>
                <td className="p-4 text-sm text-gray-600">
                  {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "-"}
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">Deactivate</button>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
