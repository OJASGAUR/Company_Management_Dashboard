"use client"

import { createUser } from "../../actions"
import Link from "next/link"
import { useState } from "react"
import { Role } from "@prisma/client"

export default function NewUserPage() {
  const [error, setError] = useState<string | null>(null)
  
  // Available roles from Prisma schema
  const roles: Role[] = [
    "EMPLOYEE", "HR", "OPERATIONS_MANAGER", 
    "TEAM_LEAD", "DEVELOPER", "DESIGNER", 
    "TESTER", "ACCOUNTS", "DIRECTOR", "SUPER_ADMIN"
  ]

  const handleSubmit = async (formData: FormData) => {
    try {
      await createUser(formData)
    } catch (err: any) {
      setError(err.message || "Failed to create user")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">New Joiner Registration</h1>
        <Link href="/admin/users" className="text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input name="name" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <input type="password" name="password" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" className="w-full rounded-md border border-gray-300 px-3 py-2 text-black">
                {roles.map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input name="department" className="w-full rounded-md border border-gray-300 px-3 py-2 text-black" placeholder="e.g. Engineering" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Designation</label>
              <input name="designation" className="w-full rounded-md border border-gray-300 px-3 py-2 text-black" placeholder="e.g. Senior Frontend Engineer" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Joining Date</label>
              <input type="date" name="joiningDate" className="w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
              Create Employee Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
