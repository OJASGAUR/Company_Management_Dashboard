import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ChatClient from "./ChatClient"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  })
  if (!currentUser) redirect("/login")

  if (currentUser.role === "CLIENT") redirect("/dashboard/client/messages")

  const otherUsers = await prisma.user.findMany({
    where: { id: { not: currentUser.id }, isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  })

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }] },
    select: { id: true, senderId: true, receiverId: true, content: true, timestamp: true },
    orderBy: { timestamp: "desc" },
    take: 500,
  })

  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex">
      <ChatClient currentUser={currentUser} otherUsers={otherUsers} initialMessages={messages.reverse()} />
    </div>
  )
}
