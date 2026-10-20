// Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

function signAuthToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, dob: user.dob };
}

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, dob, role } = req.body;
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()) ||
        typeof password !== 'string' || password.length < 8 ||
        typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Valid name and email plus a password of at least 8 characters are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (role && String(role).toUpperCase() !== 'STUDENT') {
      return res.status(403).json({ message: 'This registration endpoint creates student accounts only' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = 'STUDENT';

    const parsedDob = dob && !isNaN(new Date(dob).getTime()) ? new Date(dob) : null;

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        phone: phone || null,
        dob: parsedDob,
        role: userRole,
      },
    });

    const token = signAuthToken(user);

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed. Check server configuration and try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signAuthToken(user);

    res.status(200).json({ 
      message: 'User logged in successfully',
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed. Check server configuration and try again.' });
  }
};
