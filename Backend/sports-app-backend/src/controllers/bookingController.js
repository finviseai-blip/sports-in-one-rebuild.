const prisma = require('../config/prisma');

const safeBookingInclude = {
  turf: true,
  slot: true,
  student: { select: { id: true, name: true, email: true, role: true } }
};

exports.createBooking = async (req, res) => {
  const { turfId, slotId } = req.body || {};
  const studentId = req.user.userId;

  if (typeof turfId !== 'string' || typeof slotId !== 'string') {
    return res.status(400).json({ error: 'A turf and available time slot are required' });
  }

  try {
    const slot = await prisma.turfSlot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.turfId !== turfId) {
      return res.status(400).json({ error: 'The selected slot does not belong to this turf' });
    }
    if (slot.startTime <= new Date()) {
      return res.status(400).json({ error: 'Bookings must be made before a slot begins' });
    }

    // Conditional update is atomic: only one concurrent request can claim an unbooked slot.
    const booking = await prisma.$transaction(async (tx) => {
      const claimed = await tx.turfSlot.updateMany({
        where: { id: slotId, turfId, isBooked: false, startTime: { gt: new Date() } },
        data: { isBooked: true }
      });
      if (claimed.count !== 1) {
        const conflict = new Error('SLOT_UNAVAILABLE');
        conflict.status = 409;
        throw conflict;
      }
      return tx.booking.create({
        data: { turfId, slotId, studentId, status: 'CONFIRMED' },
        include: safeBookingInclude
      });
    });

    return res.status(201).json({ message: 'Booking successful', booking });
  } catch (error) {
    if (error.status === 409 || error.message === 'SLOT_UNAVAILABLE' || error.code === 'P2002') {
      return res.status(409).json({ error: 'This time slot was just booked. Choose another slot.' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'The booking references an invalid student, turf, or slot' });
    }
    console.error('Create booking failed:', error.message);
    return res.status(500).json({ error: 'Unable to create booking' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const where = req.user.role === 'TURF_OWNER'
      ? { turf: { is: { ownerId: req.user.userId } } }
      : {};

    const bookings = await prisma.booking.findMany({
      where,
      include: safeBookingInclude,
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get bookings failed:', error.message);
    return res.status(500).json({ error: 'Unable to load bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: safeBookingInclude
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (req.user.role === 'STUDENT' && booking.studentId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only access your own bookings' });
    }
    if (req.user.role === 'TURF_OWNER' && booking.turf.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only access bookings for your own turfs' });
    }
    return res.status(200).json({ booking });
  } catch (error) {
    console.error('Get booking failed:', error.message);
    return res.status(500).json({ error: 'Unable to load booking' });
  }
};
