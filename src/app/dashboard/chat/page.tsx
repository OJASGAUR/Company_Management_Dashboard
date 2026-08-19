import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ChatClient from "./ChatClient"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true }
  })

  // Fetch all other users to chat with
  const otherUsers = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true, name: true, role: true }
  })

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
      <ChatClient currentUser={currentUser!} otherUsers={otherUsers} />
    </div>
  )
}
