"use client"

import { useState } from "react"
import { createClient, createClientPortalAccount, createInvoice, shareClientDocument } from "./actions"

type Client = { id: string; name: string; company: string }

export default function ToolsActions({ clients }: { clients: Client[] }) {
  const [error, setError] = useState<string | null>(null)
  const run = async (action: (formData: FormData) => Promise<void>, formData: FormData, fallback: string) => { setError(null); try { await action(formData) } catch (e) { setError(e instanceof Error ? e.message : fallback) } }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <form action={formData => run(createClient, formData, "Could not create client")} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900">Add client</h3>
        <div className="mt-4 grid gap-3"><input name="name" required placeholder="Contact name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input name="company" required placeholder="Company" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input name="email" type="email" required placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input name="phone" placeholder="Phone" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Create client</button></div>
      </form>
      <form action={formData => run(createClientPortalAccount, formData, "Could not create portal account")} className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
        <h3 className="font-semibold text-cyan-950">Enable client portal</h3><p className="mt-1 text-xs text-cyan-800">Creates a CLIENT login using the client email.</p>
        <div className="mt-4 grid gap-3"><select name="clientId" required className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm"><option value="">Select client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company} — {client.name}</option>)}</select><input name="password" type="password" minLength={8} required placeholder="Initial password" className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm" /><button className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Create portal login</button></div>
      </form>
      <form action={formData => run(shareClientDocument, formData, "Could not share document")} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="font-semibold text-emerald-950">Share document</h3><p className="mt-1 text-xs text-emerald-800">Add a document URL visible only to the selected client.</p>
        <div className="mt-4 grid gap-3"><select name="clientId" required className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"><option value="">Select client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company} — {client.name}</option>)}</select><input name="fileName" required placeholder="Document name" className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" /><input name="fileUrl" type="url" required placeholder="https://..." className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" /><button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Share document</button></div>
      </form>
      <form action={formData => run(createInvoice, formData, "Could not create invoice")} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900">Create invoice</h3>
        <div className="mt-4 grid gap-3"><select name="clientId" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">Select client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company} — {client.name}</option>)}</select><input name="amount" type="number" min="0.01" step="0.01" required placeholder="Amount" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input name="dueDate" type="date" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Create invoice</button></div>
      </form>
      {error && <p className="md:col-span-2 xl:col-span-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}
