const prisma = require('../config/prisma');

exports.createTurf = async (req, res) => {
  const { name, location, pricePerHour } = req.body || {};
  const numericPrice = Number(pricePerHour);
  if (typeof name !== 'string' || !name.trim() ||
      typeof location !== 'string' || !location.trim() ||
      !Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'Name, location, and a positive hourly price are required' });
  }

  const ownerId = req.user.role === 'ADMIN' && typeof req.body.ownerId === 'string'
    ? req.body.ownerId
    : req.user.userId;

  try {
    const turf = await prisma.turf.create({
      data: { name: name.trim(), location: location.trim(), pricePerHour: numericPrice, ownerId }
    });

    // Make future hourly slots visible to users; bookings still validate freshness and ownership.
    const slots = [];
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      for (let hour = 6; hour < 22; hour++) {
        const slotStart = new Date(today);
        slotStart.setDate(today.getDate() + dayOffset);
        slotStart.setHours(hour, 0, 0, 0);
        if (slotStart <= today) continue;
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        slots.push({ turfId: turf.id, startTime: slotStart, endTime: slotEnd, isBooked: false });
      }
    }

    if (slots.length) {
      await prisma.turfSlot.createMany({ data: slots });
    }
    return res.status(201).json({ message: 'Turf created successfully', turf, generatedSlots: slots.length });
  } catch (error) {
    console.error('Create turf failed:', error.message);
    return res.status(500).json({ error: 'Unable to create turf' });
  }
};

exports.getAllTurfs = async (_req, res) => {
  try {
    const turfs = await prisma.turf.findMany({
      include: {
        slots: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    return res.status(200).json({ turfs });
  } catch (error) {
    console.error('Get turfs failed:', error.message);
    return res.status(500).json({ error: 'Unable to load turfs' });
  }
};

exports.getTurfById = async (req, res) => {
  try {
    const turf = await prisma.turf.findUnique({
      where: { id: req.params.id },
      include: {
        slots: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    if (!turf) return res.status(404).json({ error: 'Turf not found' });
    return res.status(200).json({ turf });
  } catch (error) {
    console.error('Get turf failed:', error.message);
    return res.status(500).json({ error: 'Unable to load turf' });
  }
};
