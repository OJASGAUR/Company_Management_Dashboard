import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getNotifications } from "../actions"
import NotificationsClient from "./NotificationsClient"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const notifications = await getNotifications()

  return (
    <NotificationsClient
      initialNotifications={notifications as any}
      userRole={session.user.role}
      userEmail={session.user.email || ""}
    />
  )
}
