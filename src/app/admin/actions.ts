"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as Role
  const department = formData.get("department") as string
  const designation = formData.get("designation") as string
  const joiningDate = formData.get("joiningDate") as string
  
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Generate employee ID if it's an employee type role
  const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      department: department || null,
      designation: designation || null,
      employeeId,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
    }
  })

  revalidatePath("/admin/users")
  redirect("/admin/users")
}
