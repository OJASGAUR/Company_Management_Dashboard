"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/require-auth"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import {
  LeaveStatus,
  LeaveType,
  ProjectStatus,
  Role,
  TaskPriority,
  TaskStatus,
} from "@prisma/client"
import {
  date,
  email,
  enumValue,
  id,
  optionalDate,
  optionalString,
  requiredString,
} from "@/lib/validation"

const TASK_STATUSES = Object.values(TaskStatus)
const TASK_PRIORITIES = Object.values(TaskPriority)
const LEAVE_TYPES = Object.values(LeaveType)
const LEAVE_STATUSES = Object.values(LeaveStatus)

export async function getDashboardStats() {
  const user = await requireAuth()
  const isManager = [
    Role.SUPER_ADMIN,
    Role.DIRECTOR,
    Role.HR,
    Role.OPERATIONS_MANAGER,
    Role.TEAM_LEAD,
  ].includes(user.role)

  let todaysAttendance = null
  let activeTasks = 0
  let pendingLeaves = 0
  let totalEmployees = 0

  if (isManager) {
    activeTasks = await prisma.task.count({ where: { status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } } })
    pendingLeaves = await prisma.leave.count({ where: { status: LeaveStatus.PENDING } })
    totalEmployees = await prisma.user.count({ where: { role: Role.EMPLOYEE } })
  } else {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    todaysAttendance = await prisma.attendance.findFirst({
      where: { userId: user.id, date: { gte: startOfDay } },
    })
    activeTasks = await prisma.task.count({
      where: { userId: user.id, status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } },
    })
  }

  return { user, isManager, todaysAttendance, activeTasks, pendingLeaves, totalEmployees }
}

export async function punchIn() {
  const user = await requireAuth()
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const existing = await prisma.attendance.findFirst({
    where: { userId: user.id, date: { gte: startOfDay } },
  })
  if (existing) throw new Error("Already punched in today")

  await prisma.attendance.create({
    data: {
      userId: user.id,
      date: now,
      checkIn: now,
      status: now.getHours() > 10 ? "LATE" : "PRESENT",
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/attendance")
  return { success: true }
}

export async function punchOut() {
  const user = await requireAuth()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const existing = await prisma.attendance.findFirst({
    where: { userId: user.id, date: { gte: startOfDay } },
  })
  if (!existing || existing.checkOut) throw new Error("Cannot punch out")

  await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/attendance")
  return { success: true }
}

export async function getAttendanceHistory() {
  const user = await requireAuth()
  return prisma.attendance.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 30,
  })
}

export async function getTasks() {
  const user = await requireAuth()
  return prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const user = await requireAuth()
  const safeTaskId = id(taskId, "Task ID")
  const status = enumValue(newStatus, "Task status", TASK_STATUSES)

  const task = await prisma.task.findUnique({ where: { id: safeTaskId } })
  if (!task) throw new Error("Task not found")

  const canManageAllTasks = permissions.assignTasks.includes(user.role as typeof permissions.assignTasks[number])
  if (task.userId !== user.id && !canManageAllTasks) throw new Error("Forbidden")

  await prisma.task.update({ where: { id: safeTaskId }, data: { status } })
  revalidatePath("/dashboard/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function applyLeave(formData: FormData) {
  const user = await requireAuth()
  const type = enumValue(formData.get("type"), "Leave type", LEAVE_TYPES)
  const startDate = date(formData.get("startDate"), "Start date")
  const endDate = date(formData.get("endDate"), "End date")
  const reason = requiredString(formData.get("reason"), "Reason", 2000)

  if (endDate < startDate) throw new Error("End date cannot be before start date")

  await prisma.leave.create({
    data: { userId: user.id, type, startDate, endDate, reason, status: LeaveStatus.PENDING },
  })

  revalidatePath("/dashboard/leaves")
  revalidatePath("/dashboard")
}

export async function assignTask(formData: FormData) {
  const actor = await requireRole(permissions.assignTasks)
  const title = requiredString(formData.get("title"), "Title", 200)
  const projectIdRaw = optionalString(formData.get("projectId"), 100)
  const userId = id(requiredString(formData.get("userId"), "Assignee"), "Assignee")
  const priority = enumValue(formData.get("priority") || TaskPriority.MEDIUM, "Priority", TASK_PRIORITIES)
  const deadline = optionalDate(formData.get("deadline"), "Deadline")
  const description = optionalString(formData.get("description"), 5000)

  const assignee = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!assignee) throw new Error("Assignee not found")

  const projectId = projectIdRaw ? id(projectIdRaw, "Project ID") : null
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })
    if (!project) throw new Error("Project not found")
  }

  await prisma.task.create({
    data: {
      title,
      description,
      priority,
      deadline,
      userId,
      assignedById: actor.id,
      projectId,
      status: TaskStatus.TODO,
    },
  })

  revalidatePath("/dashboard/operations")
  revalidatePath("/dashboard/tasks")
}

export async function createEmployee(formData: FormData) {
  await requireRole(permissions.manageUsers)
  const name = requiredString(formData.get("name"), "Name", 120)
  const emailAddress = email(formData.get("email"))
  const employeeId = requiredString(formData.get("employeeId"), "Employee ID", 50)
  const role = enumValue(formData.get("role"), "Role", Object.values(Role))
  const department = optionalString(formData.get("department"), 120)
  const rawPassword = requiredString(formData.get("password"), "Password", 200)

  if (rawPassword.length < 8) throw new Error("Password must be at least 8 characters")

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: emailAddress }, { employeeId }] },
    select: { id: true },
  })
  if (existing) throw new Error("Email or employee ID already exists")

  const hashedPassword = await bcrypt.hash(rawPassword, 12)
  await prisma.user.create({
    data: { name, email: emailAddress, employeeId, role, department, password: hashedPassword },
  })

  revalidatePath("/dashboard/operations")
  revalidatePath("/admin/users")
}

export async function updateLeaveStatus(formData: FormData) {
  await requireRole(permissions.approveLeaves)
  const leaveId = id(requiredString(formData.get("leaveId"), "Leave ID"), "Leave ID")
  const status = enumValue(formData.get("status"), "Leave status", LEAVE_STATUSES)

  await prisma.leave.update({ where: { id: leaveId }, data: { status } })
  revalidatePath("/dashboard/leaves")
  revalidatePath("/dashboard")
}

export async function createProject(formData: FormData) {
  await requireRole(permissions.manageProjects)
  const name = requiredString(formData.get("name"), "Project name", 200)
  const description = optionalString(formData.get("description"), 5000)
  const clientName = optionalString(formData.get("clientName"), 200)
  const startDate = optionalDate(formData.get("startDate"), "Start date")
  const endDate = optionalDate(formData.get("endDate"), "End date")

  if (startDate && endDate && endDate < startDate) throw new Error("End date cannot be before start date")

  await prisma.project.create({
    data: { name, description, clientName, startDate, endDate, status: ProjectStatus.PLANNING },
  })
  revalidatePath("/dashboard/projects")
}

export async function createTask(formData: FormData) {
  const user = await requireAuth()
  const title = requiredString(formData.get("title"), "Title", 200)
  const description = optionalString(formData.get("description"), 5000)
  const priority = enumValue(formData.get("priority") || TaskPriority.MEDIUM, "Priority", TASK_PRIORITIES)

  await prisma.task.create({
    data: { title, description, priority, userId: user.id, status: TaskStatus.TODO },
  })
  revalidatePath("/dashboard/tasks")
}
