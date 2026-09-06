import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
  const [users, projects, tasks, clients, invoices, payments, attendances, leaves, domains, files, messages, events] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, department: true, designation: true, employeeId: true, isActive: true, joiningDate: true, dateOfBirth: true, createdAt: true, updatedAt: true } }),
    prisma.project.findMany(),
    prisma.task.findMany(),
    prisma.client.findMany(),
    prisma.invoice.findMany(),
    prisma.payment.findMany(),
    prisma.attendance.findMany(),
    prisma.leave.findMany(),
    prisma.domain.findMany(),
    prisma.fileRecord.findMany(),
    prisma.message.findMany(),
    prisma.calendarEvent.findMany(),
  ])

  const payload = { exportedAt: now.toISOString(), period, users, projects, tasks, clients, invoices, payments, attendances, leaves, domains, files, messages, events }
  const snapshot = await prisma.backupSnapshot.upsert({
    where: { period },
    update: { data: payload, createdAt: now },
    create: { period, data: payload },
  })

  return NextResponse.json({ success: true, period, snapshotId: snapshot.id, recordCounts: { users: users.length, projects: projects.length, tasks: tasks.length, clients: clients.length, invoices: invoices.length, payments: payments.length } })
}
