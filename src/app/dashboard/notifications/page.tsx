import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import NotificationsClient from "./NotificationsClient"

export default async function NotificationsPage() {
  const user = await requireAuth()
  const [notifications, preferences] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { emailTasks: true, emailLeaves: true, emailAnnouncements: true },
    }),
  ])

  return (
    <NotificationsClient
      initialNotifications={notifications.map((notification) => ({
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        link: notification.link,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      }))}
      userRole={user.role}
      userEmail={user.email || user.personalEmail || user.companyEmail || ""}
      userPreferences={preferences || { emailTasks: true, emailLeaves: true, emailAnnouncements: true }}
    />
  )
}
