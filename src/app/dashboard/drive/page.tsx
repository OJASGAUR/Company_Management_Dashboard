import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { addDriveDocument, deleteDriveDocument } from "./actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { FormField, Input } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function EmployeeDrivePage() {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Forbidden")

  const files = await prisma.fileRecord.findMany({
    where: { uploaderId: user.id, clientId: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return <div className="mx-auto max-w-6xl space-y-8 font-sans">
    <PageHeader category="Workspace" title="Employee Drive" description="Store and manage your work-related document links in one internal workspace." />
    <Card>
      <CardHeader><CardTitle>Add a work document</CardTitle><CardDescription>The prototype stores secure document metadata and a private storage URL. Connect object storage for raw-file uploads in production.</CardDescription></CardHeader>
      <CardContent><form action={addDriveDocument} className="grid grid-cols-1 gap-4 md:grid-cols-3 items-end"><FormField label="Document Name" required><Input name="fileName" required placeholder="e.g. Sprint Plan.pdf" /></FormField><FormField label="Secure Document URL" required><Input name="fileUrl" type="url" required placeholder="https://..." /></FormField><FormField label="Size (bytes)"><Input name="size" type="number" min="0" placeholder="Optional" /></FormField><div className="md:col-span-3"><Button type="submit" variant="primary">Save to Employee Drive</Button></div></form></CardContent>
    </Card>
    {files.length === 0 ? <Card><EmptyState icon="📁" title="Drive is empty" description="Add your first work document above." /></Card> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{files.map((file) => <Card key={file.id} className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{file.fileName}</p><p className="text-xs text-slate-500">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : "External secure link"}</p></div><div className="flex shrink-0 items-center gap-2"><a href={file.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100">Open ↗</a><form action={deleteDriveDocument}><input type="hidden" name="fileId" value={file.id} /><Button type="submit" variant="ghost" size="sm">Delete</Button></form></div></Card>)}</div>}
  </div>
}
