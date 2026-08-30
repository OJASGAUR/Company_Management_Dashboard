import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getNotifications } from "../actions"
import NotificationsClient from "./NotificationsClient"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const notifications = await getNotifications()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { emailTasks: true, emailLeaves: true, emailAnnouncements: true }
  })
  const userPreferences = user || { emailTasks: true, emailLeaves: true, emailAnnouncements: true }

  return (
    <NotificationsClient
      initialNotifications={notifications as any}
      userRole={session.user.role}
      userEmail={session.user.email || ""}
      userPreferences={userPreferences}
    />
  )
}
