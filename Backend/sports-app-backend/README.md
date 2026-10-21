# Sports-in-One API

Express REST API using Prisma and PostgreSQL.

## Requirements

- Node.js 20+ (Node 22 recommended)
- PostgreSQL 15+
- A unique `JWT_SECRET` of at least 32 characters
- `DATABASE_URL` and `CORS_ORIGIN` configured through environment variables

## Local setup

1. Copy `.env.example` to `.env`.
2. Set the required values locally; never commit secrets.
3. Install dependencies and start the API:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

For a **new, empty database**, the checked-in migrations create the schema. If the database was previously created using `prisma db push`, do not run the initial migration against it blindly. Back up the database, verify the live schema matches the initial migration, and test the following against a restored non-production copy first:

```bash
npx prisma migrate resolve --applied 20261021000000_init
npx prisma migrate deploy
```

If the schema differs from the migration, stop and reconcile it before baselining. Do not reset or drop data to force migrations through.

## First administrator

Public registration creates student accounts only. To provision the first administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 16 characters) in the local environment and run:

```bash
npm run create-admin
```

The script refuses to overwrite an existing account and does not print the password.

## Automated validation

- `npm run check` — API JavaScript syntax checks
- `npm test` — backend automated tests
- `npx prisma validate` — Prisma schema validation
- `npx prisma migrate deploy` — apply pending migrations

CI also checks the frontend lint/build and validates migrations against a clean PostgreSQL service. These checks do not replace end-to-end testing against a staging deployment.

## Current API coverage

The student events and turf-booking flows use the API for events, registrations, turf availability, booking history, booking creation, and cancellation. Turf booking uses a transactional conditional slot claim to prevent two requests from claiming the same available slot. Turf owners can manage future unbooked slots.

Protected routes enforce authentication and role/ownership boundaries. Coaches are scoped to assigned students. Keep those checks in place when adding routes.

## Production checklist

- Configure a managed PostgreSQL database and securely store connection details in the API host's environment.
- Use a unique production JWT secret; do not reuse development credentials.
- Set `CORS_ORIGIN` to the exact deployed frontend origin.
- Configure the frontend's `VITE_API_BASE_URL` to the deployed API URL.
- Run migration and critical-flow smoke tests against staging before production.
- Enable database backups and verify restoration procedures.
- Add monitoring/logging and complete role-based end-to-end tests.
- Paid event registration is not enabled; no payment should be represented as completed without a verified payment-provider integration.
