import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Resolve the currently authenticated, active database user.
 * Server-side mutations must use this instead of trusting client-supplied user IDs.
 */
export async function requireAuth() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive) throw new Error("Unauthorized")

  return user
}
