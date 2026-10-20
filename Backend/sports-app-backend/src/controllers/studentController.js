const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

function canAccessStudent(req, studentId) {
  return req.user.role !== 'STUDENT' || req.user.userId === studentId;
}

exports.getAllStudents = async (_req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true, phone: true, dob: true, role: true, createdAt: true }
    });
    return res.status(200).json(students);
  } catch (error) {
    console.error('Get students failed:', error.message);
    return res.status(500).json({ error: 'Unable to load students' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!canAccessStudent(req, id)) {
      return res.status(403).json({ error: 'You can only access your own student profile' });
    }

    const student = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, dob: true, role: true, createdAt: true }
    });
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json(student);
  } catch (error) {
    console.error('Get student failed:', error.message);
    return res.status(500).json({ error: 'Unable to load student' });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    if (!canAccessStudent(req, id)) {
      return res.status(403).json({ error: 'You can only access your own analytics' });
    }

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        bookings: { select: { id: true } },
        performances: { select: { id: true, metrics: true } }
      }
    });
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const goals = student.performances.reduce((total, record) => {
      const raw = record.metrics && typeof record.metrics === 'object' ? Number(record.metrics.goals) : 0;
      return total + (Number.isFinite(raw) ? raw : 0);
    }, 0);

    return res.status(200).json({
      attendance: null,
      matches: student.bookings.length,
      goals,
      rank: null,
      performanceRecords: student.performances.length
    });
  } catch (error) {
    console.error('Analytics failed:', error.message);
    return res.status(500).json({ error: 'Unable to calculate student analytics' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, dob } = req.body || {};
    if (typeof name !== 'string' || !name.trim() ||
        typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()) ||
        typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Name, valid email, and a password of at least 8 characters are required' });
    }

    const parsedDob = dob ? new Date(dob) : null;
    if (dob && Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ error: 'Date of birth is invalid' });
    }

    const student = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 10),
        phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
        dob: parsedDob,
        role: 'STUDENT'
      },
      select: { id: true, name: true, email: true, phone: true, dob: true, role: true, createdAt: true }
    });
    return res.status(201).json(student);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    console.error('Create student failed:', error.message);
    return res.status(500).json({ error: 'Unable to create student' });
  }
};
