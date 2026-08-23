"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { requireRole } from "@/lib/auth/require-role"
import { permissions } from "@/lib/auth/permissions"
import { date, email, enumValue, optionalString, requiredString } from "@/lib/validation"

export async function createUser(formData: FormData) {
  await requireRole(permissions.manageUsers)

  const name = requiredString(formData.get("name"), "Name", 120)
  const emailAddress = email(formData.get("email"))
  const password = requiredString(formData.get("password"), "Password", 200)
  const role = enumValue(formData.get("role"), "Role", Object.values(Role))
  const department = optionalString(formData.get("department"), 120)
  const designation = optionalString(formData.get("designation"), 120)
  const joiningDateRaw = formData.get("joiningDate")
  const joiningDate = joiningDateRaw ? date(joiningDateRaw, "Joining date") : null

  if (password.length < 8) throw new Error("Password must be at least 8 characters")

  const existingUser = await prisma.user.findUnique({ where: { email: emailAddress } })
  if (existingUser) throw new Error("User with this email already exists")

  const hashedPassword = await bcrypt.hash(password, 12)
  const employeeId = `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

  await prisma.user.create({
    data: {
      name,
      email: emailAddress,
      password: hashedPassword,
      role,
      department,
      designation,
      employeeId,
      joiningDate,
    },
  })

  revalidatePath("/admin/users")
  redirect("/admin/users")
}
