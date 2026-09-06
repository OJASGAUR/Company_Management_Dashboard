import { prisma } from "@/lib/prisma"
import { requireClientPortal } from "@/lib/client-portal"
import { createInvoicePdf } from "@/lib/invoice-pdf"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireClientPortal()
  if (!client) return new Response("Client profile not linked", { status: 403 })

  const { id } = await params
  const url = new URL(request.url)
  const includeGst = url.searchParams.get("gst") !== "false"
  const invoice = await prisma.invoice.findFirst({ where: { id, clientId: client.id }, include: { client: true } })
  if (!invoice || !invoice.client) return new Response("Invoice not found", { status: 404 })

  const pdf = createInvoicePdf({
    invoiceId: invoice.id,
    company: invoice.client.company,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    amount: invoice.amount,
    gstRate: invoice.gstRate,
    dueDate: invoice.dueDate,
    createdAt: invoice.createdAt,
    includeGst,
  })

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.id.slice(-8)}-${includeGst ? "with-gst" : "without-gst"}.pdf"`,
      "Content-Length": String(pdf.byteLength),
      "Cache-Control": "private, no-store",
    },
  })
}
