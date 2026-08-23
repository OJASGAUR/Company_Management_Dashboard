import { prisma } from "@/lib/prisma"

export async function notifyUser(userId: string, title: string, body: string) {
  return prisma.notification.create({ data: { userId, title, body } })
}

export async function notifyUsers(userIds: string[], title: string, body: string) {
  if (userIds.length === 0) return
  return prisma.notification.createMany({
    data: [...new Set(userIds)].map(userId => ({ userId, title, body })),
  })
}
