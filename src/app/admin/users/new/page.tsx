"use client"

import { createUser } from "../../actions"
import Link from "next/link"
import { useState } from "react"
import type { ReactNode } from "react"
import { Role } from "@prisma/client"

const roles: Role[] = [
  "EMPLOYEE", "HR", "OPERATIONS_MANAGER", "TEAM_LEAD", "DEVELOPER",
  "DESIGNER", "TESTER", "ACCOUNTS", "DIRECTOR", "SUPER_ADMIN", "CLIENT",
]

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

export default function NewUserPage() {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSubmitting(true)
    try {
      await createUser(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">HR / Onboarding</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">New Joiner Registration</h1>
          <p className="mt-2 text-sm text-slate-500">Create the employee identity that all company modules will use.</p>
        </div>
        <Link href="/admin/users" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</Link>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <Section title="Account & employment">
          <Field label="Full name"><input name="name" required className={inputClass} /></Field>
          <Field label="Personal email"><input type="email" name="email" required className={inputClass} /></Field>
          <Field label="Company email"><input type="email" name="companyEmail" className={inputClass} /></Field>
          <Field label="Temporary password"><input type="password" name="password" required minLength={8} className={inputClass} /></Field>
          <Field label="Role"><select name="role" className={inputClass}>{roles.map(role => <option key={role} value={role}>{role.replace(/_/g, " ")}</option>)}</select></Field>
          <Field label="Department"><input name="department" className={inputClass} /></Field>
          <Field label="Designation"><input name="designation" className={inputClass} /></Field>
          <Field label="Joining date"><input type="date" name="joiningDate" className={inputClass} /></Field>
        </Section>

        <Section title="Personal information">
          <Field label="Phone"><input name="phone" className={inputClass} /></Field>
          <Field label="Date of birth"><input type="date" name="dateOfBirth" className={inputClass} /></Field>
          <Field label="Gender"><input name="gender" className={inputClass} /></Field>
          <Field label="Postal code"><input name="postalCode" className={inputClass} /></Field>
          <Field label="City"><input name="city" className={inputClass} /></Field>
          <Field label="State"><input name="state" className={inputClass} /></Field>
          <Field label="Address" wide><textarea name="address" rows={3} className={inputClass} /></Field>
        </Section>

        <Section title="Emergency contact">
          <Field label="Contact name"><input name="emergencyName" className={inputClass} /></Field>
          <Field label="Contact phone"><input name="emergencyPhone" className={inputClass} /></Field>
        </Section>

        <Section title="Education & experience">
          <Field label="Education" wide><textarea name="education" rows={3} className={inputClass} placeholder="Degree, institution, graduation year..." /></Field>
          <Field label="Experience" wide><textarea name="experience" rows={3} className={inputClass} placeholder="Previous companies, roles, years..." /></Field>
        </Section>

        <Section title="Banking & payroll">
          <p className="col-span-full -mt-2 text-xs text-slate-500">Bank account numbers are encrypted before storage. Configure <code>CREDENTIAL_ENCRYPTION_KEY</code> in production.</p>
          <Field label="Account holder"><input name="bankAccountName" className={inputClass} /></Field>
          <Field label="Account number"><input name="bankAccountNumber" inputMode="numeric" autoComplete="off" className={inputClass} /></Field>
          <Field label="Bank name"><input name="bankName" className={inputClass} /></Field>
          <Field label="IFSC"><input name="bankIfsc" className={inputClass} /></Field>
          <Field label="UPI ID"><input name="upiId" className={inputClass} /></Field>
        </Section>

        <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/admin/users" className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</Link>
          <button disabled={submitting} type="submit" className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? "Creating..." : "Create Employee Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={wide ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}><span className="block text-sm font-medium text-slate-700">{label}</span>{children}</label>
}
