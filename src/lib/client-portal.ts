import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { requireAuth } from "@/lib/auth/require-auth"

export async function requireClientPortal() {
  const user = await requireAuth()
  if (user.role !== Role.CLIENT) throw new Error("Client portal access required")

  const client = user.email
    ? await prisma.client.findFirst({ where: { email: user.email } })
    : null

  return { user, client }
}

export async function getClientPortalData() {
  const { user, client } = await requireClientPortal()

  if (!client) {
    return { user, client: null, projects: [], tasks: [], invoices: [], files: [], messages: [], contacts: [] }
  }

  const projects = await prisma.project.findMany({
    where: { clientName: client.company },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  const projectIds = projects.map(project => project.id)

  const [tasks, invoices, files, messages, contacts] = await Promise.all([
    projectIds.length
      ? prisma.task.findMany({
          where: { projectId: { in: projectIds } },
          include: { project: true, user: { select: { name: true, designation: true } } },
          orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
          take: 100,
        })
      : [],
    prisma.invoice.findMany({ where: { clientId: client.id }, orderBy: { dueDate: "desc" }, take: 100 }),
    prisma.fileRecord.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.message.findMany({
      where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
      include: { sender: { select: { name: true, role: true } }, receiver: { select: { name: true, role: true } } },
      orderBy: { timestamp: "asc" },
      take: 100,
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: [Role.SUPER_ADMIN, Role.DIRECTOR, Role.OPERATIONS_MANAGER, Role.ACCOUNTS] },
      },
      select: { id: true, name: true, role: true, designation: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])

  return { user, client, projects, tasks, invoices, files, messages, contacts }
}
