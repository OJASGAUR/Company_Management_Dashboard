import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { setUserActive, completeOnboarding } from "../actions"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      joiningDate: true,
      employeeId: true,
      isActive: true,
      onboardingStatus: true,
    },
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Administration</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Employee Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage identities, roles, onboarding state and account access.</p>
        </div>
        <Link href="/admin/users/new" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">+ Onboard New Joiner</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total" value={users.length} />
        <Stat label="Active" value={users.filter(user => user.isActive).length} />
        <Stat label="Onboarding" value={users.filter(user => user.onboardingStatus !== "COMPLETED").length} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Onboarding</th>
                <th className="p-4 font-semibold">Access</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{user.name || "Unnamed"}</div>
                    <div className="text-xs text-slate-500">{user.employeeId || "No employee ID"} · {user.email || "No email"}</div>
                  </td>
                  <td className="p-4"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{user.role.replace(/_/g, " ")}</span></td>
                  <td className="p-4 text-sm text-slate-600">{user.department || "—"}<div className="text-xs text-slate-400">{user.designation || ""}</div></td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.onboardingStatus === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{user.onboardingStatus.replace(/_/g, " ")}</span></td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{user.isActive ? "ACTIVE" : "DISABLED"}</span></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {user.onboardingStatus !== "COMPLETED" && <form action={completeOnboarding}><input type="hidden" name="userId" value={user.id} /><button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Complete</button></form>}
                      <form action={setUserActive}><input type="hidden" name="userId" value={user.id} /><input type="hidden" name="active" value={String(!user.isActive)} /><button className={`rounded-md px-3 py-1.5 text-xs font-medium ${user.isActive ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{user.isActive ? "Disable" : "Enable"}</button></form>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-500">No employees found. Start by onboarding a new joiner.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div>
}
