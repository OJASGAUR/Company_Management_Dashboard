const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create or find Admin User
  let admin = await prisma.user.findUnique({ where: { email: 'admin@company.com' } })
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@company.com',
        name: 'Admin User',
        password: 'password123', // In a real app this would be hashed
        role: 'SUPER_ADMIN'
      }
    })
    console.log('Created admin user.')
  }

  // Check tasks for admin
  const tasksCount = await prisma.task.count({ where: { userId: admin.id } })
  if (tasksCount === 0) {
    await prisma.task.createMany({
      data: [
        { userId: admin.id, title: 'Review Q3 Financial Reports', description: 'Analyze the quarterly reports from the accounts team.', status: 'TODO', priority: 'HIGH' },
        { userId: admin.id, title: 'Approve Leave Requests', description: 'Check pending leave requests for the design team.', status: 'IN_PROGRESS', priority: 'MEDIUM' },
        { userId: admin.id, title: 'Update Onboarding Docs', description: 'Update the new joiner documentation with the latest HR policies.', status: 'TODO', priority: 'LOW' },
        { userId: admin.id, title: 'Finalize Q4 Roadmap', description: 'Complete the roadmap presentation for the board meeting.', status: 'IN_REVIEW', priority: 'CRITICAL' },
        { userId: admin.id, title: 'Server Maintenance Check', description: 'Verify that the new socket server is stable under load.', status: 'COMPLETED', priority: 'MEDIUM' },
      ]
    })
    console.log('Created dummy tasks.')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
