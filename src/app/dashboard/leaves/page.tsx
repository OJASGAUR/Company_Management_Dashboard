import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { applyLeave, updateLeaveStatus } from "../actions"
import { redirect } from "next/navigation"

export default async function LeavesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const leaves = await prisma.leave.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: 'desc' }
  })

  // Fetch pending leaves if Admin or HR
  const isAdminOrHR = ["SUPER_ADMIN", "HR"].includes(session.user.role)
  const pendingLeaves = isAdminOrHR ? await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { startDate: 'asc' }
  }) : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>

      {isAdminOrHR && pendingLeaves.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-yellow-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-yellow-900">Pending Approvals</h3>
            <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
              {pendingLeaves.length} Action Required
            </span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingLeaves.map(leave => (
                <tr key={leave.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-4 font-medium text-gray-900">{leave.user.name}</td>
                  <td className="p-4 text-gray-600">{leave.type.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {new Date(leave.startDate).toLocaleDateString()} - <br/>
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                  <td className="p-4 text-right">
                    <form action={updateLeaveStatus} className="inline-flex gap-2">
                      <input type="hidden" name="leaveId" value={leave.id} />
                      <button type="submit" name="status" value="APPROVED" className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold py-1.5 px-3 rounded-md transition-colors">
                        Approve
                      </button>
                      <button type="submit" name="status" value="REJECTED" className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-1.5 px-3 rounded-md transition-colors">
                        Reject
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Apply Leave Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for Leave</h2>
          <form action={applyLeave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Leave Type</label>
              <select name="type" required className="w-full rounded-md border border-gray-300 p-2 text-black">
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="PAID">Paid Leave</option>
                <option value="LOSS_OF_PAY">Loss of Pay</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" name="startDate" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input type="date" name="endDate" required className="w-full rounded-md border border-gray-300 p-2 text-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <textarea name="reason" required className="w-full rounded-md border border-gray-300 p-2 text-black h-24 resize-none" placeholder="Reason for leave..."></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Submit Application
            </button>
          </form>
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Leave Applications</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map(leave => (
                <tr key={leave.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-4 font-medium text-gray-900">{leave.type.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {new Date(leave.startDate).toLocaleDateString()} - <br/>
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                      leave.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      leave.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No leave applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
