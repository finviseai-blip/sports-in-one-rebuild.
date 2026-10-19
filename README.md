# Sports-in-One — Rebuild

Sports-in-One is a sports academy and turf-booking platform. This private repository is the active rebuild target, restored from the original application source with initial configuration and security hardening.

## Application surfaces

- `Frontend/` — primary React + Vite frontend for student, admin, and turf-owner flows.
- `Backend/sports-app-backend/` — Express REST API, Prisma ORM, and PostgreSQL.
- `Backend/academypro/` — second React/Vite app that overlaps with the primary frontend. Treat it as a legacy/reference surface until a single deployable frontend is selected.

## Run locally

Requirements: Node.js 20+ (Node 22 recommended), npm, PostgreSQL 15+.

### Backend
```bash
cd Backend/sports-app-backend
cp .env.example .env
# Set DATABASE_URL and a unique JWT_SECRET (32+ characters) in .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
# Optional .env.local: VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

Backend environment variables: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`. The frontend supports `VITE_API_BASE_URL`. Never commit `.env`, production credentials, private data, or database dumps.

## Verified gaps to close before production

1. Add JWT verification and role/ownership enforcement to every protected API route. Public signup must never permit self-assignment of `ADMIN`.
2. Reconcile `prisma/schema.prisma` and legacy `src/prisma/schema.prisma`, then create/test migrations.
3. Make turf booking atomic, verify the selected slot belongs to the selected turf, and derive the student identity from the authenticated session.
4. Replace dashboard mock metrics and demo actions with persistent data and tested APIs.
5. Consolidate duplicate frontends and test student, coach, admin, and turf-owner workflows end-to-end.
6. Configure managed PostgreSQL, production secrets, strict CORS, backups, monitoring, and production frontend/API URLs.

A successful build alone does not mean that authentication, bookings, or dashboards are production-ready.
