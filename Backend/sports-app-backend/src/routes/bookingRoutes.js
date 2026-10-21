const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('ADMIN', 'TURF_OWNER'), bookingController.getAllBookings);
router.get('/mine', verifyToken, requireRole('STUDENT'), bookingController.getMyBookings);
router.post('/', verifyToken, requireRole('STUDENT'), bookingController.createBooking);
router.patch('/:id/cancel', verifyToken, requireRole('STUDENT'), bookingController.cancelMyBooking);
router.get('/:id', verifyToken, requireRole('ADMIN', 'TURF_OWNER', 'STUDENT'), bookingController.getBookingById);

module.exports = router;
