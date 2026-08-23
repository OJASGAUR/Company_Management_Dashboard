"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { requiredString, optionalString, id } from "@/lib/validation"
import { requireClientPortal } from "@/lib/client-portal"
import { recordAudit } from "@/lib/audit"
import { notifyUser } from "@/lib/notifications"

export async function sendClientMessage(formData: FormData) {
  const { user } = await requireClientPortal()
  const receiverId = id(requiredString(formData.get("receiverId"), "Recipient"), "Recipient")
  const content = requiredString(formData.get("content"), "Message", 4000)

  const receiver = await prisma.user.findFirst({
    where: {
      id: receiverId,
      isActive: true,
      role: { in: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS] },
    },
    select: { id: true },
  })
  if (!receiver) throw new Error("Recipient is not available")

  const message = await prisma.message.create({ data: { senderId: user.id, receiverId, content } })
  await Promise.allSettled([
    notifyUser(receiver.id, "New client message", `Message from ${user.name || user.email || "a client"}`),
    recordAudit({ actorId: user.id, action: "SEND_MESSAGE", entity: "Message", entityId: message.id }),
  ])
  revalidatePath("/dashboard/client/messages")
}

export async function addClientDocument(formData: FormData) {
  const { user, client } = await requireClientPortal()
  if (!client) throw new Error("Your client account is not linked to a company record")

  const fileName = requiredString(formData.get("fileName"), "Document name", 180)
  const fileUrl = requiredString(formData.get("fileUrl"), "Document URL", 2000)
  const sizeRaw = optionalString(formData.get("size"), 20)
  const size = sizeRaw ? Number(sizeRaw) : 0
  if (!Number.isFinite(size) || size < 0) throw new Error("Invalid file size")

  const file = await prisma.fileRecord.create({
    data: { fileName, fileUrl, size: Math.round(size), uploaderId: user.id, clientId: client.id },
  })
  await recordAudit({ actorId: user.id, action: "UPLOAD_DOCUMENT_LINK", entity: "FileRecord", entityId: file.id })
  revalidatePath("/dashboard/client/documents")
  revalidatePath("/dashboard/client")
}
