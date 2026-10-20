# Sports-in-One API

Express + Prisma + PostgreSQL API used by the Sports-in-One application.

## Local development

Requirements: Node.js 20+ and PostgreSQL 15+.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, a unique `JWT_SECRET` with at least 32 characters, and `CORS_ORIGIN`.
3. Run:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

## First administrator

Public registration creates student accounts only. To provision the first administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 16 characters) in your local environment, then run `npm run create-admin`. The script refuses to overwrite any account and never prints the password. Do not commit the actual values.

## Validation

`npm run check` checks API JavaScript syntax. `npm test` runs authentication middleware regression tests. `npx prisma validate` validates the Prisma schema.

## Important production requirements

Use Prisma migrations (not `db push`) for controlled production changes. Set the production API origin explicitly. Back up PostgreSQL, rotate secrets, enforce role and ownership checks on new routes, and perform integration tests against a non-production database before rollout. The turf booking flow uses a conditional transactional slot claim to prevent double-booking.
