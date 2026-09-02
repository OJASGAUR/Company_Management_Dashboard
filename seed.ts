import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing records
  await prisma.calendarEvent.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('emp123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@company.com',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // Create some initial events
  const today = new Date();
  await prisma.calendarEvent.createMany({
    data: [
      {
        title: 'Company All Hands',
        description: 'Monthly company all hands meeting',
        category: 'COMPANY_EVENT',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 30),
      },
      {
        title: 'Project Alpha Deadline',
        description: 'Final submission for Project Alpha',
        category: 'PROJECT_DEADLINE',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        allDay: true,
      }
    ]
  });

  console.log('Database seeded successfully with user and calendar events.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
