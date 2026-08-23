"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { recordAudit } from "@/lib/audit"
import { email, optionalDate, optionalString, requiredString } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function createClient(formData: FormData) {
  const actor = await requireRole(permissions.manageClients)
  const name = requiredString(formData.get("name"), "Client name", 120)
  const company = requiredString(formData.get("company"), "Company", 160)
  const clientEmail = email(formData.get("email"))
  const phone = optionalString(formData.get("phone"), 40)
  const existing = await prisma.client.findFirst({ where: { email: clientEmail } })
  if (existing) throw new Error("Client with this email already exists")
  const client = await prisma.client.create({ data: { name, company, email: clientEmail, phone } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "CREATE", entity: "Client", entityId: client.id })])
  revalidatePath("/dashboard/tools")
}

export async function createInvoice(formData: FormData) {
  const actor = await requireRole(permissions.manageFinance)
  const clientId = requiredString(formData.get("clientId"), "Client ID", 100)
  const amountRaw = requiredString(formData.get("amount"), "Amount", 40)
  const amount = Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid invoice amount")
  const dueDate = optionalDate(formData.get("dueDate"), "Due date")
  if (!dueDate) throw new Error("Due date is required")
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!client) throw new Error("Client not found")
  const invoice = await prisma.invoice.create({ data: { clientId, amount, dueDate, status: "UNPAID" } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "CREATE", entity: "Invoice", entityId: invoice.id })])
  revalidatePath("/dashboard/tools")
}
