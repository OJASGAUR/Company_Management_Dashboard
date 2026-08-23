"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { date, email, enumValue, id, optionalDate, optionalString, requiredString } from "@/lib/validation"

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"] as const
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
const LEAVE_TYPES = ["CASUAL", "SICK", "PAID", "LOSS_OF_PAY"] as const
const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const
const MANAGER_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR, Role.OPERATIONS_MANAGER, Role.TEAM_LEAD]

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
  const assignee = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isActive: true } })
  if (!assignee || !assignee.isActive) throw new Error("Assignee not found or inactive")
  const projectId = projectIdRaw ? id(projectIdRaw, "Project ID") : null
  if (projectId && !(await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } }))) throw new Error("Project not found")
  await prisma.task.create({ data: { title, description, priority, deadline, userId, assignedById: actor.id, projectId, status: "TODO" } })
  revalidatePath("/dashboard/operations"); revalidatePath("/dashboard/tasks")
}

export async function createEmployee(formData: FormData) {
  await requireRole(permissions.manageUsers)
  const name = requiredString(formData.get("name"), "Name", 120), emailAddress = email(formData.get("email")), employeeId = requiredString(formData.get("employeeId"), "Employee ID", 50)
  const role = enumValue(formData.get("role"), "Role", Object.values(Role)), department = optionalString(formData.get("department"), 120), rawPassword = requiredString(formData.get("password"), "Password", 200)
  if (rawPassword.length < 8) throw new Error("Password must be at least 8 characters")
  if (await prisma.user.findFirst({ where: { OR: [{ email: emailAddress }, { employeeId }] }, select: { id: true } })) throw new Error("Email or employee ID already exists")
  await prisma.user.create({ data: { name, email: emailAddress, employeeId, role, department, password: await bcrypt.hash(rawPassword, 12) } })
  revalidatePath("/dashboard/operations")
}

export async function updateLeaveStatus(formData: FormData) {
  await requireRole(permissions.approveLeaves)
  const leaveId = id(requiredString(formData.get("leaveId"), "Leave ID"), "Leave ID"), status = enumValue(formData.get("status"), "Leave status", LEAVE_STATUSES)
  await prisma.leave.update({ where: { id: leaveId }, data: { status } })
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
