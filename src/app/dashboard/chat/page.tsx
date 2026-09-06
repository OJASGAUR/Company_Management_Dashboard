import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ChatClient from "./ChatClient"
import { PageHeader } from "@/components/ui/PageHeader"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true } })
  if (!currentUser) redirect("/")
  if (currentUser.role === "CLIENT") redirect("/dashboard/client/messages")

  const [otherUsers, messages, groups] = await Promise.all([
    prisma.user.findMany({ where: { id: { not: currentUser.id }, isActive: true }, select: { id: true, name: true, email: true, role: true }, orderBy: { name: "asc" } }),
    prisma.message.findMany({ where: { OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }] }, select: { id: true, senderId: true, receiverId: true, groupId: true, content: true, attachmentUrl: true, attachmentName: true, timestamp: true }, orderBy: { timestamp: "asc" }, take: 500 }),
    prisma.messageGroup.findMany({ where: { members: { some: { userId: currentUser.id } } }, include: { members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ])

  return <div className="mx-auto max-w-7xl space-y-6 font-sans"><PageHeader category="Communication" title="Messages" description="Direct messages, department groups, and file/link sharing." /><div className="h-[calc(100vh-14rem)] min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row"><ChatClient currentUser={currentUser} otherUsers={otherUsers} initialMessages={messages} groups={groups} /></div></div>
}
