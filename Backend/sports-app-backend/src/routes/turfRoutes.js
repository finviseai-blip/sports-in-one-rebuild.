const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Turf discovery is public; only authenticated operators may list a new venue.
router.get('/', turfController.getAllTurfs);
router.get('/mine', verifyToken, requireRole('TURF_OWNER', 'ADMIN'), turfController.getMyTurfs);
router.get('/:id', turfController.getTurfById);
router.post('/', verifyToken, requireRole('TURF_OWNER', 'ADMIN'), turfController.createTurf);
router.post('/:id/slots', verifyToken, requireRole('TURF_OWNER', 'ADMIN'), turfController.createSlot);
router.patch('/:id/slots/:slotId/block', verifyToken, requireRole('TURF_OWNER', 'ADMIN'), turfController.setSlotBlocked);

module.exports = router;
