import { requireClientPortal } from "@/lib/client-portal"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export default async function ClientProfilePage() {
  const { user, client } = await requireClientPortal()

  return (
    <div className="mx-auto max-w-4xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Company & Contact Profile"
        description="Official account records, authorized contacts, and portal access configuration."
      />

      {/* Hero Header Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-8 border-slate-800">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 font-black text-2xl text-white shadow-lg shadow-cyan-600/30">
              {(client?.name || user.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {client?.name || user.name || "Client"}
                </h2>
                <Badge variant={user.isActive ? "success" : "danger"} size="sm">
                  {user.isActive ? "ACTIVE" : "DISABLED"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">{client?.company || "Client Company Profile"}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portal Mode</p>
            <p className="font-bold text-cyan-300 text-xs mt-0.5">Isolated Client Portal</p>
          </div>
        </div>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Primary organization and contact points.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Primary Contact Email" value={client?.email || user.email} />
            <Field label="Phone Contact" value={client?.phone || user.phone} />
            <Field label="Registered Company" value={client?.company} />
            <Field label="Portal Login ID" value={user.email} />
            <Field label="Account State" value={user.isActive ? "Active & Authorized" : "Disabled"} />
            <Field label="Access Tier" value="Standard Client Portal" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  )
}
