# Sports-in-One API

Express + Prisma + PostgreSQL API used by the Sports-in-One application.

## Local development

Requirements: Node.js 20+ and PostgreSQL 15+.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, a unique `JWT_SECRET` with at least 32 characters, and `CORS_ORIGIN`.
3. For a **new, empty database**, run:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

### Existing database created with `prisma db push`

Do not run the initial migration against an existing schema without baselining it first. Back up the database and verify that its tables match the initial schema. Then mark the initial migration as applied and run the follow-up migration:

```bash
npx prisma migrate resolve --applied 20261021000000_init
npx prisma migrate deploy
```

The follow-up migration removes duplicate event registrations (preferring accepted, then pending, then declined registrations), enforces one registration per student/event, and changes slot uniqueness so a cancelled booking can remain in history while the released slot is booked again. Test this procedure against a restored, non-production database before production rollout.

If the existing schema differs from the initial schema, stop and reconcile it before baselining; do not reset or drop data to force the migration through.

## First administrator

Public registration creates student accounts only. To provision the first administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 16 characters) in your local environment, then run `npm run create-admin`. The script refuses to overwrite any account and never prints the password. Do not commit the actual values.

## Validation

- `npm run check` checks API JavaScript syntax.
- `npm test` runs automated backend tests.
- `npx prisma validate` validates the Prisma schema.
- `npx prisma migrate deploy` applies pending migrations.

The student events and turf booking pages use the API for events, registrations, turf availability, booking history, booking creation, and cancellation. Paid event registration is not enabled; do not represent a booking as paid without a verified payment-provider integration.

## Production requirements

Set the production API origin explicitly. Back up PostgreSQL, rotate secrets, enforce role and ownership checks on new routes, and run integration tests against a non-production database before rollout. The turf booking flow uses a transactional conditional slot claim to prevent double booking.
