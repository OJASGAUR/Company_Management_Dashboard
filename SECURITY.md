# Security policy

## Sensitive data

The application handles employee identity, payroll/banking data, internal work information, client information and technical credentials.

Sensitive values must be stored only in protected environment variables, encrypted database fields, or private object storage as appropriate.

## Authentication

- Auth.js credentials authentication is backed by bcrypt password hashes.
- Disabled accounts are rejected at login and at server-operation boundaries.
- Server mutations resolve the authenticated database user instead of trusting client-supplied user IDs.

## Authorization

Authorization is enforced in three layers:

1. Route protection in `src/proxy.ts`.
2. Layout/page role checks for sensitive sections.
3. Server-action authorization using `requireRole()` and ownership checks.

Never rely on a hidden menu item as an authorization boundary.

## Secrets

`presentation_credentials.txt` was removed from the repository. Any credential that appeared in that file must be treated as compromised and rotated.

The repository ignores environment files, local databases, and presentation credentials.

## Reporting

Do not commit secrets or proof-of-concept exploit code into the repository. Report security issues privately to the repository owner and include reproduction steps without exposing real credentials.
