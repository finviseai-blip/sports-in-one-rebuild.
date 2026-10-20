const prisma = require('../config/database');

exports.getAllEvents = async (_req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    return res.status(200).json(events);
  } catch (error) {
    console.error('Get events failed:', error.message);
    return res.status(500).json({ error: 'Unable to load events' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        invites: true,
        coach: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.status(200).json(event);
  } catch (error) {
    console.error('Get event failed:', error.message);
    return res.status(500).json({ error: 'Unable to load event' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, coachId } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || !date || Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'A title and valid event date are required' });
    }
    const authorizedCoachId = req.user.role === 'ADMIN' ? (coachId || req.user.userId) : req.user.userId;
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : null,
        date: new Date(date),
        coachId: authorizedCoachId
      }
    });
    return res.status(201).json(event);
  } catch (error) {
    console.error('Create event failed:', error.message);
    return res.status(500).json({ error: 'Unable to create event' });
  }
};
