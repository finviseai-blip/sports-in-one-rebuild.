# Sports-in-One — Rebuild

Sports-in-One is a sports academy and turf-booking platform. The uploaded source archive is the application baseline; this private repository is its active rebuild target.

## Current status
- The source application includes a React/Vite frontend, an Express/Prisma API, and a second academy-focused frontend that overlaps substantially with the primary frontend.
- The app source is not yet present on `main`; work is being staged on `feature/restore-app-and-hardening`.
- Existing dashboards include demo/mock values, and API routes need authorization before production use.

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

## Environment
Backend `.env` should set `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`. Frontend supports `VITE_API_BASE_URL`. Never commit `.env`, secrets, private data or database dumps.

## Production blockers to resolve before launch
1. Add JWT verification and role/ownership enforcement to every protected API route. Public signup must not allow self-assignment of `ADMIN`.
2. Keep one canonical Prisma schema and add migrations. The legacy `src/prisma/schema.prisma` conflicts with `prisma/schema.prisma` and requires reconciliation.
3. Make turf booking atomic and enforce that the selected slot belongs to the chosen turf; derive student identity from the authenticated session.
4. Replace dashboard mock values and demo actions with persistent data and tested APIs.
5. Consolidate duplicate frontend apps and test student, coach, admin and turf-owner flows end-to-end.
6. Configure managed PostgreSQL, secrets, strict CORS, backups, monitoring and production API URLs.

This rebuild is not production-ready until the above items are implemented and tested.