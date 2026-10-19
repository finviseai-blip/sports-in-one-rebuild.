const prisma = require('../config/prisma');

exports.createBooking = async (req, res) => {
  const { turfId, slotId, studentId } = req.body;
  try {
    // Validate slot availability
    const slot = await prisma.turfSlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    if (slot.isBooked) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }

    // Transaction to ensure slot is marked booked ONLY if booking applies
    const [updatedSlot, booking] = await prisma.$transaction([
      prisma.turfSlot.update({
        where: { id: slotId },
        data: { isBooked: true }
      }),
      prisma.booking.create({
        data: {
          turfId: turfId,
          slotId: slotId,
          studentId: studentId,
          status: 'CONFIRMED'
        }
      })
    ]);

    res.status(201).json({ message: 'Booking successful', booking, updatedSlot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { turf: true, slot: true, student: true }
    });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { turf: true, slot: true, student: true }
    });
    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
