"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { sendNotificationEmail } from "@/lib/email"
import { date, email, enumValue, id, optionalDate, optionalString, requiredString } from "@/lib/validation"

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as const
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
const LEAVE_TYPES = ["CASUAL", "SICK", "PAID", "LOSS_OF_PAY"] as const
const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const
const MANAGER_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER, Role.TEAM_LEAD]
const ALL_ROLES: Role[] = Object.values(Role) as Role[]
const BROADCAST_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER]
const NOTIFICATION_TYPES = ["INFO", "WARNING", "SUCCESS", "ALERT", "TASK", "LEAVE"] as const

export async function getDashboardStats() {
  const user = await requireAuth()
  const isManager = MANAGER_ROLES.includes(user.role)
  let todaysAttendance = null, activeTasks = 0, pendingLeaves = 0, totalEmployees = 0
  if (isManager) {
    activeTasks = await prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } })
    pendingLeaves = await prisma.leave.count({ where: { status: "PENDING" } })
    totalEmployees = await prisma.user.count({ where: { role: Role.EMPLOYEE, isActive: true } })
  } else if (user.role !== Role.CLIENT) {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
    todaysAttendance = await prisma.attendance.findFirst({ where: { userId: user.id, date: { gte: startOfDay } } })
    activeTasks = await prisma.task.count({ where: { userId: user.id, status: { in: ["TODO", "IN_PROGRESS"] } } })
  }
  return { user, isAdmin: isManager, isManager, todaysAttendance, activeTasks, pendingLeaves, totalEmployees }
}

export async function punchIn() {
  const user = await requireAuth(), now = new Date(), startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const existing = await prisma.attendance.findFirst({ where: { userId: user.id, date: { gte: startOfDay } } })
  if (existing) throw new Error("Already punched in today")
  await prisma.attendance.create({ data: { userId: user.id, date: now, checkIn: now, status: now.getHours() > 10 ? "LATE" : "PRESENT" } })
  revalidatePath("/dashboard"); revalidatePath("/dashboard/attendance")
  return { success: true }
}

export async function punchOut() {
  const user = await requireAuth(), startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
  const existing = await prisma.attendance.findFirst({ where: { userId: user.id, date: { gte: startOfDay } } })
  if (!existing || existing.checkOut) throw new Error("Cannot punch out")
  await prisma.attendance.update({ where: { id: existing.id }, data: { checkOut: new Date() } })
  revalidatePath("/dashboard"); revalidatePath("/dashboard/attendance")
  return { success: true }
}

export async function getAttendanceHistory() {
  const user = await requireAuth(); return prisma.attendance.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 })
}

export async function getTasks() {
  const user = await requireAuth(); if (user.role === Role.CLIENT) return []
  return prisma.task.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } })
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const user = await requireAuth(); if (user.role === Role.CLIENT) throw new Error("Forbidden")
  const safeTaskId = id(taskId, "Task ID"), status = enumValue(newStatus, "Task status", TASK_STATUSES)
  const task = await prisma.task.findUnique({ where: { id: safeTaskId } }); if (!task) throw new Error("Task not found")
  const canManageAllTasks = permissions.assignTasks.includes(user.role)
  if (task.userId !== user.id && !canManageAllTasks) throw new Error("Forbidden")
  await prisma.task.update({ where: { id: safeTaskId }, data: { status } })
  revalidatePath("/dashboard/tasks"); revalidatePath("/dashboard"); return { success: true }
}

export async function applyLeave(formData: FormData) {
  const user = await requireAuth(), type = enumValue(formData.get("type"), "Leave type", LEAVE_TYPES)
  const startDate = date(formData.get("startDate"), "Start date"), endDate = date(formData.get("endDate"), "End date")
  const reason = requiredString(formData.get("reason"), "Reason", 2000)
  if (endDate < startDate) throw new Error("End date cannot be before start date")
  await prisma.leave.create({ data: { userId: user.id, type, startDate, endDate, reason, status: "PENDING" } })
  revalidatePath("/dashboard/leaves"); revalidatePath("/dashboard")
}

