"use server"

import bcrypt from "bcryptjs"
import { createHash } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { requiredString } from "@/lib/validation"

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function getOnboardingInvite(token: string) {
  const safeToken = requiredString(token, "Setup token", 200)
  const record = await prisma.verificationToken.findUnique({ where: { token: hashToken(safeToken) } })

  if (!record || !record.identifier.startsWith("onboarding:") || record.expires <= new Date()) return null

  const userId = record.identifier.slice("onboarding:".length)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, employeeId: true, isActive: true },
  })

  if (!user || !user.isActive) return null

  return user
}

export async function setOnboardingPassword(formData: FormData) {
  const token = requiredString(formData.get("token"), "Setup token", 200)
  const password = requiredString(formData.get("password"), "Password", 200)
  const confirmPassword = requiredString(formData.get("confirmPassword"), "Confirm password", 200)

  if (password.length < 8) return { success: false, error: "Password must be at least 8 characters." }
  if (password !== confirmPassword) return { success: false, error: "Passwords do not match." }

  const record = await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } })
  if (!record || !record.identifier.startsWith("onboarding:") || record.expires <= new Date()) {
    return { success: false, error: "This setup link is invalid or has expired." }
  }

  const userId = record.identifier.slice("onboarding:".length)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isActive: true } })
  if (!user || !user.isActive) return { success: false, error: "This account is unavailable." }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(password, 12) },
  })

  await prisma.verificationToken.delete({ where: { token: record.token } })

  return { success: true }
}
