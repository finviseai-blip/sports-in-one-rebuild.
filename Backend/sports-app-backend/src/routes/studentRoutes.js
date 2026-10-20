const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('ADMIN', 'COACH'), studentController.getAllStudents);
router.get('/:id/analytics', verifyToken, requireRole('ADMIN', 'COACH', 'STUDENT'), studentController.getStudentAnalytics);
router.get('/:id', verifyToken, requireRole('ADMIN', 'COACH', 'STUDENT'), studentController.getStudentById);
router.post('/', verifyToken, requireRole('ADMIN'), studentController.createStudent);

module.exports = router;
