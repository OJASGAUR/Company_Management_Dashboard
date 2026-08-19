import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ExternalToolsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [invoices, clients, domains, files] = await Promise.all([
    prisma.invoice.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.client.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.domain.findMany({ take: 5, orderBy: { expiryDate: 'asc' } }),
    prisma.fileRecord.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Finance & External Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Accounts & Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Accounts & Invoices</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">+ New Invoice</button>
          </div>
          <div className="p-0">
            {invoices.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {invoices.map(inv => (
                  <li key={inv.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Invoice #{inv.id.slice(-5).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${inv.amount}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{inv.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No invoices found.</div>
            )}
          </div>
        </div>

        {/* CRM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Client Management (CRM)</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">+ Add Client</button>
          </div>
          <div className="p-0">
            {clients.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {clients.map(client => (
                  <li key={client.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">{client.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.company} | {client.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No clients found in CRM.</div>
            )}
          </div>
        </div>

        {/* Web Developer Dashboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Domains & Hosting</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">+ Track Domain</button>
          </div>
          <div className="p-0">
            {domains.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {domains.map(domain => (
                  <li key={domain.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{domain.url}</p>
                      <p className="text-xs text-gray-500">Provider: {domain.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-900">Expires: {new Date(domain.expiryDate).toLocaleDateString()}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${domain.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{domain.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No domains being tracked.</div>
            )}
          </div>
        </div>

        {/* File Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">File Storage</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">Upload File</button>
          </div>
          <div className="p-0">
            {files.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {files.map(file => (
                  <li key={file.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">Download</button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No files uploaded yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
