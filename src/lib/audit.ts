import { prisma } from "@/lib/prisma"

export async function recordAudit(input: {
  actorId?: string | null
  action: string
  entity: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
    },
  })
}
