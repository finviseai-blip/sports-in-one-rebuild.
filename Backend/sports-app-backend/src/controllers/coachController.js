const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const publicCoachSelect = {
  id: true, name: true, email: true, phone: true, dob: true, role: true, createdAt: true
};

exports.getAllCoaches = async (_req, res) => {
  try {
    const coaches = await prisma.user.findMany({
      where: { role: 'COACH' },
      select: publicCoachSelect
    });
    return res.status(200).json(coaches);
  } catch (error) {
    console.error('Get coaches failed:', error.message);
    return res.status(500).json({ error: 'Unable to load coaches' });
  }
};

exports.getCoachById = async (req, res) => {
  try {
    const coach = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...publicCoachSelect,
        events: { orderBy: { date: 'asc' } },
        studentsOfCoach: { select: { id: true, studentId: true, coachId: true, createdAt: true } }
      }
    });
    if (!coach || coach.role !== 'COACH') {
      return res.status(404).json({ message: 'Coach not found' });
    }
    return res.status(200).json(coach);
  } catch (error) {
    console.error('Get coach failed:', error.message);
    return res.status(500).json({ error: 'Unable to load coach' });
  }
};

exports.createCoach = async (req, res) => {
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

    const coach = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 10),
        phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
        dob: parsedDob,
        role: 'COACH'
      },
      select: publicCoachSelect
    });
    return res.status(201).json(coach);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    console.error('Create coach failed:', error.message);
    return res.status(500).json({ error: 'Unable to create coach' });
  }
};
