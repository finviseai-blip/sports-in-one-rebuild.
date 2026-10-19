const prisma = require('../config/database');

// Student Controller
exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' }
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.user.findUnique({
      where: { id }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch student information
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: true,
        performances: true,
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Default stats if none exist
    const stats = {
      attendance: '90%',
      matches: student.bookings.length || 0,
      goals: 0,
      rank: '#N/A'
    };

    // Attempt to calculate from performances if they exist
    if (student.performances.length > 0) {
      // Logic to parse metrics can go here
      // For now, let's return some mock-derived stats
      stats.attendance = '95%';
      stats.rank = '#5';
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, dob } = req.body;
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password, // Should be hashed in a production app
        phone,
        dob: dob ? new Date(dob) : null,
        role: 'STUDENT'
      }
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
