// Main server file
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { startDb } = require("./src/config/embeddedDb");

const app = express();

// Middleware: explicit CORS allowlist for browser origins.
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
app.use(express.json({ limit: '1mb' }));

// Health endpoint intentionally reveals no internal configuration.
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
});

// Routes
const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const coachRoutes = require("./src/routes/coachRoutes");
const turfRoutes = require("./src/routes/turfRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const eventRoutes = require("./src/routes/eventRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/turfs", turfRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/events", eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await startDb();
  } catch (err) {
    console.error("Database initialization warning:", err.message);
  }

  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
  }

  app.listen(PORT, () => {
    console.log(`Sports-in-One API listening on port ${PORT}`);
  });
}

bootstrap();