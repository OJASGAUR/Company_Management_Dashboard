"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { recordAudit } from "@/lib/audit"
import { email, optionalDate, optionalString, requiredString } from "@/lib/validation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

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

export async function createClientPortalAccount(formData: FormData) {
  const actor = await requireRole(permissions.manageClients)
  const clientId = requiredString(formData.get("clientId"), "Client ID", 100)
  const password = requiredString(formData.get("password"), "Portal password", 200)
  if (password.length < 8) throw new Error("Portal password must be at least 8 characters")
  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) throw new Error("Client not found")
  const existingUser = await prisma.user.findFirst({ where: { email: client.email }, select: { id: true, role: true } })
  if (existingUser) {
    if (existingUser.role !== Role.CLIENT) throw new Error("This email already belongs to a non-client user")
    throw new Error("A client portal account already exists")
  }
  const user = await prisma.user.create({ data: { name: client.name, email: client.email, password: await bcrypt.hash(password, 12), role: Role.CLIENT, isActive: true, onboardingStatus: "COMPLETED" }, select: { id: true } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "CREATE_CLIENT_PORTAL_ACCOUNT", entity: "User", entityId: user.id, metadata: { clientId: client.id } })])
  revalidatePath("/dashboard/tools")
}

export async function shareClientDocument(formData: FormData) {
  const actor = await requireRole(permissions.manageClients)
  const clientId = requiredString(formData.get("clientId"), "Client ID", 100)
  const fileName = requiredString(formData.get("fileName"), "Document name", 180)
  const fileUrl = requiredString(formData.get("fileUrl"), "Document URL", 2000)
  const sizeRaw = optionalString(formData.get("size"), 20)
  const size = sizeRaw ? Number(sizeRaw) : 0
  if (!Number.isFinite(size) || size < 0) throw new Error("Invalid file size")
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!client) throw new Error("Client not found")
  const file = await prisma.fileRecord.create({ data: { fileName, fileUrl, size: Math.round(size), uploaderId: actor.id, clientId } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "SHARE_CLIENT_DOCUMENT", entity: "FileRecord", entityId: file.id, metadata: { clientId } })])
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

export async function deleteClient(clientId: string) {
  const actor = await requireRole(permissions.manageClients)
  await prisma.client.delete({ where: { id: clientId } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "DELETE", entity: "Client", entityId: clientId })])
  revalidatePath("/dashboard/tools")
  revalidatePath("/dashboard/tools/clients")
  return { success: true }
}

export async function deleteDocument(documentId: string) {
  const actor = await requireRole(permissions.manageClients)
  await prisma.fileRecord.delete({ where: { id: documentId } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "DELETE", entity: "FileRecord", entityId: documentId })])
  revalidatePath("/dashboard/tools")
  revalidatePath("/dashboard/client/documents")
  return { success: true }
}

export async function deleteInvoice(invoiceId: string) {
  const actor = await requireRole(permissions.manageFinance)
  await prisma.invoice.delete({ where: { id: invoiceId } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "DELETE", entity: "Invoice", entityId: invoiceId })])
  revalidatePath("/dashboard/tools")
  revalidatePath("/dashboard/client/invoices")
  return { success: true }
}
