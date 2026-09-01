import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('EmpPass1001', 10);

  // Insert or Update Your User Credential Record
  const user = await prisma.user.upsert({
    where: { email: 'ojas.gaur2025@vitstudent.ac.in' },
    update: {
      name: 'Ojas Gaur',
      role: Role.EMPLOYEE,
    },
    create: {
      employeeId: 'EMP1001',
      name: 'Regular Employee 1',
      email: 'ojas.gaur2025@vitstudent.ac.in',
      password: hashedPassword,
      role: Role.EMPLOYEE,
    },
  });

  // Seed Initial Calendar Events
  await prisma.calendarEvent.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Diwali Public Holiday',
        eventType: 'PUBLIC_HOLIDAY',
        startTime: new Date('2026-10-18T00:00:00Z'),
        endTime: new Date('2026-10-26T23:59:59Z'),
        isAllDay: true,
      },
      {
        title: 'Q3 All-Hands Team Meeting',
        eventType: 'TEAM_MEETING',
        startTime: new Date('2026-09-15T10:00:00Z'),
        endTime: new Date('2026-09-15T11:30:00Z'),
        isAllDay: false,
      },
    ],
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
