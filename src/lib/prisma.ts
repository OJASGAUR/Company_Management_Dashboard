import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

let prismaClient: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (prismaClient) return prismaClient
  if (globalForPrisma.prisma) {
    prismaClient = globalForPrisma.prisma
    return prismaClient
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  const adapter = new PrismaPg({ connectionString })
  prismaClient = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }

  return prismaClient
}

// Initialize Prisma lazily so Next.js can build routes/pages without requiring
// DATABASE_URL in the GitHub Actions build environment. Database access still
// fails fast at runtime when DATABASE_URL is actually needed.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient() as unknown as Record<PropertyKey, unknown>
    const value = Reflect.get(client, property, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
