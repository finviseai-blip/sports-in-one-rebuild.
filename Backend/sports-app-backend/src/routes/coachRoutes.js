const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('STUDENT', 'COACH', 'TURF_OWNER', 'ADMIN'), coachController.getAllCoaches);
router.get('/:id', verifyToken, requireRole('STUDENT', 'COACH', 'TURF_OWNER', 'ADMIN'), coachController.getCoachById);
router.post('/', verifyToken, requireRole('ADMIN'), coachController.createCoach);

module.exports = router;
