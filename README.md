# Sports-in-One — Rebuild

Sports-in-One is a sports academy, event-registration, and turf-booking platform. This repository is the active rebuild target.

## Application layout

- `Frontend/` — primary React + Vite frontend for student, admin, and turf-owner flows.
- `Backend/sports-app-backend/` — Express REST API, Prisma ORM, and PostgreSQL.
- `Backend/academypro/` — a second React/Vite app that overlaps with the primary frontend. Treat it as legacy/reference code until the product is consolidated around one frontend.

## Local development

Requirements: Node.js 20+ (Node 22 recommended), npm, PostgreSQL 15+.

### Backend API

```bash
cd Backend/sports-app-backend
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET (32+ characters), and CORS_ORIGIN in .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

For a **new, empty database**, `prisma migrate deploy` applies the checked-in migrations. If the database was previously created with `prisma db push`, do not apply the initial migration blindly: back up the database, verify schema compatibility, and follow the baselining instructions in the backend README.

To provision the first administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 16 characters) in the environment and run `npm run create-admin`. Public signup creates student accounts only; privileged roles must be provisioned by an authorized operator.

### Frontend

```bash
cd Frontend
npm install
# Optional .env.local:
# VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

## Implemented and CI-validated

- Automated CI checks for frontend lint/build and backend syntax/tests.
- Prisma schema validation/client generation and migration checks against a clean PostgreSQL service in CI.
- JWT authentication and role/ownership checks for protected backend flows.
- Student event registration/listing and turf availability, booking history, booking creation, and cancellation APIs.
- Transactional slot claiming to reduce double-booking races; turf owners can manage future unbooked slots.
- Health/readiness endpoint, CORS allowlist configuration, request-size limit, and safe public user responses.
- Admin provisioning script that does not expose the configured password.

See `.github/workflows/validate.yml` for the automated checks. Passing CI is useful evidence, but it is not a substitute for production smoke tests or full browser-based end-to-end coverage.

## Known gaps before production

1. Create and configure the production hosting resources: managed PostgreSQL, a Node.js API host, and the Vite frontend host.
2. Set production-only environment variables in each provider dashboard; never commit secrets or paste them into source control.
3. Point the frontend's `VITE_API_BASE_URL` at the deployed API and configure the API's `CORS_ORIGIN` to the exact frontend origin.
4. Run end-to-end checks for student, coach, admin, and turf-owner journeys against a staging database.
5. Review remaining dashboard screens and actions for mock/local state, then connect them to persistent APIs where needed.
6. Consolidate the duplicate frontend apps and document a single canonical build/deploy path.
7. Configure backups, logs/alerts, dependency updates, and an incident/recovery procedure.

## Important limitations

- Paid event registration is not enabled; do not represent an event registration or turf booking as paid without a verified payment-provider integration.
- A production deployment has not yet been confirmed. Do not share the app as production-ready until the API and database are deployed and the critical flows are tested against them.
- Never commit `.env` files, production credentials, private user data, or database dumps.
