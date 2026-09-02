"use client"

import { useState } from "react"
import { createClient, createClientPortalAccount, createInvoice, shareClientDocument } from "./actions"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Select } from "@/components/ui/FormField"

type Client = { id: string; name: string; company: string }

export default function ToolsActions({ clients }: { clients: Client[] }) {
  const [error, setError] = useState<string | null>(null)

  const run = async (
    action: (formData: FormData) => Promise<void>,
    formData: FormData,
    fallback: string
  ) => {
    setError(null)
    try {
      await action(formData)
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Add Client Card */}
        <Card className="flex flex-col justify-between border-indigo-100 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏢</span>
              <CardTitle>Add CRM Client</CardTitle>
            </div>
            <CardDescription>Create a new client entity in the business directory.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={(formData) => run(createClient, formData, "Could not create client")}
              className="space-y-3"
            >
              <Input name="name" required placeholder="Contact Name" />
              <Input name="company" required placeholder="Company Name" />
              <Input name="email" type="email" required placeholder="Client Email" />
              <Input name="phone" placeholder="Phone (Optional)" />
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Add Client to CRM
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enable Portal Account Card */}
        <Card className="flex flex-col justify-between border-cyan-200 bg-cyan-50/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌐</span>
              <CardTitle className="text-cyan-950">Enable Portal Login</CardTitle>
            </div>
            <CardDescription className="text-cyan-800/80">
              Provision a secure CLIENT role login with their email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={(formData) => run(createClientPortalAccount, formData, "Could not create portal account")}
              className="space-y-3"
            >
              <Select name="clientId" required>
                <option value="">Select CRM Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company} — {client.name}
                  </option>
                ))}
              </Select>
              <Input
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Initial Portal Password"
              />
              <Button type="submit" variant="primary" size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700">
                Grant Portal Access
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Share Document Card */}
        <Card className="flex flex-col justify-between border-emerald-200 bg-emerald-50/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📄</span>
              <CardTitle className="text-emerald-950">Share Document</CardTitle>
            </div>
            <CardDescription className="text-emerald-800/80">
              Attach a secure document URL visible to this client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={(formData) => run(shareClientDocument, formData, "Could not share document")}
              className="space-y-3"
            >
              <Select name="clientId" required>
                <option value="">Select CRM Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company} — {client.name}
                  </option>
                ))}
              </Select>
              <Input name="fileName" required placeholder="Document Title" />
              <Input name="fileUrl" type="url" required placeholder="https://secure-docs..." />
              <Button type="submit" variant="primary" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Share Link
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Create Invoice Card */}
        <Card className="flex flex-col justify-between border-slate-200 bg-slate-50/40">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💳</span>
              <CardTitle>Create Invoice</CardTitle>
            </div>
            <CardDescription>Issue a billing record to a client account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={(formData) => run(createInvoice, formData, "Could not create invoice")}
              className="space-y-3"
            >
              <Select name="clientId" required>
                <option value="">Select CRM Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company} — {client.name}
                  </option>
                ))}
              </Select>
              <Input name="amount" type="number" min="0.01" step="0.01" required placeholder="Amount (INR)" />
              <Input name="dueDate" type="date" required />
              <Button type="submit" variant="dark" size="sm" className="w-full">
                Issue Invoice
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}
    </div>
  )
}
