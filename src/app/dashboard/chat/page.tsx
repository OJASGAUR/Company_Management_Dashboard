import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ChatClient from "./ChatClient"
import { PageHeader } from "@/components/ui/PageHeader"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  })
  if (!currentUser) redirect("/")

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
    <div className="mx-auto max-w-7xl space-y-6 font-sans">
      <PageHeader
        category="Communication"
        title="Direct Messages"
        description="Connect and collaborate with colleagues in real time across departments."
      />
      <div className="h-[calc(100vh-14rem)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row">
        <ChatClient currentUser={currentUser} otherUsers={otherUsers} initialMessages={messages.reverse()} />
      </div>
    </div>
  )
}
