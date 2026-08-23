import { Role } from "@prisma/client"

/**
 * Centralized authorization policy.
 * Keep business permissions here so feature actions do not accumulate ad-hoc role checks.
 */
export const permissions = {
  manageUsers: [Role.SUPER_ADMIN, Role.HR] as const,
  manageProjects: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER] as const,
  assignTasks: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.TEAM_LEAD] as const,
  approveLeaves: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR] as const,
  manageSystem: [Role.SUPER_ADMIN] as const,
} as const
