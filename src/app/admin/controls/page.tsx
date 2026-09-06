import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { Role } from "@prisma/client"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"
import { setUserPermission, saveOfferLetterTemplate, createDomain, updateDomain, recordPayment } from "./actions"

type AccessKey =
  | "manageUsers"
  | "manageProjects"
  | "assignTasks"
  | "approveLeaves"
  | "manageFinance"
  | "manageClients"
  | "manageSystem"

const ACCESS_KEYS: readonly AccessKey[] = [
  "manageUsers",
  "manageProjects",
  "assignTasks",
  "approveLeaves",
  "manageFinance",
  "manageClients",
  "manageSystem",
]

const LABELS: Record<AccessKey, string> = {
  manageUsers: "Employee & user management",
  manageProjects: "Project management",
  assignTasks: "Task assignment",
  approveLeaves: "Leave approvals",
  manageFinance: "Finance & invoices",
  manageClients: "Client CRM & documents",
  manageSystem: "System administration",
}

export default async function AdminControlsPage() {
  await requireRole([Role.SUPER_ADMIN])
  const [users, permissions, templates, domains, invoices, payments] = await Promise.all([
    prisma.user.findMany({ where: { isActive: true, role: { not: Role.SUPER_ADMIN } }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true, role: true, department: true } }),
    prisma.userPermission.findMany(),
    prisma.offerLetterTemplate.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.domain.findMany({ orderBy: { expiryDate: "asc" } }),
    prisma.invoice.findMany({ include: { client: true }, orderBy: { dueDate: "asc" }, take: 50 }),
    prisma.payment.findMany({ include: { invoice: { include: { client: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ])
  const activeTemplate = templates.find((template) => template.isActive) || templates[0]

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <PageHeader category="Super Admin" title="System Controls" description="Granular employee access, offer-letter templates, domain assets, and payment tracking." />

      <Card>
        <CardHeader><CardTitle>Partial System Access</CardTitle><CardDescription>Grant or restrict individual module access. Super Admin always retains complete access.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {users.map((user) => <div key={user.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3"><p className="font-bold text-slate-900">{user.name || "Unnamed employee"}</p><p className="text-xs text-slate-500">{user.email} · {user.role.replace(/_/g, " ")}{user.department ? ` · ${user.department}` : ""}</p></div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ACCESS_KEYS.map((key) => {
                const override = permissions.find((p) => p.userId === user.id && p.permission === key)
                const checked = override?.enabled ?? false
                return <form key={key} action={setUserPermission} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <input type="hidden" name="userId" value={user.id} /><input type="hidden" name="permission" value={key} /><input type="hidden" name="enabled" value={String(!checked)} />
                  <span className="text-xs font-semibold text-slate-700">{LABELS[key]}</span><Button type="submit" variant={checked ? "primary" : "outline"} size="sm">{checked ? "Granted" : "Grant"}</Button>
                </form>
              })}
            </div>
          </div>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Offer Letter Template</CardTitle><CardDescription>Update the reusable offer-letter format without editing source code.</CardDescription></CardHeader>
        <CardContent>
          <form action={saveOfferLetterTemplate} className="space-y-4">
            <input type="hidden" name="templateId" value={activeTemplate?.id || ""} />
            <FormField label="Template Name" required><Input name="name" defaultValue={activeTemplate?.name || "Standard Offer Letter"} required /></FormField>
            <FormField label="Template Content" required><Textarea name="content" defaultValue={activeTemplate?.content || "Dear {{employeeName}},\n\nWe are pleased to offer you the position of {{designation}}."} rows={12} required /></FormField>
            <Button type="submit" variant="primary">Save Offer Letter Format</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Domains & Web Assets</CardTitle><CardDescription>Super Admin-only add/update controls for tracked domains.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <form action={createDomain} className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end rounded-2xl bg-slate-50 p-4"><FormField label="Domain" required><Input name="url" placeholder="example.com" required /></FormField><FormField label="Provider" required><Input name="provider" placeholder="Cloudflare" required /></FormField><FormField label="Expiry" required><Input name="expiryDate" type="date" required /></FormField><FormField label="Status"><Select name="status" defaultValue="ACTIVE"><option>ACTIVE</option><option>EXPIRING</option><option>EXPIRED</option></Select></FormField><div className="md:col-span-4"><Button type="submit" variant="primary">Add Domain</Button></div></form>
          <div className="space-y-3">{domains.map((domain) => <form key={domain.id} action={updateDomain} className="grid grid-cols-1 gap-3 md:grid-cols-5 items-end border border-slate-200 rounded-2xl p-4"><input type="hidden" name="domainId" value={domain.id} /><FormField label="Domain"><Input name="url" defaultValue={domain.url} /></FormField><FormField label="Provider"><Input name="provider" defaultValue={domain.provider} /></FormField><FormField label="Expiry"><Input name="expiryDate" type="date" defaultValue={domain.expiryDate.toISOString().slice(0,10)} /></FormField><FormField label="Status"><Select name="status" defaultValue={domain.status}><option>ACTIVE</option><option>EXPIRING</option><option>EXPIRED</option></Select></FormField><Button type="submit" variant="outline">Update</Button></form>)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment Tracking</CardTitle><CardDescription>Record payments, dates, references, and invoice status.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <form action={recordPayment} className="grid grid-cols-1 gap-4 md:grid-cols-5 items-end rounded-2xl bg-slate-50 p-4">
            <FormField label="Invoice" required><Select name="invoiceId" required><option value="">Select invoice</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>#{invoice.id.slice(-8).toUpperCase()} — {invoice.client?.company || "Client"}</option>)}</Select></FormField>
            <FormField label="Amount" required><Input name="amount" type="number" step="0.01" min="0.01" required /></FormField><FormField label="Payment Date"><Input name="paidAt" type="date" /></FormField><FormField label="Reference"><Input name="reference" placeholder="UTR / transaction ref" /></FormField><Button type="submit" variant="primary">Record Payment</Button>
          </form>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-200"><th className="p-3">Invoice</th><th className="p-3">Client</th><th className="p-3">Amount</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b border-slate-100"><td className="p-3 font-mono">#{payment.invoice.id.slice(-8).toUpperCase()}</td><td className="p-3">{payment.invoice.client?.company || "—"}</td><td className="p-3 font-bold">₹{payment.amount.toLocaleString()}</td><td className="p-3">{payment.paidAt?.toLocaleDateString() || "—"}</td><td className="p-3">{payment.status}</td></tr>)}</tbody></table></div>
        </CardContent>
      </Card>
    </div>
  )
}
