import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import IntegrationsClient from "./IntegrationsClient"

export default async function IntegrationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const integrations = await prisma.calendarIntegration.findMany({
    where: { userId: session.user.id },
    select: { provider: true },
  })

  const connected = new Set(integrations.map((item) => item.provider))

  return <IntegrationsClient initialStatus={{ google: connected.has("google"), outlook: connected.has("outlook") }} />
}
