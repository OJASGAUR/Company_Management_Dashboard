import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Cleaning up existing data...')
  // Clear everything except users to avoid duplicate key errors on seed
  await prisma.timeLog.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.leave.deleteMany({})
  await prisma.attendance.deleteMany({})
  await prisma.asset.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.client.deleteMany({})
  await prisma.invoice.deleteMany({})
  await prisma.domain.deleteMany({})

  const presentationUsers = [
    { id: 'SA00001', email: 'ojasgaur.dev@gmail.com', name: 'Super Admin', role: 'SUPER_ADMIN', plainPass: 'SuperSecret123!' },
    { id: 'DIR1001', email: 'director@company.com', name: 'Director', role: 'DIRECTOR', plainPass: 'DirectorPass2026' },
    { id: 'HR23894', email: 'hr@company.com', name: 'HR Manager', role: 'HR', plainPass: 'HRsecure$44' },
    { id: 'OPS4001', email: 'operations@company.com', name: 'Operations Manager', role: 'OPERATIONS_MANAGER', plainPass: 'OpsCommand#9' },
    { id: 'TL90871', email: 'tl@company.com', name: 'Team Lead', role: 'TEAM_LEAD', plainPass: 'LeadTheWay1' },
    { id: 'ACC8001', email: 'accounts@company.com', name: 'Finance Accounts', role: 'ACCOUNTS', plainPass: 'Finance2026$' },
    { id: 'DEV5001', email: 'developer@company.com', name: 'Senior Developer', role: 'DEVELOPER', plainPass: 'CodeMaster99' },
    { id: 'DES6001', email: 'designer@company.com', name: 'UI/UX Designer', role: 'DESIGNER', plainPass: 'PixelPerfect!' },
    { id: 'QA70001', email: 'tester@company.com', name: 'QA Tester', role: 'TESTER', plainPass: 'BugHunter202' },
    { id: 'EMP1001', email: 'ojas.gaur2025@vitstudent.ac.in', name: 'Regular Employee 1', role: 'EMPLOYEE', plainPass: 'EmpPass1001' },
    { id: 'EMP1002', email: 'emp2@company.com', name: 'Regular Employee 2', role: 'EMPLOYEE', plainPass: 'EmpPass1002' },
  ]

  console.log('Seeding presentation users...')
  const userIds: Record<string, string> = {}

  for (const u of presentationUsers) {
    const hashedPassword = await bcrypt.hash(u.plainPass, 10)
    const user = await prisma.user.upsert({
      where: { employeeId: u.id },
      update: { email: u.email, role: u.role as any, password: hashedPassword, name: u.name },
      create: { employeeId: u.id, email: u.email, name: u.name, password: hashedPassword, role: u.role as any }
    })
    userIds[u.role] = user.id
    console.log(`Upserted ${u.role}: ${u.id}`)
  }

  console.log('Seeding projects...')
  const project1 = await prisma.project.create({ data: { name: "Global E-Commerce Redesign", description: "Overhauling the main e-commerce platform for better UX and conversion.", clientName: "Acme Corp", status: "ACTIVE", startDate: new Date("2026-08-01"), endDate: new Date("2026-12-01") } })
  const project2 = await prisma.project.create({ data: { name: "Internal HR Portal", description: "Building the internal leave and attendance management system.", clientName: "Internal", status: "PLANNING", startDate: new Date("2026-09-01") } })

  console.log('Seeding tasks...')
  await prisma.task.createMany({ data: [
    { title: "Design homepage mockups", description: "Create 3 variations of the new homepage.", priority: "HIGH", status: "IN_PROGRESS", userId: userIds['DESIGNER'], projectId: project1.id },
    { title: "Setup database schema", description: "Initial Prisma schema setup.", priority: "CRITICAL", status: "COMPLETED", userId: userIds['DEVELOPER'], projectId: project1.id },
    { title: "Write E2E tests", description: "Cypress tests for checkout flow.", priority: "MEDIUM", status: "TODO", userId: userIds['TESTER'], projectId: project1.id },
    { title: "Review Q3 Budget", description: "Review and approve Q3 departmental budgets.", priority: "HIGH", status: "IN_REVIEW", userId: userIds['ACCOUNTS'] },
    { title: "Conduct interviews", description: "Interview candidates for junior frontend role.", priority: "MEDIUM", status: "TODO", userId: userIds['HR'] }
  ] })

  console.log('Seeding attendance & leaves...')
  const now = new Date()
  await prisma.attendance.create({ data: { userId: userIds['DEVELOPER'], date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 0, 0), checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 17, 30, 0), status: "PRESENT" } })
  await prisma.leave.create({ data: { userId: userIds['DESIGNER'], type: "CASUAL", startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), reason: "Family trip", status: "PENDING" } })
  await prisma.leave.create({ data: { userId: userIds['DEVELOPER'], type: "SICK", startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8), reason: "Viral fever", status: "APPROVED" } })

  console.log('Seeding assets, events, clients, invoices...')
  await prisma.asset.create({ data: { name: "MacBook Pro M3", type: "LAPTOP", status: "ASSIGNED", assignedToId: userIds['DEVELOPER'] } })
  await prisma.asset.create({ data: { name: "Dell UltraSharp 32", type: "MONITOR", status: "AVAILABLE" } })
  await prisma.event.create({ data: { title: "Q3 All Hands Meeting", date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2), type: "MEETING" } })
  await prisma.event.create({ data: { title: "Company Anniversary", date: new Date(now.getFullYear(), 10, 15), type: "HOLIDAY" } })
  await prisma.client.create({ data: { name: "Jane Smith", company: "Acme Corp", email: "jane@acmecorp.com" } })
  await prisma.invoice.create({ data: { amount: 15000.00, status: "UNPAID", dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) } })
  await prisma.invoice.create({ data: { amount: 4500.50, status: "PAID", dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15) } })
  await prisma.domain.create({ data: { url: "company-internal.com", provider: "AWS Route53", expiryDate: new Date(2027, 5, 1), status: "ACTIVE" } })
  console.log('Database fully seeded with realistic data!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
