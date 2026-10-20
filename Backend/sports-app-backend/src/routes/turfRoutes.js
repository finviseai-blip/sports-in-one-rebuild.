const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Turf discovery is public; only authenticated operators may list a new venue.
router.get('/', turfController.getAllTurfs);
router.get('/:id', turfController.getTurfById);
router.post('/', verifyToken, requireRole('TURF_OWNER', 'ADMIN'), turfController.createTurf);

module.exports = router;
