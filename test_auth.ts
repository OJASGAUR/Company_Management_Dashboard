import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testAuth() {
  const identifier = "SA00001"
  const password = "password123"

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { employeeId: identifier }
      ]
    }
  })

  console.log("User found:", user ? "Yes" : "No")
  
  if (user) {
    console.log("User email:", user.email)
    console.log("User employeeId:", user.employeeId)
    console.log("User password hash:", user.password)
    
    if (user.password) {
      const match = await bcrypt.compare(password, user.password)
      console.log("Password match:", match)
    }
  }
}

testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
