"use client"

import { createUser } from "../../actions"
import Link from "next/link"
import { useState } from "react"
import { Role } from "@prisma/client"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"

const roles: Role[] = [
  "EMPLOYEE",
  "HR",
  "OPERATIONS_MANAGER",
  "TEAM_LEAD",
  "DEVELOPER",
  "DESIGNER",
  "TESTER",
  "ACCOUNTS",
  "DIRECTOR",
  "SUPER_ADMIN",
  "CLIENT",
]

export default function NewUserPage() {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSubmitting(true)
    try {
      await createUser(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register employee")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-sans">
      <PageHeader
        category="HR / Onboarding"
        title="New Joiner Registration"
        description="Provision the master employee identity, configure role permissions, and record encrypted payroll credentials."
        actions={
          <Link href="/admin/users">
            <Button variant="outline" size="md">
              Cancel & Return
            </Button>
          </Link>
        }
      />

      <form action={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* 1. Account & Employment Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 font-bold text-xs text-indigo-700">
                1
              </span>
              <CardTitle>Account & Employment Details</CardTitle>
            </div>
            <CardDescription>Core identity information and login credentials.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Full Legal Name" required>
              <Input name="name" required placeholder="Jane Doe" />
            </FormField>

            <FormField label="Personal Email" required>
              <Input type="email" name="email" required placeholder="jane.personal@example.com" />
            </FormField>

            <FormField label="Company Email (Optional)">
              <Input type="email" name="companyEmail" placeholder="jane@company.com" />
            </FormField>

            <FormField label="Initial Password" required>
              <Input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
              />
            </FormField>

            <FormField label="Assigned Role" required>
              <Select name="role" defaultValue="EMPLOYEE">
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Department">
              <Input name="department" placeholder="e.g. Engineering, Design, Operations" />
            </FormField>

            <FormField label="Designation / Job Title">
              <Input name="designation" placeholder="e.g. Senior Frontend Engineer" />
            </FormField>

            <FormField label="Joining Date">
              <Input type="date" name="joiningDate" />
            </FormField>
          </CardContent>
        </Card>

        {/* 2. Personal Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 font-bold text-xs text-indigo-700">
                2
              </span>
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Contact numbers and permanent address records.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Contact Phone">
              <Input name="phone" placeholder="+1 (555) 000-0000" />
            </FormField>

            <FormField label="Date of Birth">
              <Input type="date" name="dateOfBirth" />
            </FormField>

            <FormField label="Gender">
              <Input name="gender" placeholder="e.g. Female, Male, Non-binary" />
            </FormField>

            <FormField label="Postal Code">
              <Input name="postalCode" placeholder="Postal / ZIP Code" />
            </FormField>

            <FormField label="City">
              <Input name="city" placeholder="City" />
            </FormField>

            <FormField label="State / Province">
              <Input name="state" placeholder="State / Province" />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Street Address">
                <Textarea name="address" rows={2} placeholder="Full residential street address..." className="resize-none" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* 3. Emergency Contact */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 font-bold text-xs text-indigo-700">
                3
              </span>
              <CardTitle>Emergency Contact</CardTitle>
            </div>
            <CardDescription>Primary emergency point of contact.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Emergency Contact Name">
              <Input name="emergencyName" placeholder="Next of Kin / Contact Name" />
            </FormField>

            <FormField label="Emergency Phone Number">
              <Input name="emergencyPhone" placeholder="Emergency Phone" />
            </FormField>
          </CardContent>
        </Card>

        {/* 4. Education & Experience */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 font-bold text-xs text-indigo-700">
                4
              </span>
              <CardTitle>Education & Background</CardTitle>
            </div>
            <CardDescription>Academic degrees and previous employment experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField label="Academic History">
              <Textarea
                name="education"
                rows={3}
                placeholder="Degree, Institution, Graduation Year..."
                className="resize-none"
              />
            </FormField>

            <FormField label="Previous Work Experience">
              <Textarea
                name="experience"
                rows={3}
                placeholder="Past companies, positions, years of service..."
                className="resize-none"
              />
            </FormField>
          </CardContent>
        </Card>

        {/* 5. Banking & Payroll (AES Encrypted) */}
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 font-bold text-xs text-amber-800">
                  5
                </span>
                <CardTitle className="text-amber-950">Banking & Payroll Account</CardTitle>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                Encrypted at Rest
              </span>
            </div>
            <CardDescription className="text-amber-800/80">
              Bank account numbers are encrypted using AES-256 before storage in PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Bank Account Holder">
              <Input name="bankAccountName" placeholder="Full name on bank account" />
            </FormField>

            <FormField label="Bank Account Number">
              <Input
                name="bankAccountNumber"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Account number (encrypted automatically)"
              />
            </FormField>

            <FormField label="Bank Name">
              <Input name="bankName" placeholder="e.g. Chase, HDFC, Barclays" />
            </FormField>

            <FormField label="Bank IFSC / Routing Code">
              <Input name="bankIfsc" placeholder="IFSC or Routing Code" />
            </FormField>

            <FormField label="UPI / Digital Payment ID">
              <Input name="upiId" placeholder="name@upi" />
            </FormField>
          </CardContent>
        </Card>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link href="/admin/users">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            className="px-8 shadow-md"
          >
            {submitting ? "Registering Employee..." : "Create Master Employee Profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
