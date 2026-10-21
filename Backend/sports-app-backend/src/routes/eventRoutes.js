const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('STUDENT', 'COACH', 'ADMIN'), eventController.getAllEvents);
router.get('/mine', verifyToken, requireRole('STUDENT'), eventController.getMyEvents);
router.post('/:id/register', verifyToken, requireRole('STUDENT'), eventController.registerForEvent);
router.patch('/:id/registration', verifyToken, requireRole('STUDENT'), eventController.updateRegistrationStatus);
router.get('/:id', verifyToken, requireRole('STUDENT', 'COACH', 'ADMIN'), eventController.getEventById);
router.post('/', verifyToken, requireRole('COACH', 'ADMIN'), eventController.createEvent);

module.exports = router;
