"use server"

import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth/require-role"
import { permissions, canGrantRole } from "@/lib/auth/permissions"
import { id, requiredString } from "@/lib/validation"

export const ACCESS_KEYS = [
  "manageUsers",
  "manageProjects",
  "assignTasks",
  "approveLeaves",
  "manageFinance",
  "manageClients",
  "manageSystem",
] as const

export async function setUserPermission(formData: FormData) {
  const actor = await requireRole([Role.SUPER_ADMIN])
  const userId = id(requiredString(formData.get("userId"), "User ID"), "User ID")
  const permission = requiredString(formData.get("permission"), "Permission", 80)
  if (!ACCESS_KEYS.includes(permission as typeof ACCESS_KEYS[number])) throw new Error("Unknown permission")
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } })
  if (!target || !target.isActive) throw new Error("Employee not found or inactive")
  if (!canGrantRole(actor.role, target.role)) throw new Error("You cannot manage this role")
  const enabled = formData.get("enabled") === "true"
  await prisma.userPermission.upsert({
    where: { userId_permission: { userId, permission } },
    update: { enabled },
    create: { userId, permission, enabled },
  })
  revalidatePath("/admin/controls")
}

export async function saveOfferLetterTemplate(formData: FormData) {
  const actor = await requireRole([Role.SUPER_ADMIN])
  const name = requiredString(formData.get("name"), "Template name", 160)
  const content = requiredString(formData.get("content"), "Template content", 20000)
  const templateId = formData.get("templateId") ? id(String(formData.get("templateId")), "Template ID") : null

  await prisma.$transaction(async (tx) => {
    if (templateId) {
      await tx.offerLetterTemplate.update({ where: { id: templateId }, data: { name, content } })
    } else {
      await tx.offerLetterTemplate.updateMany({ data: { isActive: false } })
      await tx.offerLetterTemplate.create({ data: { name, content, createdById: actor.id, isActive: true } })
    }
  })
  revalidatePath("/admin/controls")
}

export async function createDomain(formData: FormData) {
  await requireRole([Role.SUPER_ADMIN])
  const url = requiredString(formData.get("url"), "Domain", 500)
  const provider = requiredString(formData.get("provider"), "Provider", 120)
  const expiry = requiredString(formData.get("expiryDate"), "Expiry date", 40)
  const expiryDate = new Date(expiry)
  if (Number.isNaN(expiryDate.getTime())) throw new Error("Invalid expiry date")
  const status = requiredString(formData.get("status") || "ACTIVE", "Status", 40)
  await prisma.domain.create({ data: { url, provider, expiryDate, status } })
  revalidatePath("/dashboard/tools")
  revalidatePath("/admin/controls")
}

export async function updateDomain(formData: FormData) {
  await requireRole([Role.SUPER_ADMIN])
  const domainId = id(requiredString(formData.get("domainId"), "Domain ID"), "Domain ID")
  const url = requiredString(formData.get("url"), "Domain", 500)
  const provider = requiredString(formData.get("provider"), "Provider", 120)
  const expiry = requiredString(formData.get("expiryDate"), "Expiry date", 40)
  const expiryDate = new Date(expiry)
  const status = requiredString(formData.get("status") || "ACTIVE", "Status", 40)
  if (Number.isNaN(expiryDate.getTime())) throw new Error("Invalid expiry date")
  await prisma.domain.update({ where: { id: domainId }, data: { url, provider, expiryDate, status } })
  revalidatePath("/dashboard/tools")
  revalidatePath("/admin/controls")
}

export async function recordPayment(formData: FormData) {
  await requireRole([Role.SUPER_ADMIN, Role.DIRECTOR, Role.ACCOUNTS])
  const invoiceId = id(requiredString(formData.get("invoiceId"), "Invoice ID"), "Invoice ID")
  const amount = Number(requiredString(formData.get("amount"), "Payment amount", 40))
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid payment amount")
  const paidAtRaw = formData.get("paidAt") ? String(formData.get("paidAt")) : ""
  const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date()
  if (Number.isNaN(paidAt.getTime())) throw new Error("Invalid payment date")
  const reference = formData.get("reference") ? String(formData.get("reference")) : null
  const notes = formData.get("notes") ? String(formData.get("notes")) : null
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } })
  if (!invoice) throw new Error("Invoice not found")
  const totalPaid = invoice.payments.reduce((sum, payment) => sum + (payment.status === "PAID" ? payment.amount : 0), 0)
  if (amount + totalPaid > invoice.amount + invoice.amount * (invoice.gstRate / 100) + 0.01) throw new Error("Payment exceeds invoice balance")
  await prisma.payment.create({ data: { invoiceId, amount, status: "PAID", paidAt, reference, notes } })
  const newPaid = totalPaid + amount
  const invoiceTotal = invoice.amount + invoice.amount * (invoice.gstRate / 100)
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newPaid + 0.01 >= invoiceTotal ? "PAID" : "PARTIALLY_PAID" } })
  revalidatePath("/dashboard/tools")
  revalidatePath("/dashboard/client/invoices")
  revalidatePath("/admin/controls")
}
