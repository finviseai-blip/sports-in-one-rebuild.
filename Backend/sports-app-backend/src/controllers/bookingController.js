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
    if (slot.isBlocked) return res.status(409).json({ error: 'This slot is blocked by the turf owner' });
    if (slot.turfId !== turfId) {
      return res.status(400).json({ error: 'The selected slot does not belong to this turf' });
    }
    if (slot.startTime <= new Date()) {
      return res.status(400).json({ error: 'Bookings must be made before a slot begins' });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const claimed = await tx.turfSlot.updateMany({
        where: { id: slotId, turfId, isBooked: false, isBlocked: false, startTime: { gt: new Date() } },
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

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { studentId: req.user.userId },
      include: safeBookingInclude,
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get my bookings failed:', error.message);
    return res.status(500).json({ error: 'Unable to load your bookings' });
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

exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { slot: true }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.studentId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }
    if (booking.status === 'CANCELLED') {
      return res.status(200).json({ message: 'Booking is already cancelled', booking });
    }
    if (booking.slot.startTime <= new Date()) {
      return res.status(400).json({ error: 'A booking cannot be cancelled after its slot has started' });
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: { id: booking.id, studentId: req.user.userId, status: 'CONFIRMED' },
        data: { status: 'CANCELLED' }
      });
      if (updated.count !== 1) {
        const conflict = new Error('BOOKING_STATE_CHANGED');
        conflict.status = 409;
        throw conflict;
      }
      await tx.turfSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      });
      return tx.booking.findUnique({
        where: { id: booking.id },
        include: safeBookingInclude
      });
    });
    return res.status(200).json({ message: 'Booking cancelled', booking: cancelled });
  } catch (error) {
    if (error.status === 409 || error.message === 'BOOKING_STATE_CHANGED') {
      return res.status(409).json({ error: 'Booking status changed. Refresh and try again.' });
    }
    console.error('Cancel booking failed:', error.message);
    return res.status(500).json({ error: 'Unable to cancel booking' });
  }
};
