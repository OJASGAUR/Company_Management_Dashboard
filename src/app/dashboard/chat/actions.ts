"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { recordAudit } from "@/lib/audit"
import { notifyUser } from "@/lib/notifications"
import { id, optionalString, requiredString } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function sendDirectMessage(formData: FormData) {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Client accounts must use the client portal messaging system")
  const receiverId = id(requiredString(formData.get("receiverId"), "Recipient"), "Recipient")
  const content = requiredString(formData.get("content"), "Message", 4000)
  if (receiverId === user.id) throw new Error("You cannot message yourself")
  const receiver = await prisma.user.findFirst({ where: { id: receiverId, isActive: true }, select: { id: true } })
  if (!receiver) throw new Error("Recipient is unavailable")
  const attachmentUrl = optionalString(formData.get("attachmentUrl"), 2000)
  const attachmentName = optionalString(formData.get("attachmentName"), 180)
  const message = await prisma.message.create({ data: { senderId: user.id, receiverId: receiver.id, content, attachmentUrl, attachmentName } })
  await Promise.allSettled([notifyUser(receiver.id, "New message", `New message from ${user.name || user.email || "a colleague"}`, "/dashboard/chat"), recordAudit({ actorId: user.id, action: "SEND_MESSAGE", entity: "Message", entityId: message.id })])
  revalidatePath("/dashboard/chat"); revalidatePath("/dashboard/notifications")
}

export async function createMessageGroup(formData: FormData) {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Forbidden")
  const name = requiredString(formData.get("name"), "Group name", 120)
  const group = await prisma.messageGroup.create({ data: { name, createdById: user.id, members: { create: { userId: user.id } } }, select: { id: true } })
  revalidatePath("/dashboard/chat")
  return { success: true, groupId: group.id }
}

export async function addGroupMember(formData: FormData) {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Forbidden")
  const groupId = id(requiredString(formData.get("groupId"), "Group"), "Group")
  const memberId = id(requiredString(formData.get("userId"), "Member"), "Member")
  const group = await prisma.messageGroup.findUnique({ where: { id: groupId }, select: { createdById: true } })
  if (!group || group.createdById !== user.id) throw new Error("Only the group creator can add members")
  const target = await prisma.user.findFirst({ where: { id: memberId, isActive: true }, select: { id: true } })
  if (!target) throw new Error("User unavailable")
  await prisma.messageGroupMember.upsert({ where: { groupId_userId: { groupId, userId: memberId } }, update: {}, create: { groupId, userId: memberId } })
  revalidatePath("/dashboard/chat")
}

export async function sendGroupMessage(formData: FormData) {
  const user = await requireAuth()
  if (user.role === "CLIENT") throw new Error("Forbidden")
  const groupId = id(requiredString(formData.get("groupId"), "Group"), "Group")
  const content = requiredString(formData.get("content"), "Message", 4000)
  const membership = await prisma.messageGroupMember.findUnique({ where: { groupId_userId: { groupId, userId: user.id } } })
  if (!membership) throw new Error("You are not a member of this group")
  const group = await prisma.messageGroup.findUnique({ where: { id: groupId }, include: { members: { include: { user: { select: { id: true } } } } } })
  if (!group) throw new Error("Group not found")
  const message = await prisma.message.create({ data: { senderId: user.id, groupId, content } })
  await Promise.allSettled(group.members.filter((member) => member.userId !== user.id).map((member) => notifyUser(member.user.id, `New message in ${group.name}`, `New group message from ${user.name || "a colleague"}`, "/dashboard/chat")))
  await recordAudit({ actorId: user.id, action: "SEND_GROUP_MESSAGE", entity: "Message", entityId: message.id })
  revalidatePath("/dashboard/chat")
}
