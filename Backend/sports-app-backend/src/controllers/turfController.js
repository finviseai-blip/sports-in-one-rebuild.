const prisma = require('../config/prisma');

exports.createTurf = async (req, res) => {
  const { name, location, pricePerHour, ownerId } = req.body;
  try {
    const turf = await prisma.turf.create({
      data: { name, location, pricePerHour, ownerId }
    });

    // Automatically generate 6AM-10PM slots for the next 7 days
    const slots = [];
    const today = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      for (let hour = 6; hour < 22; hour++) {
        const slotStart = new Date(today);
        slotStart.setDate(today.getDate() + dayOffset);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        slots.push({
          turfId: turf.id,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: false
        });
      }
    }

    await prisma.turfSlot.createMany({
      data: slots
    });

    res.status(201).json({ message: 'Turf and 112 slots (7 days) created successfully', turf });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await prisma.turf.findMany({
      include: {
        slots: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    res.status(200).json({ turfs });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    res.status(200).json({ turf });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
