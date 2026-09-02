import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🧹 Cleaning up existing data...')
  await prisma.timeLog.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.auditLog.deleteMany({})
  await prisma.fileRecord.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.leave.deleteMany({})
  await prisma.attendance.deleteMany({})
  await prisma.asset.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.invoice.deleteMany({})
  await prisma.client.deleteMany({})
  await prisma.domain.deleteMany({})

  // ─── USERS ─────────────────────────────────────────────────────────
  const presentationUsers = [
    { id: 'SA00001', email: 'ojasgaur.dev@gmail.com', name: 'Super Admin', role: 'SUPER_ADMIN', plainPass: 'SuperSecret123!', department: 'Executive', designation: 'Chief Technology Officer', phone: '+91-9876543210', gender: 'Male', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', education: 'B.Tech Computer Science, IIT Delhi', experience: '12 years' },
    { id: 'DIR1001', email: 'director@company.com', name: 'Priya Mehta', role: 'DIRECTOR', plainPass: 'DirectorPass2026', department: 'Executive', designation: 'Managing Director', phone: '+91-9876543211', gender: 'Female', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', education: 'MBA, IIM Ahmedabad', experience: '15 years' },
    { id: 'HR23894', email: 'hr@company.com', name: 'Ananya Verma', role: 'HR', plainPass: 'HRsecure$44', department: 'Human Resources', designation: 'HR Manager', phone: '+91-9876543212', gender: 'Female', city: 'Delhi', state: 'Delhi', postalCode: '110001', education: 'MBA HR, XLRI Jamshedpur', experience: '8 years' },
    { id: 'OPS4001', email: 'operations@company.com', name: 'Rajesh Kumar', role: 'OPERATIONS_MANAGER', plainPass: 'OpsCommand#9', department: 'Operations', designation: 'Operations Manager', phone: '+91-9876543213', gender: 'Male', city: 'Hyderabad', state: 'Telangana', postalCode: '500001', education: 'B.Tech Mechanical, NIT Trichy', experience: '10 years' },
    { id: 'TL90871', email: 'tl@company.com', name: 'Vikram Singh', role: 'TEAM_LEAD', plainPass: 'LeadTheWay1', department: 'Engineering', designation: 'Senior Team Lead', phone: '+91-9876543214', gender: 'Male', city: 'Pune', state: 'Maharashtra', postalCode: '411001', education: 'M.Tech CS, IIIT Hyderabad', experience: '7 years' },
    { id: 'ACC8001', email: 'accounts@company.com', name: 'Meera Krishnan', role: 'ACCOUNTS', plainPass: 'Finance2026$', department: 'Finance', designation: 'Senior Accountant', phone: '+91-9876543215', gender: 'Female', city: 'Chennai', state: 'Tamil Nadu', postalCode: '600001', education: 'CA, ICAI', experience: '9 years' },
    { id: 'DEV5001', email: 'developer@company.com', name: 'Arjun Nair', role: 'DEVELOPER', plainPass: 'CodeMaster99', department: 'Engineering', designation: 'Senior Full-Stack Developer', phone: '+91-9876543216', gender: 'Male', city: 'Kochi', state: 'Kerala', postalCode: '682001', education: 'B.Tech CSE, NIT Calicut', experience: '5 years' },
    { id: 'DES6001', email: 'designer@company.com', name: 'Kavya Sharma', role: 'DESIGNER', plainPass: 'PixelPerfect!', department: 'Design', designation: 'Lead UI/UX Designer', phone: '+91-9876543217', gender: 'Female', city: 'Jaipur', state: 'Rajasthan', postalCode: '302001', education: 'B.Des, NID Ahmedabad', experience: '6 years' },
    { id: 'QA70001', email: 'tester@company.com', name: 'Siddharth Patel', role: 'TESTER', plainPass: 'BugHunter202', department: 'Quality Assurance', designation: 'QA Lead', phone: '+91-9876543218', gender: 'Male', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001', education: 'B.Tech IT, DA-IICT', experience: '4 years' },
    { id: 'EMP1001', email: 'ojas.gaur2025@vitstudent.ac.in', name: 'Ojas Gaur', role: 'EMPLOYEE', plainPass: 'EmpPass1001', department: 'Engineering', designation: 'Junior Developer', phone: '+91-9876543219', gender: 'Male', city: 'Vellore', state: 'Tamil Nadu', postalCode: '632014', education: 'B.Tech CSE, VIT Vellore', experience: '1 year' },
    { id: 'EMP1002', email: 'emp2@company.com', name: 'Neha Gupta', role: 'EMPLOYEE', plainPass: 'EmpPass1002', department: 'Marketing', designation: 'Digital Marketing Executive', phone: '+91-9876543220', gender: 'Female', city: 'Lucknow', state: 'Uttar Pradesh', postalCode: '226001', education: 'BBA Marketing, Symbiosis', experience: '2 years' },
    { id: 'DEV5002', email: 'dev2@company.com', name: 'Rohan Deshmukh', role: 'DEVELOPER', plainPass: 'DevSecure#22', department: 'Engineering', designation: 'Backend Developer', phone: '+91-9876543221', gender: 'Male', city: 'Nagpur', state: 'Maharashtra', postalCode: '440001', education: 'B.Tech CSE, VNIT Nagpur', experience: '3 years' },
    { id: 'DEV5003', email: 'dev3@company.com', name: 'Shreya Iyer', role: 'DEVELOPER', plainPass: 'FrontEnd@88', department: 'Engineering', designation: 'Frontend Developer', phone: '+91-9876543222', gender: 'Female', city: 'Bangalore', state: 'Karnataka', postalCode: '560034', education: 'B.Tech CSE, PES University', experience: '2 years' },
    { id: 'DES6002', email: 'designer2@company.com', name: 'Aditya Rao', role: 'DESIGNER', plainPass: 'Design$Flow1', department: 'Design', designation: 'Graphic Designer', phone: '+91-9876543223', gender: 'Male', city: 'Bangalore', state: 'Karnataka', postalCode: '560078', education: 'B.Des Visual Communication, Srishti', experience: '3 years' },
    { id: 'EMP1003', email: 'emp3@company.com', name: 'Tanvi Joshi', role: 'EMPLOYEE', plainPass: 'EmpPass1003', department: 'Customer Support', designation: 'Support Specialist', phone: '+91-9876543224', gender: 'Female', city: 'Indore', state: 'Madhya Pradesh', postalCode: '452001', education: 'BA English, Devi Ahilya Vishwavidyalaya', experience: '2 years' },
  ]

  console.log('👤 Seeding users...')
  const userIds: Record<string, string> = {}
  const now = new Date()

  for (const u of presentationUsers) {
    const hashedPassword = await bcrypt.hash(u.plainPass, 10)
    const user = await prisma.user.upsert({
      where: { employeeId: u.id },
      update: { email: u.email, role: u.role as any, password: hashedPassword, name: u.name, department: u.department, designation: u.designation, phone: u.phone, gender: u.gender, city: u.city, state: u.state, postalCode: u.postalCode, education: u.education, experience: u.experience, onboardingStatus: 'COMPLETED', joiningDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) },
      create: { employeeId: u.id, email: u.email, name: u.name, password: hashedPassword, role: u.role as any, department: u.department, designation: u.designation, phone: u.phone, gender: u.gender, city: u.city, state: u.state, postalCode: u.postalCode, education: u.education, experience: u.experience, onboardingStatus: 'COMPLETED', joiningDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) }
    })
    userIds[u.id] = user.id
    console.log(`  ✅ Upserted ${u.role}: ${u.name} (${u.id})`)
  }

  // Set manager relationships
  await prisma.user.update({ where: { id: userIds['TL90871'] }, data: { managerId: userIds['DIR1001'] } })
  await prisma.user.update({ where: { id: userIds['DEV5001'] }, data: { managerId: userIds['TL90871'] } })
  await prisma.user.update({ where: { id: userIds['DEV5002'] }, data: { managerId: userIds['TL90871'] } })
  await prisma.user.update({ where: { id: userIds['DEV5003'] }, data: { managerId: userIds['TL90871'] } })
  await prisma.user.update({ where: { id: userIds['DES6001'] }, data: { managerId: userIds['TL90871'] } })
  await prisma.user.update({ where: { id: userIds['DES6002'] }, data: { managerId: userIds['DES6001'] } })
  await prisma.user.update({ where: { id: userIds['QA70001'] }, data: { managerId: userIds['TL90871'] } })
  await prisma.user.update({ where: { id: userIds['EMP1001'] }, data: { managerId: userIds['DEV5001'] } })
  await prisma.user.update({ where: { id: userIds['EMP1002'] }, data: { managerId: userIds['HR23894'] } })
  await prisma.user.update({ where: { id: userIds['EMP1003'] }, data: { managerId: userIds['OPS4001'] } })
  console.log('  ✅ Set manager hierarchies')

  // ─── PROJECTS ──────────────────────────────────────────────────────
  console.log('📂 Seeding projects...')
  const project1 = await prisma.project.create({ data: { name: 'Global E-Commerce Redesign', description: 'Complete overhaul of the flagship e-commerce platform. Includes new product catalog, checkout flow with Stripe/Razorpay integration, admin dashboard, and mobile-responsive storefront. Target: 40% improvement in conversion rates.', clientName: 'Acme Corp', status: 'ACTIVE', startDate: new Date('2026-06-01'), endDate: new Date('2026-12-31') } })
  const project2 = await prisma.project.create({ data: { name: 'Internal HR Portal', description: 'Self-service portal for employees covering leave management, attendance tracking, payroll integration, and performance reviews. Phase 1 focuses on leave and attendance, Phase 2 adds payroll.', clientName: 'Internal', status: 'ACTIVE', startDate: new Date('2026-07-15'), endDate: new Date('2027-02-28') } })
  const project3 = await prisma.project.create({ data: { name: 'FinTrack Mobile App', description: 'Cross-platform mobile application for personal finance tracking. Features include expense categorization via AI, budget planning, bill reminders, and investment portfolio overview. Built with React Native.', clientName: 'FinEdge Technologies', status: 'ACTIVE', startDate: new Date('2026-08-01'), endDate: new Date('2027-01-15') } })
  const project4 = await prisma.project.create({ data: { name: 'Healthcare Patient Portal', description: 'HIPAA-compliant patient portal for MediCare Plus. Appointment scheduling, telemedicine video calls, prescription management, lab reports, and insurance claims tracking.', clientName: 'MediCare Plus', status: 'PLANNING', startDate: new Date('2026-10-01'), endDate: new Date('2027-06-30') } })
  const project5 = await prisma.project.create({ data: { name: 'Smart Warehouse IoT Dashboard', description: 'Real-time IoT monitoring dashboard for warehouse operations. Temperature/humidity sensors, inventory tracking with RFID, automated reorder alerts, and analytics for supply chain optimization.', clientName: 'LogiPrime Solutions', status: 'PLANNING', startDate: new Date('2026-11-01') } })
  const project6 = await prisma.project.create({ data: { name: 'Brand Identity Refresh', description: 'Complete brand refresh including new logo, typography system, color palette, brand guidelines document, social media kit, and marketing collateral templates.', clientName: 'NovaBrand Agency', status: 'COMPLETED', startDate: new Date('2026-03-01'), endDate: new Date('2026-07-30') } })
  const project7 = await prisma.project.create({ data: { name: 'API Gateway Migration', description: 'Migration from monolithic REST API to microservices architecture with Kong API Gateway. Includes service mesh setup, rate limiting, OAuth2 authentication, and comprehensive API documentation.', clientName: 'Internal', status: 'ACTIVE', startDate: new Date('2026-08-15'), endDate: new Date('2026-12-15') } })
  console.log(`  ✅ Created 7 projects`)

  // ─── TASKS ─────────────────────────────────────────────────────────
  console.log('📋 Seeding tasks...')
  const tasks = await Promise.all([
    // E-Commerce project tasks
    prisma.task.create({ data: { title: 'Design homepage hero section', description: 'Create 3 design variations for the homepage hero banner. Include A/B testing variants with different CTA placements. Must support both light and dark themes.', priority: 'HIGH', status: 'COMPLETED', userId: userIds['DES6001'], assignedById: userIds['TL90871'], projectId: project1.id, deadline: new Date('2026-09-15') } }),
    prisma.task.create({ data: { title: 'Implement product catalog API', description: 'Build RESTful API endpoints for product listing, filtering, sorting, and search. Support pagination with cursor-based approach. Include Elasticsearch integration for full-text search.', priority: 'CRITICAL', status: 'IN_PROGRESS', userId: userIds['DEV5001'], assignedById: userIds['TL90871'], projectId: project1.id, deadline: new Date('2026-09-20') } }),
    prisma.task.create({ data: { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing, linting, building, and deployment. Include staging and production environments with Docker containers on AWS ECS.', priority: 'HIGH', status: 'COMPLETED', userId: userIds['DEV5002'], assignedById: userIds['TL90871'], projectId: project1.id, deadline: new Date('2026-08-30') } }),
    prisma.task.create({ data: { title: 'Checkout flow - Stripe integration', description: 'Integrate Stripe Payment Gateway for card payments, UPI, and wallet payments. Implement webhook handling for payment confirmation and refund processing.', priority: 'CRITICAL', status: 'TODO', userId: userIds['DEV5001'], assignedById: userIds['TL90871'], projectId: project1.id, deadline: new Date('2026-10-15') } }),
    prisma.task.create({ data: { title: 'Write E2E tests for checkout', description: 'Cypress end-to-end tests for the complete checkout flow: cart → address → payment → order confirmation. Cover edge cases like coupon codes, out-of-stock items.', priority: 'MEDIUM', status: 'TODO', userId: userIds['QA70001'], assignedById: userIds['TL90871'], projectId: project1.id, deadline: new Date('2026-10-25') } }),
    prisma.task.create({ data: { title: 'Product detail page UI', description: 'Build responsive product detail page with image gallery, size/variant selector, reviews section, and related products carousel. Implement zoom-on-hover for images.', priority: 'HIGH', status: 'IN_PROGRESS', userId: userIds['DEV5003'], assignedById: userIds['TL90871'], projectId: project1.id, deadline: new Date('2026-09-25') } }),
    prisma.task.create({ data: { title: 'Design product card components', description: 'Create reusable product card component with quick-view modal, wishlist toggle, and add-to-cart animation. Export Figma components for dev handoff.', priority: 'MEDIUM', status: 'COMPLETED', userId: userIds['DES6001'], assignedById: userIds['TL90871'], projectId: project1.id } }),

    // HR Portal tasks
    prisma.task.create({ data: { title: 'Leave management module', description: 'Build the complete leave request and approval workflow. Include leave balance calculation, carry-forward logic, and manager approval chain. Support CASUAL, SICK, PAID, and LOP leave types.', priority: 'HIGH', status: 'IN_PROGRESS', userId: userIds['DEV5002'], assignedById: userIds['OPS4001'], projectId: project2.id, deadline: new Date('2026-10-01') } }),
    prisma.task.create({ data: { title: 'Attendance dashboard UI', description: 'Design and implement the attendance tracking dashboard with monthly calendar view, punch-in/out functionality, late arrival highlights, and exportable attendance reports.', priority: 'HIGH', status: 'IN_REVIEW', userId: userIds['DEV5003'], assignedById: userIds['OPS4001'], projectId: project2.id, deadline: new Date('2026-09-30') } }),
    prisma.task.create({ data: { title: 'Employee profile pages', description: 'Build self-editable employee profile with personal info, emergency contacts, bank details, documents upload, and notification preferences. Ensure PII is encrypted at rest.', priority: 'MEDIUM', status: 'TODO', userId: userIds['DEV5001'], assignedById: userIds['OPS4001'], projectId: project2.id, deadline: new Date('2026-10-15') } }),

    // FinTrack tasks
    prisma.task.create({ data: { title: 'Expense categorization AI model', description: 'Train ML model to auto-categorize expenses from transaction descriptions. Use NLP with pre-trained transformers. Target 92%+ accuracy. Deploy as microservice with FastAPI.', priority: 'CRITICAL', status: 'IN_PROGRESS', userId: userIds['DEV5001'], assignedById: userIds['TL90871'], projectId: project3.id, deadline: new Date('2026-10-30') } }),
    prisma.task.create({ data: { title: 'Budget planning UI wireframes', description: 'Create wireframes and high-fidelity mockups for the budget planning module. Include monthly/yearly views, spending forecasts, and savings goal tracking with progress indicators.', priority: 'HIGH', status: 'COMPLETED', userId: userIds['DES6001'], assignedById: userIds['TL90871'], projectId: project3.id } }),
    prisma.task.create({ data: { title: 'React Native app scaffold', description: 'Set up the React Native project with Expo, TypeScript, React Navigation, and state management (Zustand). Configure theming, splash screen, and app icons.', priority: 'HIGH', status: 'COMPLETED', userId: userIds['DEV5003'], assignedById: userIds['TL90871'], projectId: project3.id } }),

    // Standalone/Admin tasks
    prisma.task.create({ data: { title: 'Review Q3 budget allocation', description: 'Analyze departmental budget utilization for Q3 2026. Compare actual vs planned expenditure, flag over-budget departments, and prepare variance report for the board.', priority: 'HIGH', status: 'IN_REVIEW', userId: userIds['ACC8001'], assignedById: userIds['DIR1001'] } }),
    prisma.task.create({ data: { title: 'Conduct frontend developer interviews', description: 'Screen and interview 8 shortlisted candidates for 2 Junior Frontend Developer positions. Prepare technical assessment and behavioral interview questions. Complete within 2 weeks.', priority: 'MEDIUM', status: 'IN_PROGRESS', userId: userIds['HR23894'], assignedById: userIds['DIR1001'], deadline: new Date('2026-09-15') } }),
    prisma.task.create({ data: { title: 'Prepare Q3 tax filings', description: 'Compile all Q3 financial records, verify GST input credits, reconcile TDS deductions, and prepare advance tax calculations for the quarter ending September 2026.', priority: 'CRITICAL', status: 'TODO', userId: userIds['ACC8001'], assignedById: userIds['DIR1001'], deadline: new Date('2026-09-30') } }),
    prisma.task.create({ data: { title: 'Security audit report', description: 'Complete the quarterly security audit: penetration testing results, dependency vulnerability scan, OWASP top 10 compliance check, and access control review.', priority: 'HIGH', status: 'TODO', userId: userIds['QA70001'], assignedById: userIds['OPS4001'], projectId: project7.id, deadline: new Date('2026-10-05') } }),
    prisma.task.create({ data: { title: 'Social media campaign Q4', description: 'Plan and schedule Q4 social media campaign. Create content calendar, design 20 carousel posts, 10 reels/shorts, and 5 blog articles. Target 30% engagement increase.', priority: 'MEDIUM', status: 'TODO', userId: userIds['EMP1002'], assignedById: userIds['OPS4001'], deadline: new Date('2026-10-01') } }),
    prisma.task.create({ data: { title: 'Design system documentation', description: 'Document the complete design system including color tokens, typography scale, spacing system, component specifications, and usage guidelines. Publish to internal wiki.', priority: 'MEDIUM', status: 'IN_PROGRESS', userId: userIds['DES6002'], assignedById: userIds['DES6001'], projectId: project1.id } }),
    prisma.task.create({ data: { title: 'Customer support SOP update', description: 'Update Standard Operating Procedures for the customer support team. Include new escalation matrix, response time SLAs, and knowledge base FAQs for recent product changes.', priority: 'LOW', status: 'TODO', userId: userIds['EMP1003'], assignedById: userIds['OPS4001'] } }),

    // API Gateway tasks
    prisma.task.create({ data: { title: 'Kong API Gateway setup', description: 'Deploy Kong API Gateway on Kubernetes. Configure rate limiting (1000 req/min per API key), request/response logging, and health check endpoints for all microservices.', priority: 'CRITICAL', status: 'IN_PROGRESS', userId: userIds['DEV5002'], assignedById: userIds['TL90871'], projectId: project7.id, deadline: new Date('2026-09-20') } }),
    prisma.task.create({ data: { title: 'OAuth2 authentication service', description: 'Implement OAuth2 authentication service with JWT tokens. Support authorization code flow, client credentials, and refresh token rotation. Integrate with existing LDAP directory.', priority: 'CRITICAL', status: 'TODO', userId: userIds['DEV5001'], assignedById: userIds['TL90871'], projectId: project7.id, deadline: new Date('2026-10-10') } }),
    prisma.task.create({ data: { title: 'API documentation with Swagger', description: 'Generate comprehensive API documentation using OpenAPI 3.0 specification. Include request/response examples, error codes, authentication guides, and rate limiting details.', priority: 'MEDIUM', status: 'TODO', userId: userIds['DEV5003'], assignedById: userIds['TL90871'], projectId: project7.id, deadline: new Date('2026-11-01') } }),
  ])
  console.log(`  ✅ Created ${tasks.length} tasks`)

  // ─── TIME LOGS ─────────────────────────────────────────────────────
  console.log('⏱️  Seeding time logs...')
  const timeLogData = []
  for (const task of tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'COMPLETED')) {
    const numLogs = task.status === 'COMPLETED' ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numLogs; i++) {
      const dayOffset = Math.floor(Math.random() * 14) + 1
      const startHour = 9 + Math.floor(Math.random() * 6)
      const durationMins = 30 + Math.floor(Math.random() * 180)
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset, startHour, Math.floor(Math.random() * 60))
      const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000)
      timeLogData.push({ taskId: task.id, userId: task.userId, startTime, endTime, duration: durationMins })
    }
  }
  await prisma.timeLog.createMany({ data: timeLogData })
  console.log(`  ✅ Created ${timeLogData.length} time logs`)

  // ─── ATTENDANCE ────────────────────────────────────────────────────
  console.log('📅 Seeding attendance records...')
  const attendanceData = []
  const activeEmployeeIds = ['DEV5001', 'DEV5002', 'DEV5003', 'DES6001', 'DES6002', 'QA70001', 'EMP1001', 'EMP1002', 'EMP1003', 'TL90871', 'HR23894', 'ACC8001', 'OPS4001']
  for (const empId of activeEmployeeIds) {
    for (let dayOffset = 1; dayOffset <= 20; dayOffset++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset)
      if (date.getDay() === 0 || date.getDay() === 6) continue // Skip weekends
      if (Math.random() < 0.08) continue // ~8% random absence

      const isLate = Math.random() < 0.12
      const checkInHour = isLate ? 10 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 2)
      const checkInMin = Math.floor(Math.random() * 60)
      const checkIn = new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkInHour, checkInMin)
      const workHours = 7.5 + Math.random() * 2.5
      const checkOut = new Date(checkIn.getTime() + workHours * 3600000)

      attendanceData.push({
        userId: userIds[empId],
        date,
        checkIn,
        checkOut,
        status: isLate ? 'LATE' : 'PRESENT'
      })
    }
  }
  await prisma.attendance.createMany({ data: attendanceData })
  console.log(`  ✅ Created ${attendanceData.length} attendance records`)

  // ─── LEAVES ────────────────────────────────────────────────────────
  console.log('🏖️  Seeding leave requests...')
  const leaveData = [
    { userId: userIds['DES6001'], type: 'CASUAL', startDate: new Date(2026, 8, 10), endDate: new Date(2026, 8, 12), reason: 'Family wedding ceremony in Jaipur — need to travel and attend functions.', status: 'APPROVED' },
    { userId: userIds['DEV5001'], type: 'SICK', startDate: new Date(2026, 7, 20), endDate: new Date(2026, 7, 22), reason: 'Down with viral fever and body ache. Doctor advised 3 days rest.', status: 'APPROVED' },
    { userId: userIds['DEV5003'], type: 'CASUAL', startDate: new Date(2026, 8, 15), endDate: new Date(2026, 8, 16), reason: 'Personal appointment — passport renewal and Aadhaar update.', status: 'PENDING' },
    { userId: userIds['QA70001'], type: 'PAID', startDate: new Date(2026, 8, 22), endDate: new Date(2026, 8, 26), reason: 'Planned vacation to Ladakh. Trekking trip booked in advance.', status: 'PENDING' },
    { userId: userIds['EMP1001'], type: 'CASUAL', startDate: new Date(2026, 8, 5), endDate: new Date(2026, 8, 5), reason: 'Moving to new apartment — need a day for shifting.', status: 'APPROVED' },
    { userId: userIds['DEV5002'], type: 'SICK', startDate: new Date(2026, 8, 1), endDate: new Date(2026, 8, 2), reason: 'Severe migraine and eye strain. Need rest from screen time.', status: 'APPROVED' },
    { userId: userIds['EMP1002'], type: 'CASUAL', startDate: new Date(2026, 9, 1), endDate: new Date(2026, 9, 3), reason: 'Attending cousin\'s wedding in Lucknow.', status: 'PENDING' },
    { userId: userIds['DES6002'], type: 'LOSS_OF_PAY', startDate: new Date(2026, 9, 10), endDate: new Date(2026, 9, 14), reason: 'Extended personal leave for home renovation supervision. All casual leaves exhausted.', status: 'PENDING' },
    { userId: userIds['ACC8001'], type: 'SICK', startDate: new Date(2026, 7, 15), endDate: new Date(2026, 7, 16), reason: 'Food poisoning — doctor visit and rest needed.', status: 'APPROVED' },
    { userId: userIds['EMP1003'], type: 'CASUAL', startDate: new Date(2026, 8, 18), endDate: new Date(2026, 8, 19), reason: 'Attending a friend\'s destination wedding in Goa.', status: 'REJECTED' },
    { userId: userIds['HR23894'], type: 'PAID', startDate: new Date(2026, 9, 20), endDate: new Date(2026, 9, 24), reason: 'Annual family vacation to Kerala — booked houseboat in Alleppey.', status: 'APPROVED' },
    { userId: userIds['TL90871'], type: 'CASUAL', startDate: new Date(2026, 8, 8), endDate: new Date(2026, 8, 8), reason: 'Parent-teacher meeting at children\'s school.', status: 'APPROVED' },
  ]
  await prisma.leave.createMany({ data: leaveData })
  console.log(`  ✅ Created ${leaveData.length} leave requests`)

  // ─── ASSETS ────────────────────────────────────────────────────────
  console.log('💻 Seeding assets...')
  const assetData = [
    { name: 'MacBook Pro 16" M3 Max', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['DEV5001'] },
    { name: 'MacBook Pro 14" M3 Pro', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['DEV5002'] },
    { name: 'MacBook Air 15" M3', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['DEV5003'] },
    { name: 'MacBook Pro 16" M3 Pro', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['DES6001'] },
    { name: 'Dell XPS 15 (2026)', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['QA70001'] },
    { name: 'ThinkPad X1 Carbon Gen 12', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['TL90871'] },
    { name: 'MacBook Air 13" M2', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['EMP1001'] },
    { name: 'HP EliteBook 840 G11', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['HR23894'] },
    { name: 'Dell Latitude 5540', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['ACC8001'] },
    { name: 'MacBook Pro 14" M2', type: 'LAPTOP', status: 'ASSIGNED', assignedToId: userIds['DES6002'] },
    { name: 'Dell UltraSharp U3223QE 32" 4K', type: 'MONITOR', status: 'ASSIGNED', assignedToId: userIds['DES6001'] },
    { name: 'LG 27UK850-W 27" 4K', type: 'MONITOR', status: 'ASSIGNED', assignedToId: userIds['DEV5001'] },
    { name: 'Samsung Odyssey G7 27" QHD', type: 'MONITOR', status: 'ASSIGNED', assignedToId: userIds['DEV5002'] },
    { name: 'Dell UltraSharp U2723QE 27" 4K', type: 'MONITOR', status: 'AVAILABLE' },
    { name: 'BenQ PD2725U 27" 4K', type: 'MONITOR', status: 'AVAILABLE' },
    { name: 'Apple Magic Keyboard (Touch ID)', type: 'KEYBOARD', status: 'ASSIGNED', assignedToId: userIds['DEV5001'] },
    { name: 'Logitech MX Keys S', type: 'KEYBOARD', status: 'ASSIGNED', assignedToId: userIds['DEV5002'] },
    { name: 'Apple Magic Mouse', type: 'MOUSE', status: 'ASSIGNED', assignedToId: userIds['DES6001'] },
    { name: 'Logitech MX Master 3S', type: 'MOUSE', status: 'ASSIGNED', assignedToId: userIds['DEV5001'] },
    { name: 'Logitech MX Ergo Trackball', type: 'MOUSE', status: 'ASSIGNED', assignedToId: userIds['DEV5003'] },
    { name: 'Sony WH-1000XM5 Headphones', type: 'HEADSET', status: 'ASSIGNED', assignedToId: userIds['DEV5001'] },
    { name: 'Apple AirPods Pro (2nd Gen)', type: 'HEADSET', status: 'ASSIGNED', assignedToId: userIds['DES6001'] },
    { name: 'Jabra Evolve2 75 Headset', type: 'HEADSET', status: 'ASSIGNED', assignedToId: userIds['HR23894'] },
    { name: 'iPhone 15 Pro (Company)', type: 'PHONE', status: 'ASSIGNED', assignedToId: userIds['DIR1001'] },
    { name: 'Samsung Galaxy S24 Ultra (Company)', type: 'PHONE', status: 'ASSIGNED', assignedToId: userIds['OPS4001'] },
    { name: 'iPad Pro 12.9" M2', type: 'TABLET', status: 'ASSIGNED', assignedToId: userIds['DES6001'] },
    { name: 'Wacom Intuos Pro (Large)', type: 'TABLET', status: 'ASSIGNED', assignedToId: userIds['DES6002'] },
    { name: 'Dell UltraSharp U2723QE 27"', type: 'MONITOR', status: 'UNDER_REPAIR' },
    { name: 'ThinkPad T14s Gen 5', type: 'LAPTOP', status: 'AVAILABLE' },
    { name: 'Logitech C920x HD Webcam', type: 'WEBCAM', status: 'ASSIGNED', assignedToId: userIds['TL90871'] },
  ]
  await prisma.asset.createMany({ data: assetData })
  console.log(`  ✅ Created ${assetData.length} assets`)

  // ─── MESSAGES ──────────────────────────────────────────────────────
  console.log('💬 Seeding messages...')
  const messageData = [
    // Dev team discussion
    { senderId: userIds['TL90871'], receiverId: userIds['DEV5001'], content: 'Hey Arjun, how\'s the product catalog API coming along? The frontend team needs the endpoints by Friday.', timestamp: new Date(now.getTime() - 4 * 3600000) },
    { senderId: userIds['DEV5001'], receiverId: userIds['TL90871'], content: 'Good progress! GET /products with filtering and pagination is done. Working on the search endpoint now. Should be ready by Thursday EOD.', timestamp: new Date(now.getTime() - 3.5 * 3600000) },
    { senderId: userIds['TL90871'], receiverId: userIds['DEV5001'], content: 'Perfect. Also, please add cursor-based pagination instead of offset. We discussed this in the architecture meeting.', timestamp: new Date(now.getTime() - 3 * 3600000) },
    { senderId: userIds['DEV5001'], receiverId: userIds['TL90871'], content: 'Already done ✅ Using the createdAt + id composite cursor. Much better for our scale.', timestamp: new Date(now.getTime() - 2.8 * 3600000) },

    // Designer and developer coordination
    { senderId: userIds['DES6001'], receiverId: userIds['DEV5003'], content: 'Shreya, I\'ve uploaded the product detail page designs to Figma. Check the "E-Commerce v2" project. All component specs are annotated.', timestamp: new Date(now.getTime() - 6 * 3600000) },
    { senderId: userIds['DEV5003'], receiverId: userIds['DES6001'], content: 'Thanks Kavya! Quick question — the image gallery zoom effect, should it be a modal overlay or inline zoom like Amazon?', timestamp: new Date(now.getTime() - 5.5 * 3600000) },
    { senderId: userIds['DES6001'], receiverId: userIds['DEV5003'], content: 'Let\'s go with inline zoom on hover for desktop and pinch-to-zoom on mobile. I\'ll add an interaction spec to the Figma file by EOD.', timestamp: new Date(now.getTime() - 5 * 3600000) },

    // HR conversations
    { senderId: userIds['HR23894'], receiverId: userIds['DIR1001'], content: 'Priya ma\'am, we\'ve shortlisted 8 candidates for the frontend roles. Interview schedule is ready — can you confirm your availability for the final round?', timestamp: new Date(now.getTime() - 24 * 3600000) },
    { senderId: userIds['DIR1001'], receiverId: userIds['HR23894'], content: 'Send me the schedule. I\'m available next Tuesday and Thursday afternoons. Also, let\'s include a pair-programming round this time.', timestamp: new Date(now.getTime() - 23 * 3600000) },
    { senderId: userIds['HR23894'], receiverId: userIds['DIR1001'], content: 'Great idea! I\'ll coordinate with Vikram to set up the pair-programming assessment. Sending the schedule now.', timestamp: new Date(now.getTime() - 22.5 * 3600000) },

    // Operations coordination
    { senderId: userIds['OPS4001'], receiverId: userIds['TL90871'], content: 'Vikram, the client wants a demo of the e-commerce platform next Wednesday. Can we have a staging build ready by Monday?', timestamp: new Date(now.getTime() - 48 * 3600000) },
    { senderId: userIds['TL90871'], receiverId: userIds['OPS4001'], content: 'Monday is tight but doable. The homepage, product listing, and search are ready. Checkout is still WIP but I can mock the payment step for the demo.', timestamp: new Date(now.getTime() - 47 * 3600000) },
    { senderId: userIds['OPS4001'], receiverId: userIds['TL90871'], content: 'That works. The client mostly wants to see the UI and search flow anyway. I\'ll prep the demo script.', timestamp: new Date(now.getTime() - 46 * 3600000) },

    // Accounts discussion
    { senderId: userIds['ACC8001'], receiverId: userIds['DIR1001'], content: 'Priya, Q3 budget analysis is ready for review. Engineering is 12% over budget due to the new cloud infrastructure costs. All other departments are within 5% variance.', timestamp: new Date(now.getTime() - 72 * 3600000) },
    { senderId: userIds['DIR1001'], receiverId: userIds['ACC8001'], content: 'Thanks Meera. The cloud costs were expected — we scaled up for the e-commerce launch. Let\'s discuss reallocation from the marketing surplus in our Friday meeting.', timestamp: new Date(now.getTime() - 70 * 3600000) },

    // QA and Dev
    { senderId: userIds['QA70001'], receiverId: userIds['DEV5002'], content: 'Rohan, I found a regression in the leave management module. Overlapping leave dates aren\'t being validated on the backend. Filing a bug now.', timestamp: new Date(now.getTime() - 8 * 3600000) },
    { senderId: userIds['DEV5002'], receiverId: userIds['QA70001'], content: 'Good catch! I\'ll fix that today. Should I add a constraint at the DB level too, or just application-level validation?', timestamp: new Date(now.getTime() - 7.5 * 3600000) },
    { senderId: userIds['QA70001'], receiverId: userIds['DEV5002'], content: 'Both would be ideal. DB constraint as a safety net + application-level for better error messages. I\'ll write the test case for it.', timestamp: new Date(now.getTime() - 7 * 3600000) },

    // Casual team chat
    { senderId: userIds['EMP1001'], receiverId: userIds['DEV5001'], content: 'Arjun bhai, thanks for helping with the Git rebase yesterday. Finally understood interactive rebase properly! 🙏', timestamp: new Date(now.getTime() - 28 * 3600000) },
    { senderId: userIds['DEV5001'], receiverId: userIds['EMP1001'], content: 'Anytime, Ojas! Pro tip: use "git rebase -i HEAD~5" to squash your WIP commits before pushing. Keeps the history clean.', timestamp: new Date(now.getTime() - 27 * 3600000) },

    // Support team
    { senderId: userIds['EMP1003'], receiverId: userIds['OPS4001'], content: 'Sir, we\'re getting a spike in support tickets about password reset emails not arriving. Could be a mail server issue. Should I escalate to DevOps?', timestamp: new Date(now.getTime() - 5 * 3600000) },
    { senderId: userIds['OPS4001'], receiverId: userIds['EMP1003'], content: 'Yes, escalate immediately. Also check if our SMTP rate limits were hit. CC me on the escalation email.', timestamp: new Date(now.getTime() - 4.8 * 3600000) },

    // Design team internal
    { senderId: userIds['DES6001'], receiverId: userIds['DES6002'], content: 'Aditya, the design system documentation is looking great. Can you also add the icon set usage guidelines and the motion design tokens?', timestamp: new Date(now.getTime() - 10 * 3600000) },
    { senderId: userIds['DES6002'], receiverId: userIds['DES6001'], content: 'On it! I\'ll add the Lottie animation specs too. Should have the updated doc ready by tomorrow.', timestamp: new Date(now.getTime() - 9 * 3600000) },

    // Marketing update
    { senderId: userIds['EMP1002'], receiverId: userIds['OPS4001'], content: 'Rajesh sir, the Q3 social media report is ready. We hit 45K impressions on LinkedIn this month — 28% increase from last quarter! 📈', timestamp: new Date(now.getTime() - 52 * 3600000) },
    { senderId: userIds['OPS4001'], receiverId: userIds['EMP1002'], content: 'Excellent work Neha! Let\'s present these numbers in the all-hands. Can you prepare 3-4 slides highlighting key wins?', timestamp: new Date(now.getTime() - 51 * 3600000) },
  ]
  await prisma.message.createMany({ data: messageData })
  console.log(`  ✅ Created ${messageData.length} messages`)

  // ─── EVENTS ────────────────────────────────────────────────────────
  console.log('📆 Seeding events...')
  const eventData = [
    { title: 'Q3 All Hands Meeting', description: 'Quarterly company-wide meeting. Agenda: Q3 results, Q4 roadmap, new hires introduction, and team awards.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3), type: 'MEETING' },
    { title: 'Sprint 14 Planning', description: 'Sprint planning for the e-commerce project. Backlog grooming and task allocation for the next 2-week sprint.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), type: 'MEETING' },
    { title: 'Design Review — FinTrack App', description: 'Review high-fidelity mockups for the FinTrack mobile app. Attendees: Design team + Product + Frontend devs.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5), type: 'MEETING' },
    { title: 'Client Demo — Acme Corp', description: 'Product demo for Acme Corp stakeholders. Showcasing e-commerce platform progress: catalog, search, and checkout flow.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), type: 'MEETING' },
    { title: 'Company Anniversary Celebration', description: '5th anniversary celebration! Office party with team activities, cake cutting, and awards ceremony. Dress code: Smart casual.', date: new Date(now.getFullYear(), 10, 15), type: 'HOLIDAY' },
    { title: 'Diwali Holiday', description: 'Office closed for Diwali festivities. Happy Diwali to all! 🪔', date: new Date(now.getFullYear(), 9, 20), type: 'HOLIDAY' },
    { title: 'Independence Day', description: 'National holiday — office closed. Flag hoisting ceremony at 9 AM for those who wish to join.', date: new Date(now.getFullYear(), 7, 15), type: 'HOLIDAY' },
    { title: 'Team Building — Outdoor Adventure', description: 'Team outing to Nandi Hills. Activities: trekking, zip-lining, and team bonding games. Transport arranged from office.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14), type: 'MEETING' },
    { title: 'Tech Talk: AI in Production', description: 'Internal tech talk by Arjun on deploying ML models in production. Topics: MLOps, model serving, monitoring, and A/B testing.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10), type: 'MEETING' },
    { title: 'Monthly Birthday Celebrations', description: 'Celebrating September birthdays! 🎂 Cake and snacks in the cafeteria at 4 PM.', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4), type: 'MEETING' },
  ]
  await prisma.event.createMany({ data: eventData })
  console.log(`  ✅ Created ${eventData.length} events`)

  // ─── CLIENTS ───────────────────────────────────────────────────────
  console.log('🤝 Seeding clients...')
  const clients = [
    await prisma.client.create({ data: { name: 'Jane Smith', company: 'Acme Corp', email: 'jane.smith@acmecorp.com', phone: '+1-555-0101' } }),
    await prisma.client.create({ data: { name: 'Rahul Khanna', company: 'FinEdge Technologies', email: 'rahul.k@finedgetech.com', phone: '+91-9988776655' } }),
    await prisma.client.create({ data: { name: 'Dr. Sarah Mitchell', company: 'MediCare Plus', email: 'sarah.m@medicareplus.org', phone: '+1-555-0202' } }),
    await prisma.client.create({ data: { name: 'Amit Patel', company: 'LogiPrime Solutions', email: 'amit.patel@logiprime.in', phone: '+91-9876512345' } }),
    await prisma.client.create({ data: { name: 'Elena Rodriguez', company: 'NovaBrand Agency', email: 'elena@novabrand.co', phone: '+1-555-0303' } }),
    await prisma.client.create({ data: { name: 'Takeshi Yamamoto', company: 'Sakura Digital', email: 'takeshi@sakuradigital.jp', phone: '+81-3-1234-5678' } }),
    await prisma.client.create({ data: { name: 'Michael O\'Brien', company: 'GreenLeaf Organics', email: 'michael@greenleaforganics.com', phone: '+1-555-0404' } }),
  ]
  console.log(`  ✅ Created ${clients.length} clients`)

  // ─── INVOICES ──────────────────────────────────────────────────────
  console.log('💰 Seeding invoices...')
  const invoiceData = [
    { clientId: clients[0].id, amount: 285000.00, status: 'PAID', dueDate: new Date(2026, 6, 15) },
    { clientId: clients[0].id, amount: 175000.00, status: 'PAID', dueDate: new Date(2026, 7, 15) },
    { clientId: clients[0].id, amount: 320000.00, status: 'UNPAID', dueDate: new Date(2026, 9, 1) },
    { clientId: clients[1].id, amount: 450000.00, status: 'UNPAID', dueDate: new Date(2026, 9, 15) },
    { clientId: clients[1].id, amount: 125000.00, status: 'PAID', dueDate: new Date(2026, 7, 30) },
    { clientId: clients[2].id, amount: 550000.00, status: 'UNPAID', dueDate: new Date(2026, 10, 1) },
    { clientId: clients[3].id, amount: 380000.00, status: 'UNPAID', dueDate: new Date(2026, 10, 15) },
    { clientId: clients[4].id, amount: 95000.00, status: 'PAID', dueDate: new Date(2026, 6, 30) },
    { clientId: clients[4].id, amount: 85000.00, status: 'PAID', dueDate: new Date(2026, 7, 15) },
    { clientId: clients[5].id, amount: 210000.00, status: 'UNPAID', dueDate: new Date(2026, 9, 30) },
    { clientId: clients[6].id, amount: 145000.00, status: 'OVERDUE', dueDate: new Date(2026, 7, 1) },
    { amount: 62500.00, status: 'PAID', dueDate: new Date(2026, 5, 15) },
    { amount: 48000.00, status: 'PAID', dueDate: new Date(2026, 6, 1) },
  ]
  await prisma.invoice.createMany({ data: invoiceData })
  console.log(`  ✅ Created ${invoiceData.length} invoices`)

  // ─── DOMAINS ───────────────────────────────────────────────────────
  console.log('🌐 Seeding domains...')
  const domainData = [
    { url: 'companyos.io', provider: 'Cloudflare', expiryDate: new Date(2028, 3, 15), status: 'ACTIVE' },
    { url: 'companyos.com', provider: 'AWS Route53', expiryDate: new Date(2027, 11, 1), status: 'ACTIVE' },
    { url: 'company-internal.com', provider: 'AWS Route53', expiryDate: new Date(2027, 5, 1), status: 'ACTIVE' },
    { url: 'acme-ecommerce-staging.dev', provider: 'Cloudflare', expiryDate: new Date(2027, 2, 28), status: 'ACTIVE' },
    { url: 'fintrack-app.com', provider: 'Google Domains', expiryDate: new Date(2027, 8, 15), status: 'ACTIVE' },
    { url: 'medicare-portal.health', provider: 'AWS Route53', expiryDate: new Date(2027, 10, 30), status: 'ACTIVE' },
    { url: 'logiprime-dashboard.io', provider: 'Cloudflare', expiryDate: new Date(2027, 6, 15), status: 'ACTIVE' },
    { url: 'old-company-site.com', provider: 'GoDaddy', expiryDate: new Date(2026, 8, 30), status: 'EXPIRING_SOON' },
    { url: 'legacy-api.company.dev', provider: 'Namecheap', expiryDate: new Date(2026, 7, 15), status: 'EXPIRED' },
  ]
  await prisma.domain.createMany({ data: domainData })
  console.log(`  ✅ Created ${domainData.length} domains`)

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────
  console.log('🔔 Seeding notifications...')
  const notificationData = [
    { userId: userIds['DEV5001'], title: 'New task assigned: Checkout flow - Stripe integration', body: 'You have been assigned a new critical priority task. Deadline: October 15, 2026. Integrate Stripe Payment Gateway for card payments, UPI, and wallet payments.', type: 'TASK', link: '/dashboard/tasks' },
    { userId: userIds['DEV5001'], title: 'Sprint 14 Planning tomorrow', body: 'Reminder: Sprint 14 planning session is scheduled for tomorrow at 10:00 AM. Please update your current task statuses before the meeting.', type: 'INFO', link: '/dashboard/calendar' },
    { userId: userIds['DES6001'], title: 'Leave request approved', body: 'Your casual leave request from September 10 to September 12 has been approved. Enjoy your time off!', type: 'LEAVE', link: '/dashboard/leaves' },
    { userId: userIds['DEV5003'], title: 'New task assigned: Product detail page UI', body: 'You have been assigned a new high priority task. Build responsive product detail page with image gallery and variant selector.', type: 'TASK', link: '/dashboard/tasks' },
    { userId: userIds['QA70001'], title: 'New task assigned: Security audit report', body: 'You have been assigned a new high priority task. Deadline: October 5, 2026. Complete the quarterly security audit report.', type: 'TASK', link: '/dashboard/tasks' },
    { userId: userIds['ACC8001'], title: 'Q3 budget review meeting', body: 'Reminder: Budget review meeting with Director Priya Mehta scheduled for this Friday at 3:00 PM in Conference Room B.', type: 'INFO', link: '/dashboard/calendar' },
    { userId: userIds['HR23894'], title: '4 pending leave requests', body: 'There are 4 pending leave requests awaiting your review. Please process them at your earliest convenience.', type: 'ALERT', link: '/dashboard/leaves' },
    { userId: userIds['TL90871'], title: 'Client demo next Wednesday', body: 'Reminder: Acme Corp client demo scheduled for next Wednesday. Please ensure the staging environment is ready with latest features.', type: 'WARNING', link: '/dashboard/projects' },
    { userId: userIds['DEV5002'], title: 'Bug report: Leave date overlap', body: 'QA has reported a regression bug in the leave management module. Overlapping leave dates are not being validated. Priority: High.', type: 'ALERT', link: '/dashboard/tasks' },
    { userId: userIds['EMP1002'], title: 'New task assigned: Social media campaign Q4', body: 'You have been assigned a new medium priority task. Plan and schedule Q4 social media campaign with content calendar.', type: 'TASK', link: '/dashboard/tasks' },
    { userId: userIds['EMP1001'], title: 'Welcome to the team! 🎉', body: 'Congratulations on joining CompanyOS! Complete your profile setup and check out the onboarding guide to get started.', type: 'SUCCESS', link: '/dashboard/profile' },
    { userId: userIds['DIR1001'], title: 'Monthly revenue report ready', body: 'August 2026 revenue report is ready for review. Total revenue: ₹28.5L | Collections: ₹22.3L | Outstanding: ₹6.2L', type: 'INFO', link: '/dashboard/reports' },
    { userId: userIds['OPS4001'], title: 'SMTP rate limit alert', body: 'Warning: SMTP email sending rate limit reached (500/hour). Some password reset emails may be delayed. DevOps team has been notified.', type: 'WARNING' },
  ]
  // Mark some as read
  const notifications = []
  for (let i = 0; i < notificationData.length; i++) {
    notifications.push({
      ...notificationData[i],
      readAt: i < 5 ? new Date(now.getTime() - (i + 1) * 3600000) : null,
      createdAt: new Date(now.getTime() - (i + 1) * 2 * 3600000)
    })
  }
  await prisma.notification.createMany({ data: notifications })
  console.log(`  ✅ Created ${notifications.length} notifications`)

  // ─── AUDIT LOGS ────────────────────────────────────────────────────
  console.log('📝 Seeding audit logs...')
  const auditData = [
    { actorId: userIds['SA00001'], action: 'CREATE', entity: 'Project', metadata: { name: 'Global E-Commerce Redesign', clientName: 'Acme Corp' }, createdAt: new Date(now.getTime() - 30 * 86400000) },
    { actorId: userIds['SA00001'], action: 'CREATE', entity: 'Project', metadata: { name: 'Internal HR Portal', clientName: 'Internal' }, createdAt: new Date(now.getTime() - 28 * 86400000) },
    { actorId: userIds['DIR1001'], action: 'CREATE', entity: 'Project', metadata: { name: 'FinTrack Mobile App', clientName: 'FinEdge Technologies' }, createdAt: new Date(now.getTime() - 20 * 86400000) },
    { actorId: userIds['HR23894'], action: 'CREATE', entity: 'User', metadata: { employeeId: 'EMP1001', name: 'Ojas Gaur', role: 'EMPLOYEE' }, createdAt: new Date(now.getTime() - 25 * 86400000) },
    { actorId: userIds['HR23894'], action: 'UPDATE', entity: 'Leave', metadata: { status: 'APPROVED', type: 'SICK', employee: 'Arjun Nair' }, createdAt: new Date(now.getTime() - 10 * 86400000) },
    { actorId: userIds['TL90871'], action: 'CREATE', entity: 'Task', metadata: { title: 'Implement product catalog API', assignee: 'Arjun Nair', priority: 'CRITICAL' }, createdAt: new Date(now.getTime() - 15 * 86400000) },
    { actorId: userIds['OPS4001'], action: 'UPDATE', entity: 'Asset', metadata: { name: 'MacBook Pro 16" M3 Max', status: 'ASSIGNED', assignee: 'Arjun Nair' }, createdAt: new Date(now.getTime() - 22 * 86400000) },
    { actorId: userIds['ACC8001'], action: 'CREATE', entity: 'Invoice', metadata: { client: 'Acme Corp', amount: 285000, status: 'PAID' }, createdAt: new Date(now.getTime() - 18 * 86400000) },
    { actorId: userIds['DIR1001'], action: 'UPDATE', entity: 'Project', metadata: { name: 'Brand Identity Refresh', status: 'COMPLETED' }, createdAt: new Date(now.getTime() - 5 * 86400000) },
    { actorId: userIds['SA00001'], action: 'DELETE', entity: 'Domain', metadata: { url: 'test-staging.company.dev', reason: 'No longer needed' }, createdAt: new Date(now.getTime() - 3 * 86400000) },
    { actorId: userIds['TL90871'], action: 'UPDATE', entity: 'Task', metadata: { title: 'Setup CI/CD pipeline', oldStatus: 'IN_PROGRESS', newStatus: 'COMPLETED' }, createdAt: new Date(now.getTime() - 2 * 86400000) },
    { actorId: userIds['HR23894'], action: 'UPDATE', entity: 'Leave', metadata: { status: 'REJECTED', type: 'CASUAL', employee: 'Tanvi Joshi', reason: 'Insufficient leave balance' }, createdAt: new Date(now.getTime() - 1 * 86400000) },
  ]
  await prisma.auditLog.createMany({ data: auditData })
  console.log(`  ✅ Created ${auditData.length} audit logs`)

  // ─── FILE RECORDS ──────────────────────────────────────────────────
  console.log('📎 Seeding file records...')
  const fileData = [
    { fileName: 'Acme_Corp_SOW_v2.pdf', fileUrl: '/files/acme_sow_v2.pdf', size: 2450000, uploaderId: userIds['OPS4001'], clientId: clients[0].id },
    { fileName: 'E-Commerce_Wireframes_Final.fig', fileUrl: '/files/ecomm_wireframes.fig', size: 18500000, uploaderId: userIds['DES6001'], clientId: clients[0].id },
    { fileName: 'FinTrack_Requirements_Spec.docx', fileUrl: '/files/fintrack_reqs.docx', size: 890000, uploaderId: userIds['TL90871'], clientId: clients[1].id },
    { fileName: 'MediCare_HIPAA_Compliance_Checklist.pdf', fileUrl: '/files/medicare_hipaa.pdf', size: 1200000, uploaderId: userIds['OPS4001'], clientId: clients[2].id },
    { fileName: 'LogiPrime_IoT_Architecture_Diagram.png', fileUrl: '/files/logiprime_arch.png', size: 3400000, uploaderId: userIds['DEV5001'], clientId: clients[3].id },
    { fileName: 'NovaBrand_Style_Guide_v3.pdf', fileUrl: '/files/novabrand_style.pdf', size: 15600000, uploaderId: userIds['DES6001'], clientId: clients[4].id },
    { fileName: 'Q3_Revenue_Report_Aug2026.xlsx', fileUrl: '/files/q3_revenue_aug.xlsx', size: 560000, uploaderId: userIds['ACC8001'] },
    { fileName: 'API_Gateway_Migration_Plan.md', fileUrl: '/files/api_migration.md', size: 45000, uploaderId: userIds['TL90871'] },
    { fileName: 'Employee_Handbook_2026.pdf', fileUrl: '/files/emp_handbook_2026.pdf', size: 4200000, uploaderId: userIds['HR23894'] },
    { fileName: 'Security_Audit_Q2_Report.pdf', fileUrl: '/files/security_audit_q2.pdf', size: 1800000, uploaderId: userIds['QA70001'] },
  ]
  await prisma.fileRecord.createMany({ data: fileData })
  console.log(`  ✅ Created ${fileData.length} file records`)

  console.log('\n🎉 Database fully seeded with comprehensive, realistic data!')
  console.log('   Summary:')
  console.log(`   • ${presentationUsers.length} users (with full profiles & manager hierarchy)`)
  console.log(`   • 7 projects (various statuses)`)
  console.log(`   • ${tasks.length} tasks (across projects and standalone)`)
  console.log(`   • ${timeLogData.length} time logs`)
  console.log(`   • ${attendanceData.length} attendance records (20 working days)`)
  console.log(`   • ${leaveData.length} leave requests`)
  console.log(`   • ${assetData.length} assets (laptops, monitors, peripherals)`)
  console.log(`   • ${messageData.length} messages (realistic conversations)`)
  console.log(`   • ${eventData.length} events`)
  console.log(`   • ${clients.length} clients`)
  console.log(`   • ${invoiceData.length} invoices`)
  console.log(`   • ${domainData.length} domains`)
  console.log(`   • ${notifications.length} notifications`)
  console.log(`   • ${auditData.length} audit logs`)
  console.log(`   • ${fileData.length} file records`)
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
