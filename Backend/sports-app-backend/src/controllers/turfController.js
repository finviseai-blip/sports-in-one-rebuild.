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
          where: { isBooked: false, isBlocked: false, startTime: { gte: new Date() } },
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

exports.getMyTurfs = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId };
    const turfs = await prisma.turf.findMany({
      where,
      include: {
        slots: { where: { startTime: { gte: new Date() } }, orderBy: { startTime: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ turfs });
  } catch (error) {
    console.error('Get owned turfs failed:', error.message);
    return res.status(500).json({ error: 'Unable to load your turfs' });
  }
};

async function getOwnedTurf(req, res, turfId) {
  const turf = await prisma.turf.findUnique({ where: { id: turfId }, select: { id: true, ownerId: true } });
  if (!turf) {
    res.status(404).json({ error: 'Turf not found' });
    return null;
  }
  if (req.user.role !== 'ADMIN' && turf.ownerId !== req.user.userId) {
    res.status(403).json({ error: 'You can only manage slots for your own turfs' });
    return null;
  }
  return turf;
}

exports.createSlot = async (req, res) => {
  const { startTime, endTime } = req.body || {};
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (!startTime || !endTime || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ||
      start <= new Date() || end <= start || end - start > 6 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Provide a future start and end time; duration must be between 0 and 6 hours' });
  }
  try {
    const turf = await getOwnedTurf(req, res, req.params.id);
    if (!turf) return;
    const overlap = await prisma.turfSlot.findFirst({
      where: { turfId: turf.id, startTime: { lt: end }, endTime: { gt: start } },
      select: { id: true }
    });
    if (overlap) return res.status(409).json({ error: 'This slot overlaps an existing slot' });
    const slot = await prisma.turfSlot.create({
      data: { turfId: turf.id, startTime: start, endTime: end, isBooked: false }
    });
    return res.status(201).json({ message: 'Slot created', slot });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'A slot already exists for this time' });
    console.error('Create turf slot failed:', error.message);
    return res.status(500).json({ error: 'Unable to create slot' });
  }
};

exports.setSlotBlocked = async (req, res) => {
  const { blocked } = req.body || {};
  if (typeof blocked !== 'boolean') {
    return res.status(400).json({ error: 'blocked must be a boolean' });
  }
  try {
    const turf = await getOwnedTurf(req, res, req.params.id);
    if (!turf) return;
    const slot = await prisma.turfSlot.findUnique({ where: { id: req.params.slotId } });
    if (!slot || slot.turfId !== turf.id) return res.status(404).json({ error: 'Slot not found for this turf' });
    if (slot.startTime <= new Date()) return res.status(400).json({ error: 'Past or active slots cannot be changed' });
    if (slot.isBooked) return res.status(409).json({ error: 'A booked slot cannot be blocked or reopened' });
    const updated = await prisma.turfSlot.updateMany({
      where: { id: slot.id, turfId: turf.id, isBooked: false, startTime: { gt: new Date() } },
      data: { isBlocked: blocked }
    });
    if (updated.count !== 1) return res.status(409).json({ error: 'Slot changed concurrently; refresh and retry' });
    return res.status(200).json({ message: blocked ? 'Slot blocked' : 'Slot reopened' });
  } catch (error) {
    console.error('Update turf slot failed:', error.message);
    return res.status(500).json({ error: 'Unable to update slot' });
  }
};
