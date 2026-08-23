"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { recordAudit } from "@/lib/audit"
import { email, requiredString } from "@/lib/validation"

export async function bootstrapAdmin(formData: FormData) {
  const expectedSecret = process.env.BOOTSTRAP_ADMIN_SECRET
  if (!expectedSecret) throw new Error("Admin bootstrap is not configured on this deployment")

  const suppliedSecret = requiredString(formData.get("setupSecret"), "Setup secret", 256)
  if (suppliedSecret !== expectedSecret) throw new Error("Invalid setup secret")

  const superAdminCount = await prisma.user.count({ where: { role: Role.SUPER_ADMIN } })
  if (superAdminCount > 0) throw new Error("An administrator account already exists. Bootstrap is disabled.")

  const name = requiredString(formData.get("name"), "Name", 120)
  const emailAddress = email(formData.get("email"))
  const password = requiredString(formData.get("password"), "Password", 200)
  if (password.length < 10) throw new Error("Password must be at least 10 characters")

  const existingUser = await prisma.user.findFirst({ where: { email: emailAddress }, select: { id: true } })
  if (existingUser) throw new Error("That email is already registered")

  const generatedEmployeeId = `ADM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const created = await prisma.user.create({
    data: {
      name,
      email: emailAddress,
      password: await bcrypt.hash(password, 12),
      role: Role.SUPER_ADMIN,
      employeeId: generatedEmployeeId,
      isActive: true,
      onboardingStatus: "COMPLETED",
    },
    select: { id: true },
  })

  await recordAudit({
    action: "BOOTSTRAP_ADMIN",
    entity: "User",
    entityId: created.id,
    metadata: { employeeId: generatedEmployeeId },
  })

  redirect(`/?bootstrap=success&employeeId=${encodeURIComponent(generatedEmployeeId)}`)
}
