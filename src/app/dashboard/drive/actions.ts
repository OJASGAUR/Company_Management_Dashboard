"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { revalidatePath } from "next/cache"
import { id, optionalString, requiredString } from "@/lib/validation"

export async function addDriveDocument(formData: FormData) {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Employees only")
  const fileName = requiredString(formData.get("fileName"), "Document name", 180)
  const fileUrl = requiredString(formData.get("fileUrl"), "Document URL", 2000)
  const sizeRaw = optionalString(formData.get("size"), 20)
  const size = sizeRaw ? Number(sizeRaw) : 0
  if (!Number.isFinite(size) || size < 0) throw new Error("Invalid file size")
  await prisma.fileRecord.create({ data: { fileName, fileUrl, size: Math.round(size), uploaderId: user.id } })
  revalidatePath("/dashboard/drive")
}

export async function deleteDriveDocument(formData: FormData) {
  const user = await requireAuth()
  const fileId = id(requiredString(formData.get("fileId"), "File ID"), "File ID")
  const file = await prisma.fileRecord.findUnique({ where: { id: fileId }, select: { id: true, uploaderId: true, clientId: true } })
  if (!file || file.uploaderId !== user.id) throw new Error("Document not found or access denied")
  if (file.clientId) throw new Error("Use client document controls for client-shared files")
  await prisma.fileRecord.delete({ where: { id: fileId } })
  revalidatePath("/dashboard/drive")
}
