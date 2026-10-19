const prisma = require('../config/database');

// Coach Controller
exports.getAllCoaches = async (req, res) => {
  try {
    const coaches = await prisma.user.findMany({
      where: { role: 'COACH' }
    });
    res.status(200).json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCoachById = async (req, res) => {
  try {
    const { id } = req.params;
    const coach = await prisma.user.findUnique({
      where: { id },
      include: {
        events: true,
        studentsOfCoach: true
      }
    });
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    res.status(200).json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCoach = async (req, res) => {
  try {
    const { name, email, password, phone, dob } = req.body;
    const coach = await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone,
        dob: dob ? new Date(dob) : null,
        role: 'COACH'
      }
    });
    res.status(201).json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