export async function assignTask(formData: FormData) {
  const actor = await requireRole(permissions.assignTasks), title = requiredString(formData.get("title"), "Title", 200)
  const projectIdRaw = optionalString(formData.get("projectId"), 100), userId = id(requiredString(formData.get("userId"), "Assignee"), "Assignee")
  const priority = enumValue(formData.get("priority") || "MEDIUM", "Priority", TASK_PRIORITIES)
  const deadline = optionalDate(formData.get("deadline"), "Deadline"), description = optionalString(formData.get("description"), 5000)
  const assignee = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isActive: true } })
  if (!assignee || !assignee.isActive) throw new Error("Assignee not found or inactive")
  const projectId = projectIdRaw ? id(projectIdRaw, "Project ID") : null
  if (projectId && !(await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } }))) throw new Error("Project not found")
  await prisma.task.create({ data: { title, description, priority, deadline, userId, assignedById: actor.id, projectId, status: "TODO" } })

  await createNotification({
    userId: assignee.id,
    title: `New task assigned: ${title}`,
    message: `You have been assigned a new ${priority.toLowerCase()} priority task.${deadline ? ` Deadline: ${deadline.toLocaleDateString()}.` : ""}${description ? ` ${description}` : ""}`,
    type: "TASK",
    link: "/dashboard/tasks",
  })

  revalidatePath("/dashboard/operations"); revalidatePath("/dashboard/tasks")
}

export async function createEmployee(formData: FormData) {
  await requireRole(permissions.manageUsers)
  const name = requiredString(formData.get("name"), "Name", 120), emailAddress = email(formData.get("email")), employeeId = requiredString(formData.get("employeeId"), "Employee ID", 50)
  const role = enumValue(formData.get("role"), "Role", ALL_ROLES), department = optionalString(formData.get("department"), 120), rawPassword = requiredString(formData.get("password"), "Password", 200)
  if (rawPassword.length < 8) throw new Error("Password must be at least 8 characters")
  if (await prisma.user.findFirst({ where: { OR: [{ email: emailAddress }, { employeeId }] }, select: { id: true } })) throw new Error("Email or employee ID already exists")
  await prisma.user.create({ data: { name, email: emailAddress, employeeId, role, department, password: await bcrypt.hash(rawPassword, 12) } })
  revalidatePath("/dashboard/operations")
}

export async function updateLeaveStatus(formData: FormData) {
  await requireRole(permissions.approveLeaves)
  const leaveId = id(requiredString(formData.get("leaveId"), "Leave ID"), "Leave ID"), status = enumValue(formData.get("status"), "Leave status", LEAVE_STATUSES)
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    select: { userId: true, type: true, startDate: true, endDate: true, user: { select: { id: true, isActive: true } } },
  })
  if (!leave) throw new Error("Leave request not found")

  await prisma.leave.update({ where: { id: leaveId }, data: { status } })

  if (leave.user.isActive) {
    const statusLabel = status === "APPROVED" ? "approved" : "rejected"
    await createNotification({
      userId: leave.userId,
      title: `Leave request ${statusLabel}`,
      message: `Your ${leave.type.toLowerCase()} leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been ${statusLabel}.`,
      type: "LEAVE",
      link: "/dashboard/leaves",
    })
  }

  revalidatePath("/dashboard/leaves"); revalidatePath("/dashboard")
}

export async function createProject(formData: FormData) {
  await requireRole(permissions.manageProjects)
  const name = requiredString(formData.get("name"), "Project name", 200), description = optionalString(formData.get("description"), 5000), clientName = optionalString(formData.get("clientName"), 200)
  const startDate = optionalDate(formData.get("startDate"), "Start date"), endDate = optionalDate(formData.get("endDate"), "End date")
  if (startDate && endDate && endDate < startDate) throw new Error("End date cannot be before start date")
  await prisma.project.create({ data: { name, description, clientName, startDate, endDate, status: "PLANNING" } })
  revalidatePath("/dashboard/projects")
}

export async function createTask(formData: FormData) {
  const user = await requireAuth(); if (user.role === Role.CLIENT) throw new Error("Forbidden")
  const title = requiredString(formData.get("title"), "Title", 200), description = optionalString(formData.get("description"), 5000)
  const priority = enumValue(formData.get("priority") || "MEDIUM", "Priority", TASK_PRIORITIES)
  await prisma.task.create({ data: { title, description, priority, userId: user.id, status: "TODO" } }); revalidatePath("/dashboard/tasks")
}

