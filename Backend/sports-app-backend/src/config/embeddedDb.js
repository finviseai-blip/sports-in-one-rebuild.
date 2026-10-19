const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');
const net = require('net');

function isPortOpen(port = 5432, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

let pgInstance = null;

async function startDb() {
  if (process.env.ENABLE_EMBEDDED_POSTGRES !== 'true') {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required. Configure a managed or local PostgreSQL database.');
    }
    return null;
  }
  if (!process.env.PGPASSWORD) {
    throw new Error('PGPASSWORD is required when embedded PostgreSQL is explicitly enabled.');
  }
  const alreadyRunning = await isPortOpen(Number(process.env.PGPORT || 5432), process.env.PGHOST || '127.0.0.1');
  if (alreadyRunning) {
    console.log('✅ PostgreSQL is already running on port 5432.');
    return null;
  }

  const dbDir = path.join(__dirname, '.pgdata');
  pgInstance = new EmbeddedPostgres({
    databaseDir: dbDir,
    user: 'postgres',
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432),
    persistent: true,
  });

  const isInit = fs.existsSync(path.join(dbDir, 'PG_VERSION'));
  if (!isInit) {
    console.log('Initializing embedded postgres...');
    await pgInstance.initialise();
  }

  console.log('Starting embedded postgres on port 5432...');
  await pgInstance.start();
  console.log('✅ Embedded PostgreSQL running on port 5432');

  try {
    await pgInstance.createDatabase('sports_db');
  } catch (e) {
    // Database already exists
  }

  return pgInstance;
}

module.exports = { startDb };

if (require.main === module) {
  startDb().then(() => console.log('DB Ready!'));
}
