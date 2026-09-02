import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { setUserActive, completeOnboarding } from "../actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { StatCard } from "@/components/ui/StatCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card } from "@/components/ui/Card"

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

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const inOnboarding = users.filter((u) => u.onboardingStatus !== "COMPLETED").length

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader
        category="Personnel Administration"
        title="Employee Directory & Access"
        description="Manage employee identities, role assignments, onboarding statuses, and account active states."
        actions={
          <Link href="/admin/users/new">
            <Button variant="primary" size="md">
              + Onboard New Joiner
            </Button>
          </Link>
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Directory Records"
          value={totalUsers}
          subtitle="All recorded accounts"
          icon="👥"
        />
        <StatCard
          title="Active Accounts"
          value={activeUsers}
          subtitle="Enabled login access"
          icon="✅"
        />
        <StatCard
          title="In Onboarding"
          value={inOnboarding}
          subtitle="Awaiting completion"
          icon="📝"
        />
      </div>

      {/* Directory Table */}
      {users.length === 0 ? (
        <Card>
          <EmptyState
            title="No Employee Records Found"
            description="Start by onboarding your first company team member using the button above."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Role Hierarchy</TableHeaderCell>
                <TableHeaderCell>Department & Title</TableHeaderCell>
                <TableHeaderCell>Onboarding</TableHeaderCell>
                <TableHeaderCell>Access</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 text-xs shadow-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-snug">{user.name || "Unnamed Employee"}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {user.employeeId || "No ID"} · {user.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {user.role.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{user.department || "General"}</span>
                    {user.designation && <span className="block text-slate-400">{user.designation}</span>}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={user.onboardingStatus} size="sm" />
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "danger"} size="sm" dot>
                      {user.isActive ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.onboardingStatus !== "COMPLETED" && (
                        <form action={completeOnboarding}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                          >
                            Mark Complete
                          </button>
                        </form>
                      )}
                      <form action={setUserActive}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="active" value={String(!user.isActive)} />
                        <button
                          type="submit"
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors ${
                            user.isActive
                              ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
