"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { requireAuth } from "@/lib/auth/require-auth"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import bcrypt from 'bcryptjs'

export async function getDashboardStats() {
  const user = await requireAuth()
  const isAdmin = ['SUPER_ADMIN', 'DIRECTOR', 'HR', 'OPERATIONS_MANAGER', 'TEAM_LEAD'].includes(user.role)

  let todaysAttendance = null
  let activeTasks = 0
  let pendingLeaves = 0
  let totalEmployees = 0

  if (isAdmin) {
    activeTasks = await prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } })
    pendingLeaves = await prisma.leave.count({ where: { status: 'PENDING' } })
    totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } })
  } else {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    todaysAttendance = await prisma.attendance.findFirst({
      where: { userId: user.id, date: { gte: startOfDay } }
    })

    activeTasks = await prisma.task.count({
      where: { userId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } }
    })
  }

  return { user, isAdmin, todaysAttendance, activeTasks, pendingLeaves, totalEmployees }
}

export async function punchIn() {
  const user = await requireAuth()
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const existing = await prisma.attendance.findFirst({
    where: { userId: user.id, date: { gte: startOfDay } }
  })

  if (existing) throw new Error("Already punched in today")

  await prisma.attendance.create({
    data: {
      userId: user.id,
      date: now,
      checkIn: now,
      status: now.getHours() > 10 ? "LATE" : "PRESENT"
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/attendance')
  return { success: true }
}

export async function punchOut() {
  const user = await requireAuth()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const existing = await prisma.attendance.findFirst({
    where: { userId: user.id, date: { gte: startOfDay } }
  })

  if (!existing || existing.checkOut) throw new Error("Cannot punch out")

  await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/attendance')
  return { success: true }
}

export async function getAttendanceHistory() {
  const user = await requireAuth()
  return prisma.attendance.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 30
  })
}

export async function getTasks() {
  const user = await requireAuth()
  return prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  })
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const user = await requireAuth()

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error("Task not found")

  const canManageAllTasks = permissions.assignTasks.includes(user.role as typeof permissions.assignTasks[number])
  if (task.userId !== user.id && !canManageAllTasks) {
    throw new Error("Forbidden")
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus }
  })

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function applyLeave(formData: FormData) {
  const user = await requireAuth()

  const type = formData.get("type") as string
  const startDate = new Date(formData.get("startDate") as string)
  const endDate = new Date(formData.get("endDate") as string)
  const reason = formData.get("reason") as string

  await prisma.leave.create({
    data: { userId: user.id, type, startDate, endDate, reason, status: "PENDING" }
  })

  revalidatePath('/dashboard/leaves')
  revalidatePath('/dashboard')
}

export async function assignTask(formData: FormData) {
  const actor = await requireRole(permissions.assignTasks)

  const title = formData.get("title") as string
  const projectId = formData.get("projectId") as string
  const userId = formData.get("userId") as string
  const priority = (formData.get("priority") as string) || "MEDIUM"
  const deadline = formData.get("deadline") as string
  const description = formData.get("description") as string

  const assignee = await prisma.user.findUnique({ where: { id: userId } })
  if (!assignee) throw new Error("Assignee not found")

  await prisma.task.create({
    data: {
      title,
      description,
      priority: priority as any,
      deadline: deadline ? new Date(deadline) : null,
      userId,
      assignedById: actor.id,
      projectId: projectId || null,
      status: "TODO"
    }
  })

  revalidatePath('/dashboard/operations')
  revalidatePath('/dashboard/tasks')
}

export async function createEmployee(formData: FormData) {
  await requireRole(permissions.manageUsers)

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const employeeId = formData.get("employeeId") as string
  const role = formData.get("role") as any
  const department = formData.get("department") as string
  const rawPassword = formData.get("password") as string

  if (!rawPassword) throw new Error("Password is required")

  const hashedPassword = await bcrypt.hash(rawPassword, 10)

  await prisma.user.create({
    data: { name, email, employeeId, role, department, password: hashedPassword }
  })

  revalidatePath('/dashboard/operations')
}

export async function updateLeaveStatus(formData: FormData) {
  await requireRole(permissions.approveLeaves)

  const leaveId = formData.get("leaveId") as string
  const status = formData.get("status") as string

  await prisma.leave.update({ where: { id: leaveId }, data: { status: status as any } })

  revalidatePath('/dashboard/leaves')
  revalidatePath('/dashboard')
}

export async function createProject(formData: FormData) {
  await requireRole(permissions.manageProjects)

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const clientName = formData.get("clientName") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string

  await prisma.project.create({
    data: {
      name,
      description,
      clientName,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: "PLANNING"
    }
  })

  revalidatePath('/dashboard/projects')
}

export async function createTask(formData: FormData) {
  const user = await requireAuth()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = (formData.get("priority") as string) || "MEDIUM"

  await prisma.task.create({
    data: { title, description, priority: priority as any, userId: user.id, status: "TODO" }
  })

  revalidatePath('/dashboard/tasks')
}
