# Production deployment

## Required environment variables

Set these in the deployment provider's secret/environment store:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — long random Auth.js secret
- `NEXTAUTH_URL` — canonical HTTPS application URL
- `CREDENTIAL_ENCRYPTION_KEY` — 64 hex characters representing 32 random bytes

Generate the encryption key with:

```bash
openssl rand -hex 32
```

## Database

This repository now uses PostgreSQL and the Prisma schema contains the current application contract.

For a new/non-production database, synchronize the schema with:

```bash
npm run db:push
```

For an existing production database, baseline the current database before adopting Prisma Migrate. Prisma's documented workflow for an existing project is to generate a baseline migration from the current schema, review it, and mark the baseline as applied before subsequent migrations. Do not blindly run a generated initial migration against a database that already contains the application's tables.

## Build

```bash
npm install
npm run db:generate
npm run typecheck
npm run lint
npm run build
```

## Security requirements

- Never put `.env`, credentials, bank details or private keys in Git.
- Rotate every credential previously exposed in `presentation_credentials.txt`.
- Keep `CREDENTIAL_ENCRYPTION_KEY` stable; changing it without a data re-encryption plan makes existing encrypted bank account numbers unreadable.
- Use private object storage for employee/client documents and signed URLs for access.
- Enable HTTPS in production.
- Review GitHub Actions before enabling automatic deployment.

## Health checks

After deployment verify:

1. Landing/login page loads.
2. Active credentials authenticate.
3. Disabled users cannot authenticate.
4. Employee dashboard loads.
5. Admin routes reject non-admin roles.
6. Employee onboarding creates a profile and encrypts bank account numbers.
7. Task ownership prevents cross-user modification.
8. Notifications and audit logs are written.
9. Reports load for authorized management roles.
10. `npm run typecheck`, `npm run lint` and `npm run build` pass in CI.
