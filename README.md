# Company Management Dashboard

A full-stack internal company operations platform built with Next.js, Auth.js, Prisma and PostgreSQL.

## Core modules

- Employee onboarding and self-service profiles
- Authentication and role-based access control
- Attendance and time tracking
- Leave management
- Task management / Kanban
- Project management
- Operations management
- Internal chat
- Company calendar
- Asset management
- Finance, invoices and CRM foundations
- Developer/domain tracking foundations
- Reports and operational analytics
- Centralized file-management foundation

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

Generate the encryption key with:

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

## Production checklist

- Use PostgreSQL; do not use the old local SQLite database.
- Configure a unique, high-entropy `AUTH_SECRET`.
- Configure a persistent 32-byte `CREDENTIAL_ENCRYPTION_KEY` and never rotate it without a key-migration plan.
- Rotate any credentials that were previously exposed in repository history.
- Store uploaded documents in a private object store and issue authorized download URLs.
- Use database migrations for production schema changes rather than relying on `db:push`.
- Review GitHub Actions before deployment and require lint/build checks to pass.

## Security model

Sensitive server mutations must authenticate the current database user and enforce authorization at the operation boundary. Route protection in `src/proxy.ts` is only the first layer.

Bank account numbers collected during onboarding are encrypted at rest using AES-256-GCM and the `CREDENTIAL_ENCRYPTION_KEY` environment variable.

## Roles

`SUPER_ADMIN`, `DIRECTOR`, `HR`, `OPERATIONS_MANAGER`, `TEAM_LEAD`, `DEVELOPER`, `DESIGNER`, `TESTER`, `ACCOUNTS`, `EMPLOYEE`, `CLIENT`

## Quality gates

```bash
npm run lint
npm run build
```

The repository also contains `.github/workflows/ci.yml` for automated lint/build validation on pushes and pull requests to `main`.
