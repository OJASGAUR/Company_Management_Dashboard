"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { recordAudit } from "@/lib/audit"
import { notifyUser } from "@/lib/notifications"
import { id, requiredString } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function sendDirectMessage(formData: FormData) {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Client accounts must use the client portal messaging system")

  const receiverId = id(requiredString(formData.get("receiverId"), "Recipient"), "Recipient")
  const content = requiredString(formData.get("content"), "Message", 4000)

  if (receiverId === user.id) throw new Error("You cannot message yourself")

  const receiver = await prisma.user.findFirst({
    where: { id: receiverId, isActive: true },
    select: { id: true },
  })
  if (!receiver) throw new Error("Recipient is unavailable")

  const message = await prisma.message.create({
    data: { senderId: user.id, receiverId: receiver.id, content },
  })

  await Promise.allSettled([
    notifyUser(receiver.id, "New message", `New message from ${user.name || user.email || "a colleague"}`),
    recordAudit({ actorId: user.id, action: "SEND_MESSAGE", entity: "Message", entityId: message.id }),
  ])

  revalidatePath("/dashboard/chat")
  revalidatePath("/dashboard/notifications")
}
