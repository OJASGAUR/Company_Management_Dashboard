import { getDashboardStats } from "./actions"
import DashboardClient from "./DashboardClient"
import { requireAuth } from "@/lib/auth/require-auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await requireAuth()
  if (user.role === Role.CLIENT) redirect("/dashboard/client")

  const stats = await getDashboardStats()
  return <DashboardClient stats={stats} />
}
