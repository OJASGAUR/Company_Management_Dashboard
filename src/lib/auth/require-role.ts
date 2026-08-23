import { requireAuth } from "@/lib/auth/require-auth"
import { Role } from "@prisma/client"

/**
 * Require an authenticated user with one of the supplied roles.
 * Authorization is enforced inside the server-side operation, not only by routing.
 */
export async function requireRole(allowedRoles: readonly Role[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden")
  }

  return user
}
