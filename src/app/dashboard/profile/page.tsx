import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")
  if (session.user.role === Role.CLIENT) redirect("/dashboard/client/profile")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      companyEmail: true,
      employeeId: true,
      role: true,
      department: true,
      designation: true,
      joiningDate: true,
      phone: true,
      personalEmail: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      city: true,
      state: true,
      postalCode: true,
      emergencyName: true,
      emergencyPhone: true,
      education: true,
      experience: true,
      onboardingStatus: true,
      isActive: true,
      bankAccountName: true,
      bankAccountNumber: true,
      bankName: true,
      bankIfsc: true,
      upiId: true,
    },
  })

  if (!user) redirect("/")

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-sans">
      <PageHeader
        category="Personnel"
        title="My Employee Profile"
        description="Your official company profile, employment records, onboarding details, and payroll data."
      />

      {/* Header Profile Hero Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 border-slate-800">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-indigo-600 font-black text-2xl text-white shadow-lg shadow-indigo-600/30">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name || "Employee"}</h2>
                <Badge variant={user.isActive ? "success" : "danger"} size="sm">
                  {user.isActive ? "ACTIVE" : "DISABLED"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                {user.designation || user.role.replace(/_/g, " ")} · {user.department || "General Operations"}
              </p>
              <p className="mt-1 font-mono text-xs text-indigo-300">ID: {user.employeeId || "No ID Assigned"}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Onboarding Status</p>
            <p className="font-bold text-emerald-400 text-sm mt-0.5">
              {user.onboardingStatus.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Employment Info */}
        <InfoSection
          title="Employment & Role"
          items={[
            ["Role Hierarchy", user.role.replace(/_/g, " ")],
            ["Department", user.department],
            ["Designation", user.designation],
            ["Joining Date", formatDate(user.joiningDate)],
            ["Official Email", user.companyEmail || user.email],
            ["Personal Email", user.personalEmail || "—"],
          ]}
        />

        {/* Personal Details */}
        <InfoSection
          title="Personal Information"
          items={[
            ["Phone Number", user.phone],
            ["Date of Birth", formatDate(user.dateOfBirth)],
            ["Gender", user.gender],
            [
              "Residential Address",
              [user.address, user.city, user.state, user.postalCode].filter(Boolean).join(", ") || "—",
            ],
          ]}
        />

        {/* Emergency Contact */}
        <InfoSection
          title="Emergency Contact"
          items={[
            ["Contact Name", user.emergencyName],
            ["Emergency Phone", user.emergencyPhone],
          ]}
        />

        {/* Education & Experience */}
        <InfoSection
          title="Education & Background"
          items={[
            ["Academic History", user.education],
            ["Past Experience", user.experience],
          ]}
        />
      </div>

      {/* Banking & Payroll (AES-256 Protected) */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <CardTitle className="text-amber-950">Banking & Payroll Account</CardTitle>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              Encrypted at Rest
            </span>
          </div>
          <CardDescription className="text-amber-800/80">
            Confidential financial details are protected using AES-256 encryption. Full account numbers are masked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileField label="Account Holder" value={user.bankAccountName} />
            <ProfileField label="Bank Name" value={user.bankName} />
            <ProfileField label="IFSC Code" value={user.bankIfsc} />
            <ProfileField label="UPI Identifier" value={user.upiId} />
            <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-amber-200/80 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Number Security</p>
              <p className="mt-1 text-xs font-mono font-bold text-slate-800">
                {user.bankAccountNumber ? "•••• •••• •••• [PROTECTED & ENCRYPTED]" : "Not on file"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoSection({
  title,
  items,
}: {
  title: string
  items: [string, string | null | undefined][]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map(([label, value]) => (
            <ProfileField key={label} label={label} value={value} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xs sm:text-sm font-medium text-slate-800 break-words">{value || "—"}</p>
    </div>
  )
}

function formatDate(value: Date | null) {
  return value ? value.toLocaleDateString() : null
}
