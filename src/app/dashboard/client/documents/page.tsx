import { getClientPortalData } from "@/lib/client-portal"
import { addClientDocument } from "../actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { FormField, Input } from "@/components/ui/FormField"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

import { DocumentCard } from "./DocumentCard"

export default async function ClientDocumentsPage() {
  const { client, files } = await getClientPortalData()
  if (!client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-amber-900 text-sm">
          This client account is not linked to a client company profile yet.
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Shared Documents & Assets"
        description="Access company deliverables, contracts, specifications, and upload shared links."
      />

      {/* Share Document Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share New Document Link</CardTitle>
          <CardDescription>Upload a link to design assets, specification files, or deliverables.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addClientDocument} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Document Title" required>
              <Input name="fileName" required placeholder="e.g. Q3 Design Specifications" />
            </FormField>

            <FormField label="Secure Document URL" required>
              <Input name="fileUrl" required type="url" placeholder="https://drive.google.com/..." />
            </FormField>

            <FormField label="File Size (Bytes, Optional)">
              <Input name="size" type="number" min="0" placeholder="e.g. 2048000" />
            </FormField>

            <div className="md:col-span-3">
              <Button type="submit" variant="primary" size="md" className="bg-cyan-600 hover:bg-cyan-700">
                Share Document With Team
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Shared Documents List */}
      <div className="space-y-4">
        {files.map((file) => (
          <DocumentCard key={file.id} file={file} />
        ))}

        {files.length === 0 && (
          <Card>
            <EmptyState
              icon="📄"
              title="No Shared Documents"
              description="No documents or external asset links have been uploaded to your portal yet."
            />
          </Card>
        )}
      </div>
    </div>
  )
}
