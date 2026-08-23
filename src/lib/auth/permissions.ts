import { Role } from "@prisma/client"

/**
 * Centralized authorization policy.
 * Keep business permissions here so feature actions do not accumulate ad-hoc role checks.
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

/** Prevent lower-privilege administrators from escalating accounts. */
export function canGrantRole(actor: Role, target: Role) {
  if (actor === Role.SUPER_ADMIN) return true
  if (actor === Role.HR) {
    const allowedTargetRoles: Role[] = [Role.EMPLOYEE, Role.DEVELOPER, Role.DESIGNER, Role.TESTER, Role.TEAM_LEAD, Role.ACCOUNTS]
    return allowedTargetRoles.includes(target)
  }
  return false
}
