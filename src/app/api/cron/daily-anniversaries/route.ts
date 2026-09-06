import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotificationEmail } from "@/lib/email"

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get("authorization") === `Bearer ${secret}`
}

function sameMonthDay(date: Date, now: Date) {
  return date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const users = await prisma.user.findMany({
    where: { isActive: true, OR: [{ dateOfBirth: { not: null } }, { joiningDate: { not: null } }] },
    select: { id: true, name: true, email: true, dateOfBirth: true, joiningDate: true, emailAnnouncements: true },
  })

  let sent = 0
  for (const user of users) {
    const events: Array<{ kind: string; title: string; message: string; key: string }> = []
    if (user.dateOfBirth && sameMonthDay(user.dateOfBirth, now)) {
      events.push({ kind: "birthday", title: `Happy Birthday, ${user.name || "Team Member"}!`, message: `Wishing you a wonderful birthday from the entire team.`, key: `birthday:${user.id}:${now.getFullYear()}` })
    }
    if (user.joiningDate && sameMonthDay(user.joiningDate, now)) {
      const years = now.getFullYear() - user.joiningDate.getFullYear()
      events.push({ kind: "anniversary", title: `Happy Work Anniversary, ${user.name || "Team Member"}!`, message: `Thank you for ${years || 1} year${(years || 1) === 1 ? "" : "s"} with the organization.`, key: `anniversary:${user.id}:${now.getFullYear()}` })
    }

    for (const event of events) {
      const created = await prisma.notification.createMany({
        data: [{ userId: user.id, title: event.title, body: event.message, type: "SUCCESS", link: "/dashboard", dedupeKey: event.key }],
        skipDuplicates: true,
      })
      if (created.count === 0) continue
      sent += 1
      if (user.email && user.emailAnnouncements) {
        await sendNotificationEmail({ toEmail: user.email, recipientName: user.name, title: event.title, message: event.message, type: "SUCCESS", link: "/dashboard" }).catch(() => undefined)
      }
    }
  }

  return NextResponse.json({ success: true, processedUsers: users.length, notificationsCreated: sent })
}