export async function getNotifications() {
  const user = await requireAuth()
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getUnreadNotificationCount() {
  const user = await requireAuth()
  return prisma.notification.count({ where: { userId: user.id, readAt: null } })
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireAuth()
  const safeId = id(notificationId, "Notification ID")
  await prisma.notification.updateMany({
    where: { id: safeId, userId: user.id },
    data: { readAt: new Date() },
  })
  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuth()
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const user = await requireAuth()
  const safeId = id(notificationId, "Notification ID")
  await prisma.notification.deleteMany({ where: { id: safeId, userId: user.id } })
  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await requireAuth()
  const emailTasks = formData.get("emailTasks") === "on"
  const emailLeaves = formData.get("emailLeaves") === "on"
  const emailAnnouncements = formData.get("emailAnnouncements") === "on"

  await prisma.user.update({
    where: { id: user.id },
    data: { emailTasks, emailLeaves, emailAnnouncements },
  })

  revalidatePath("/dashboard/notifications")
  return { success: true }
}

export async function createNotification({
  userId,
  title,
  message,
  type = "INFO",
  link,
}: {
  userId: string
  title: string
  message: string
  type?: string
  link?: string | null
}) {
  await requireAuth()
  const safeUserId = id(userId, "User ID")
  const safeTitle = requiredString(title, "Notification title", 200)
  const safeMessage = requiredString(message, "Notification message", 4000)
  const safeType = enumValue(type, "Notification type", NOTIFICATION_TYPES)

  const recipient = await prisma.user.findUnique({
    where: { id: safeUserId },
    select: { id: true, name: true, email: true, isActive: true, emailTasks: true, emailLeaves: true, emailAnnouncements: true },
  })
  if (!recipient || !recipient.isActive) throw new Error("Notification recipient is unavailable")

  const notification = await prisma.notification.create({
    data: {
      userId: recipient.id,
      title: safeTitle,
      body: safeMessage,
      type: safeType,
      link: link || null,
    },
  })

  let shouldSendEmail = true
  if (safeType === "TASK") shouldSendEmail = recipient.emailTasks
  else if (safeType === "LEAVE") shouldSendEmail = recipient.emailLeaves
  else shouldSendEmail = recipient.emailAnnouncements

  if (recipient.email && shouldSendEmail) {
    await sendNotificationEmail({
      toEmail: recipient.email,
      recipientName: recipient.name,
      title: safeTitle,
      message: safeMessage,
      type: safeType,
      link: link || null,
    })
  }

  return { success: true, notificationId: notification.id }
}

export async function broadcastNotificationToAll(formData: FormData) {
  const actor = await requireAuth()
  if (!BROADCAST_ROLES.includes(actor.role)) throw new Error("Only management roles can broadcast notifications")

  const title = requiredString(formData.get("title"), "Title", 200)
  const message = requiredString(formData.get("message"), "Message", 4000)
  const type = enumValue(formData.get("type") || "INFO", "Notification type", NOTIFICATION_TYPES)
  const link = optionalString(formData.get("link"), 500)

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, emailTasks: true, emailLeaves: true, emailAnnouncements: true },
  })

  await prisma.notification.createMany({
    data: users.map((user) => ({ userId: user.id, title, body: message, type, link: link || null })),
  })

  for (const user of users) {
    let shouldSendEmail = true
    if (type === "TASK") shouldSendEmail = user.emailTasks
    else if (type === "LEAVE") shouldSendEmail = user.emailLeaves
    else shouldSendEmail = user.emailAnnouncements

    if (user.email && shouldSendEmail) {
      try {
        await sendNotificationEmail({
          toEmail: user.email,
          recipientName: user.name,
          title,
          message,
          type,
          link: link || null,
        })
      } catch (error) {
        console.error(`[NOTIFICATION EMAIL ERROR] ${user.email}`, error)
      }
    }
  }

  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
  return { success: true, totalSent: users.length }
}

export async function getUpcomingCalendarEvents() {
  const user = await requireAuth();
  return prisma.calendarEvent.findMany({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    take: 10,
  });
}
