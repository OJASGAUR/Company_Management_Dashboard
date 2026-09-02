import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { applyLeave, updateLeaveStatus } from "../actions"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { TableContainer, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/Table"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { LeaveRow } from "./LeaveRow"
import { FormField, Select, Input, Textarea } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function LeavesPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const leaves = await prisma.leave.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  })

  // Fetch pending leaves if Admin or HR
  const isAdminOrHR = ["SUPER_ADMIN", "HR", "DIRECTOR"].includes(session.user.role)
  const pendingLeaves = isAdminOrHR
    ? await prisma.leave.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { startDate: "asc" },
      })
    : []

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">
      <PageHeader
        category="Time Off"
        title="Leave Management"
        description="Submit leave requests, review your application history, and manage team approvals."
      />

      {/* Admin/HR Pending Approvals Queue */}
      {isAdminOrHR && pendingLeaves.length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <CardTitle className="text-amber-950">Pending Approvals Required</CardTitle>
              </div>
              <CardDescription className="text-amber-800/80">
                Leave applications requiring management review and decision.
              </CardDescription>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              {pendingLeaves.length} Pending
            </span>
          </CardHeader>
          <CardContent>
            <TableContainer className="border-amber-200/60">
              <Table>
                <TableHead className="bg-amber-100/50">
                  <tr>
                    <TableHeaderCell>Employee</TableHeaderCell>
                    <TableHeaderCell>Leave Type</TableHeaderCell>
                    <TableHeaderCell>Duration</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell className="text-right">Decision</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {pendingLeaves.map((leave) => (
                    <TableRow key={leave.id} className="hover:bg-amber-50/40">
                      <TableCell className="font-semibold text-slate-900">
                        {leave.user.name || "Employee"}
                        <span className="block text-xs font-normal text-slate-500">{leave.user.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {leave.type.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {new Date(leave.startDate).toLocaleDateString()} → <br />
                        {new Date(leave.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-slate-600" title={leave.reason}>
                        {leave.reason}
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={updateLeaveStatus} className="inline-flex gap-2">
                          <input type="hidden" name="leaveId" value={leave.id} />
                          <button
                            type="submit"
                            name="status"
                            value="APPROVED"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            type="submit"
                            name="status"
                            value="REJECTED"
                            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Form + History */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Apply Leave Form Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
            <CardDescription>Submit a new time-off request to your manager.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={applyLeave} className="space-y-4">
              <FormField label="Leave Category" required>
                <Select name="type" required>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PAID">Paid Time Off</option>
                  <option value="LOSS_OF_PAY">Loss of Pay</option>
                </Select>
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <FormField label="Start Date" required>
                  <Input type="date" name="startDate" required />
                </FormField>
                <FormField label="End Date" required>
                  <Input type="date" name="endDate" required />
                </FormField>
              </div>

              <FormField label="Reason for Leave" required>
                <Textarea
                  name="reason"
                  required
                  rows={3}
                  placeholder="Provide context for your manager..."
                  className="resize-none"
                />
              </FormField>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Submit Leave Application
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leave History Table Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Leave Applications</CardTitle>
            <CardDescription>Track status and review past requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {leaves.length === 0 ? (
              <EmptyState
                title="No Leave Applications"
                description="You haven't submitted any leave requests yet. Fill out the application form on the left to apply."
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Category</TableHeaderCell>
                      <TableHeaderCell>Duration</TableHeaderCell>
                      <TableHeaderCell>Reason</TableHeaderCell>
                      <TableHeaderCell className="text-right">Status</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {leaves.map((leave) => (
                      <LeaveRow key={leave.id} leave={leave} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
