import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "./require-auth"

/**
 * Centralized authorization policy.
 * The role policy is the default; Super Admin can add per-user overrides.
 */
export const permissions: Record<string, Role[]> = {
  manageUsers: [Role.SUPER_ADMIN, Role.HR],
  manageProjects: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER],
  assignTasks: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.TEAM_LEAD],
  approveLeaves: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR],
  manageFinance: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.ACCOUNTS],
  manageClients: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS],
  manageSystem: [Role.SUPER_ADMIN],
}

export type PermissionKey = keyof typeof permissions

/** Prevent lower-privilege administrators from escalating accounts. */
export function canGrantRole(actor: Role, target: Role) {
  if (actor === Role.SUPER_ADMIN) return true
  if (actor === Role.HR) {
    const allowedTargetRoles: Role[] = [Role.EMPLOYEE, Role.DEVELOPER, Role.DESIGNER, Role.TESTER, Role.TEAM_LEAD, Role.ACCOUNTS]
    return allowedTargetRoles.includes(target)
  }
  return false
}

/**
 * Returns true when the current user has a role grant or an explicit per-user grant.
 * Super Admin is always fully authorized.
 */
export async function hasPermission(permission: PermissionKey) {
  const user = await requireAuth()
  if (user.role === Role.SUPER_ADMIN) return true

  const override = await prisma.userPermission.findUnique({
    where: { userId_permission: { userId: user.id, permission } },
    select: { enabled: true },
  })
  if (override) return override.enabled
  return permissions[permission].includes(user.role)
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireAuth()
  if (user.role === Role.SUPER_ADMIN) return user

  const override = await prisma.userPermission.findUnique({
    where: { userId_permission: { userId: user.id, permission } },
    select: { enabled: true },
  })
  const allowed = override ? override.enabled : permissions[permission].includes(user.role)
  if (!allowed) throw new Error("Forbidden")
  return user
}
