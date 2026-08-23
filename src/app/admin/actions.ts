"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { requireRole } from "@/lib/auth/require-role"
import { permissions, canGrantRole } from "@/lib/auth/permissions"
import { encryptSecret } from "@/lib/crypto"
import { recordAudit } from "@/lib/audit"
import { notifyUser } from "@/lib/notifications"
import { email, enumValue, id, optionalDate, optionalString, requiredString } from "@/lib/validation"

const ONBOARDING_IN_PROGRESS = "IN_PROGRESS"
const ONBOARDING_COMPLETED = "COMPLETED"

export async function createUser(formData: FormData) {
  const actor = await requireRole(permissions.manageUsers)
  const name = requiredString(formData.get("name"), "Name", 120)
  const emailAddress = email(formData.get("email"))
  const password = requiredString(formData.get("password"), "Password", 200)
  const role = enumValue(formData.get("role"), "Role", Object.values(Role))
  if (!canGrantRole(actor.role, role)) throw new Error("You are not allowed to grant this role")
  const department = optionalString(formData.get("department"), 120)
  const designation = optionalString(formData.get("designation"), 120)
  const joiningDate = optionalDate(formData.get("joiningDate"), "Joining date")
  const companyEmail = formData.get("companyEmail") ? email(formData.get("companyEmail")) : null
  const phone = optionalString(formData.get("phone"), 40)
  const personalEmail = formData.get("personalEmail") ? email(formData.get("personalEmail")) : null
  const dateOfBirth = optionalDate(formData.get("dateOfBirth"), "Date of birth")
  const gender = optionalString(formData.get("gender"), 40)
  const address = optionalString(formData.get("address"), 500)
  const city = optionalString(formData.get("city"), 100)
  const state = optionalString(formData.get("state"), 100)
  const postalCode = optionalString(formData.get("postalCode"), 20)
  const emergencyName = optionalString(formData.get("emergencyName"), 120)
  const emergencyPhone = optionalString(formData.get("emergencyPhone"), 40)
  const education = optionalString(formData.get("education"), 1000)
  const experience = optionalString(formData.get("experience"), 2000)
  const bankAccountName = optionalString(formData.get("bankAccountName"), 120)
  const bankAccountNumberRaw = optionalString(formData.get("bankAccountNumber"), 100)
  const bankName = optionalString(formData.get("bankName"), 120)
  const bankIfsc = optionalString(formData.get("bankIfsc"), 30)
  const upiId = optionalString(formData.get("upiId"), 120)

  if (password.length < 8) throw new Error("Password must be at least 8 characters")
  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email: emailAddress }, ...(companyEmail ? [{ companyEmail }] : [])] }, select: { id: true } })
  if (existingUser) throw new Error("Email or company email already exists")
  const hashedPassword = await bcrypt.hash(password, 12)
  const employeeId = `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const created = await prisma.user.create({ data: { name, email: emailAddress, password: hashedPassword, role, department, designation, employeeId, joiningDate, isActive: true, onboardingStatus: ONBOARDING_IN_PROGRESS, companyEmail, phone, personalEmail, dateOfBirth, gender, address, city, state, postalCode, emergencyName, emergencyPhone, education, experience, bankAccountName, bankAccountNumber: bankAccountNumberRaw ? encryptSecret(bankAccountNumberRaw) : null, bankName, bankIfsc, upiId }, select: { id: true, employeeId: true } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "CREATE", entity: "User", entityId: created.id, metadata: { employeeId: created.employeeId, role } }), notifyUser(created.id, "Welcome to the company portal", "Your employee account has been created. Complete your onboarding checklist to finish setup.")])
  revalidatePath("/admin/users")
  redirect("/admin/users")
}

export async function setUserActive(formData: FormData) {
  const actor = await requireRole(permissions.manageUsers)
  const userId = id(requiredString(formData.get("userId"), "User ID"), "User ID")
  if (userId === actor.id) throw new Error("You cannot disable your own account")
  const active = formData.get("active") === "true"
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!target) throw new Error("User not found")
  if (!canGrantRole(actor.role, target.role)) throw new Error("You are not allowed to change this account")
  await prisma.user.update({ where: { id: userId }, data: { isActive: active } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: active ? "ENABLE" : "DISABLE", entity: "User", entityId: userId })])
  revalidatePath("/admin/users")
}

export async function completeOnboarding(formData: FormData) {
  const actor = await requireRole(permissions.manageUsers)
  const userId = id(requiredString(formData.get("userId"), "User ID"), "User ID")
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!target || !canGrantRole(actor.role, target.role)) throw new Error("You are not allowed to update this account")
  await prisma.user.update({ where: { id: userId }, data: { onboardingStatus: ONBOARDING_COMPLETED } })
  await Promise.allSettled([recordAudit({ actorId: actor.id, action: "COMPLETE_ONBOARDING", entity: "User", entityId: userId })])
  revalidatePath("/admin/users")
}
