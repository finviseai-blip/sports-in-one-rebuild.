#!/usr/bin/env bash
set -euo pipefail

# Run from the checked-out private Sports-in-One rebuild repository.
# The workflow checks out the public source into ./upstream before calling this script.
if [[ ! -d "upstream" ]]; then
  echo "Expected upstream/ checkout is missing." >&2
  exit 1
fi

# Copy the upstream application without importing its Git metadata.
rsync -a --exclude='.git/' upstream/ ./

# Remove placeholder lockfiles and unused demo-only login pages.
rm -f package-lock.json Backend/package-lock.json
rm -f Frontend/src/pages/Login.jsx Backend/academypro/src/pages/Login.jsx

# One canonical project setup guide; the app is a starting point, not a production-ready release.
cat > README.md <<'EOF'
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
EOF

cat > .gitignore <<'EOF'
# Dependencies and generated builds
node_modules/
**/node_modules/
dist/
**/dist/
build/
**/build/

# Environment files / secrets
.env
.env.*
!.env.example
**/.env
**/.env.*
!**/.env.example
*.pem
*.key

# Local databases, PostgreSQL data and logs
**/.pgdata/
**/.pgdata/**
*.log
**/*.log
*.sqlite
*.db

# Tooling and OS
.cache/
.eslintcache
.DS_Store
Thumbs.db
.vscode/
.idea/
EOF

python3 <<'PY'
from pathlib import Path
import json
import shutil

def replace_required(path, old, new):
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Expected code pattern not found in {path}; refusing an unsafe partial patch.")
    p.write_text(text.replace(old, new, 1))

# Frontend API origins are configured per environment rather than baked into the bundle.
for name in (
    "Frontend/src/api/api.js",
    "Backend/academypro/src/api/api.js",
):
    p = Path(name)
    if p.exists():
        text = p.read_text().replace(
            'baseURL: "http://localhost:5000/api"',
            'baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"',
        )
        p.write_text(text)

Path("Frontend/.env.example").write_text(
    "VITE_API_BASE_URL=http://localhost:5000/api\n"
)
Path("Backend/sports-app-backend/.env.example").write_text("""NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:CHANGE_ME@localhost:5432/sports_db
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
CORS_ORIGIN=http://localhost:5173,http://localhost:4173

# Embedded PostgreSQL is optional and disabled by default.
ENABLE_EMBEDDED_POSTGRES=false
# Required only when ENABLE_EMBEDDED_POSTGRES=true:
# PGPASSWORD=use-a-local-only-password
# PGHOST=127.0.0.1
# PGPORT=5432
""")

# Prevent the source's fixed database password from being committed.
replace_required(
    "Backend/sports-app-backend/src/config/embeddedDb.js",
    "async function startDb() {\n  const alreadyRunning = await isPortOpen(5432);",
    """async function startDb() {
  if (process.env.ENABLE_EMBEDDED_POSTGRES !== 'true') {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required. Configure a managed or local PostgreSQL database.');
    }
    return null;
  }
  if (!process.env.PGPASSWORD) {
    throw new Error('PGPASSWORD is required when embedded PostgreSQL is explicitly enabled.');
  }
  const alreadyRunning = await isPortOpen(Number(process.env.PGPORT || 5432), process.env.PGHOST || '127.0.0.1');"""
)
replace_required(
    "Backend/sports-app-backend/src/config/embeddedDb.js",
    "password: 'Schaudhari_14@#',\n    port: 5432,",
    "password: process.env.PGPASSWORD,\n    port: Number(process.env.PGPORT || 5432),"
)

