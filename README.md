# Company Management Dashboard

A full-stack internal company operations platform built with Next.js, Auth.js, Prisma and PostgreSQL.

## Core modules

- Employee onboarding and self-service profiles
- Role-based and per-user access control
- Attendance and time tracking, including Super Admin company-wide view
- Leave management with idempotent approval/rejection
- Task management / Kanban with direct status editing
- Project management
- Employee Drive / document links
- Internal direct and group messaging foundations
- Company calendar
- Asset management
- Finance, invoices, GST/non-GST invoice PDF downloads, and payment tracking
- Client CRM and client document sharing
- Domain and web-asset tracking with Super Admin CRUD
- Offer-letter template management
- Birthday and joining-anniversary notifications
- Monthly backup snapshots
- Reports and operational analytics

## Stack

- Next.js 16 / React 19 / TypeScript
- Auth.js / NextAuth credentials authentication
- Prisma 7 + PostgreSQL
- Tailwind CSS 4
- Framer Motion
- Socket.IO

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `CREDENTIAL_ENCRYPTION_KEY`
- `CRON_SECRET` for scheduled anniversary/backup routes

Generate secrets with:

```bash
openssl rand -hex 32
```

3. Generate Prisma Client:

```bash
npm run db:generate
```

4. Sync the database during development:

```bash
npm run db:push
```

5. Start the application:

```bash
npm run dev
```

## Tester acceptance workflow

Use the `tester-feedback-fixes` branch/PR build for acceptance testing.

### 1. Employee creation

Sign in as HR or Super Admin → Admin / HR Panel → User Management → New Joiner Registration.
Create a normal employee with a unique email and joining date. Expected result: a success state appears and the employee is listed in User Management. The form must not report a false failure after account creation.

### 2. Partial access

Sign in as Super Admin → Admin / HR Panel → System Controls → Partial System Access.
For a test employee, click Grant for one module. Sign in as that employee and verify the granted operation is available. Repeat with another permission and verify access is restricted when an override is disabled.

### 3. Birthday / anniversary notification

Create/update a test employee with today's month/day as date of birth or joining date. Call the scheduled endpoint with the configured secret, or wait for the deployed cron. Expected result: one notification is created for the event; repeat calls on the same date must not duplicate it.

### 4. Employee Drive

Sign in as an employee → Employee Drive → add a document name and secure storage URL. Verify the document appears. Sign in as another employee and verify the private document is not exposed through the employee-owned Drive query.

### 5. Task status editing

Sign in as an employee → Tasks. Use the Update Status selector on a task without dragging it. Expected result: the card moves to the new status and remains after refresh. Drag-and-drop should still work.

### 6. Super Admin controls

Sign in as Super Admin → System Controls. Verify access control, offer-letter template editing, domain add/update, and payment recording are available. Sign in with a non-Super-Admin account and verify System Controls is blocked.

### 7. Attendance

Create attendance records for at least two users. Sign in as Super Admin → Attendance & Time. Expected result: employee names/IDs are shown in one company-wide table. A normal employee should see only their own records.

### 8. Leave rejection

Create a pending leave request. Sign in as an approver → Leave Requests. Click Reject once. Expected result: the button disables while the request is processed and disappears from the pending queue. A second server request must be rejected as “already been processed.”

### 9. Invoice PDF

Create an invoice linked to a client. Sign in as the client → Invoices → View Details. Download once with GST and once without GST. Verify both files are valid PDFs and the totals differ by the configured GST amount.

### 10. Client file sharing

Sign in as a client → Shared Documents & Assets. Add a secure document link. Verify it appears in the client portal. Verify internal staff can access the corresponding client file record.

### 11. Payment tracking

Sign in as Super Admin/Accounts → System Controls → Payment Tracking. Select an invoice, record a payment, and verify the payment history and invoice status update.

### 12. Search / filters

Use the application’s search/filter surface for employees, clients, projects, tasks, invoices, attendance, messages, and documents. Verify a known test record is returned and irrelevant records are excluded.

### 13. Messaging groups and file sharing

Use Messages to create a test department/group and send a message. Send a direct message with a file attachment/link. Verify only intended recipients can access the conversation/file.

### 14. Monthly backup

Call `/api/cron/monthly-backup` with `Authorization: Bearer $CRON_SECRET`. Expected result: a snapshot for the current UTC month is created/updated and reports record counts. Re-running the same month updates the existing snapshot rather than creating duplicates.

## Scheduled jobs

`vercel.json` configures:

- Daily: `/api/cron/daily-anniversaries`
- Monthly: `/api/cron/monthly-backup`

For non-Vercel deployments, schedule authenticated HTTP requests to those routes with your platform scheduler.

## Production checklist

- Use PostgreSQL; do not use the old local SQLite database.
- Configure unique, high-entropy `AUTH_SECRET` and `CRON_SECRET` values.
- Configure a persistent 32-byte `CREDENTIAL_ENCRYPTION_KEY` and never rotate it without a key-migration plan.
- Rotate any credentials that were previously exposed in repository history.
- Store uploaded documents in a private object store and issue authorized download URLs.
- Use database migrations for production schema changes rather than relying on `db:push`.
- Review GitHub Actions before deployment and require lint/build checks to pass.

## Security model

Sensitive server mutations authenticate the current database user and enforce authorization at the operation boundary. Route protection is only the first layer.

Bank account numbers collected during onboarding are encrypted at rest using AES-256-GCM and the `CREDENTIAL_ENCRYPTION_KEY` environment variable.

## Roles

`SUPER_ADMIN`, `DIRECTOR`, `HR`, `OPERATIONS_MANAGER`, `TEAM_LEAD`, `DEVELOPER`, `DESIGNER`, `TESTER`, `ACCOUNTS`, `EMPLOYEE`, `CLIENT`

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

The repository also contains `.github/workflows/ci.yml` for automated validation on pushes and pull requests to `main`.

<!-- deployment trigger -->
