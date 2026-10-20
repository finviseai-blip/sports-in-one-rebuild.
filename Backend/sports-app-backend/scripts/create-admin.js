#!/usr/bin/env node
require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('../src/config/database');

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) ||
      typeof password !== 'string' || password.length < 16) {
    throw new Error('Set ADMIN_NAME, a valid ADMIN_EMAIL, and ADMIN_PASSWORD with at least 16 characters.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('An account with that email already exists. No existing account was modified.');
  }

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: 'ADMIN'
    },
    select: { id: true, name: true, email: true, role: true }
  });

  console.log(`Administrator created: ${admin.email} (id: ${admin.id}). Password was not printed.`);
}

main()
  .catch((error) => {
    console.error('Admin provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