# Safer authentication defaults: validate input, normalize email, remove fallback signing secret,
# and prohibit public self-provisioning of admin accounts.
p = Path("Backend/sports-app-backend/src/controllers/authController.js")
s = p.read_text()
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "const prisma = require('../config/database');",
    """const prisma = require('../config/database');

function signAuthToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, dob: user.dob };
}"""
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    """    const { email, password, name, phone, dob, role } = req.body;
    
    // Check if user exists""",
    """    const { email, password, name, phone, dob, role } = req.body;
    if (typeof email !== 'string' || !/^\\S+@\\S+\\.\\S+$/.test(email.trim()) ||
        typeof password !== 'string' || password.length < 8 ||
        typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Valid name and email plus a password of at least 8 characters are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (String(role || '').toUpperCase() === 'ADMIN') {
      return res.status(403).json({ message: 'Admin accounts must be provisioned by an operator' });
    }

    // Check if user exists"""
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "where: { email },",
    "where: { email: normalizedEmail },"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "        email,",
    "        email: normalizedEmail,"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' })",
    "signAuthToken(user)"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, dob: user.dob }",
    "user: publicUser(user)"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "res.status(500).json({ message: error.message, error: error.message });",
    "res.status(500).json({ message: 'Registration failed. Check server configuration and try again.' });"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    """    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
    });""",
    """    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });"""
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' })",
    "signAuthToken(user)"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, dob: user.dob }",
    "user: publicUser(user)"
)
replace_required(
    "Backend/sports-app-backend/src/controllers/authController.js",
    "res.status(500).json({ message: error.message, error: error.message });",
    "res.status(500).json({ message: 'Login failed. Check server configuration and try again.' });"
)

replace_required(
    "Backend/sports-app-backend/src/middleware/authMiddleware.js",
    "    const decoded = jwt.verify(token, process.env.JWT_SECRET);",
    """    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({ error: 'Authentication is not configured on this server' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);"""
)

# Explicit browser-origin allowlist, bounded JSON payloads, and a database readiness endpoint.
replace_required(
    "Backend/sports-app-backend/server.js",
    """// Middleware
app.use(cors());
app.use(express.json());""",
    """// Middleware: explicit CORS allowlist for browser origins.
const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));"""
)
replace_required(
    "Backend/sports-app-backend/server.js",
    """// Root route (health check)
app.get("/", (req, res) => {
  res.send("AcademyPro Backend API Running 🚀");
});""",
    """// Health endpoint intentionally reveals no internal configuration.
app.get('/', (req, res) => {
  res.json({ service: 'Sports-in-One API', status: 'ok' });
});

app.get('/health', async (req, res) => {
  try {
    const prisma = require('./src/config/database');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});"""
)
replace_required(
    "Backend/sports-app-backend/server.js",
    """  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });""",
    """  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
  }

  app.listen(PORT, () => {
    console.log(`Sports-in-One API listening on port ${PORT}`);
  });"""
)

# Add a reproducible backend syntax-check command while preserving dependency versions.
p = Path("Backend/sports-app-backend/package.json")
package = json.loads(p.read_text())
package.setdefault("scripts", {})["check"] = (
    "node --check server.js && node --check src/controllers/authController.js && "
    "node --check src/controllers/bookingController.js && node --check src/controllers/coachController.js && "
    "node --check src/controllers/eventController.js && node --check src/controllers/studentController.js && "
    "node --check src/controllers/turfController.js"
)
p.write_text(json.dumps(package, indent=2) + "\n")

# Remove the temporary checkout so Git never records it as a submodule.
shutil.rmtree("upstream", ignore_errors=True)

Path(".sports-in-one-source-imported").write_text(
    "Source restored from SRchaudhari15/Sports-in-One and initial hardening applied.\n"
)
PY

# Check critical files for syntax errors and ensure no known source secrets survived.
node --check Backend/sports-app-backend/server.js
node --check Backend/sports-app-backend/src/controllers/authController.js
node --check Backend/sports-app-backend/src/middleware/authMiddleware.js
node --check Backend/sports-app-backend/src/config/embeddedDb.js
if grep -R --exclude-dir=node_modules --exclude-dir=.git -nE "Schaudhari_14@#|fallback_secret|password:[[:space:]]*['\"]123456" Backend Frontend; then
  echo "Unexpected hard-coded credential pattern detected." >&2
  exit 1
fi

echo "Restored source and applied initial hardening."
