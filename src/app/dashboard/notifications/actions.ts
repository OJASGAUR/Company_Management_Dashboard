"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { id, requiredString } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function markNotificationRead(formData: FormData) {
  const user = await requireAuth()
  const notificationId = id(requiredString(formData.get("notificationId"), "Notification ID"), "Notification ID")

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  })

  revalidatePath("/dashboard/notifications")
}
