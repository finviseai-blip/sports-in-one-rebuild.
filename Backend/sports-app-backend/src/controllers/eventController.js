const prisma = require('../config/database');

const eventInclude = {
  coach: { select: { id: true, name: true, email: true, role: true } }
};

exports.getAllEvents = async (_req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: eventInclude,
      orderBy: { date: 'asc' }
    });
    return res.status(200).json(events);
  } catch (error) {
    console.error('Get events failed:', error.message);
    return res.status(500).json({ error: 'Unable to load events' });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const registrations = await prisma.eventInvite.findMany({
      where: { studentId: req.user.userId },
      include: { event: { include: eventInclude } },
      orderBy: { createdAt: 'desc' }
    });
    const events = registrations.map(({ event, status, createdAt }) => ({
      ...event,
      registrationStatus: status,
      registeredAt: createdAt
    }));
    return res.status(200).json({ events });
  } catch (error) {
    console.error('Get student event registrations failed:', error.message);
    return res.status(500).json({ error: 'Unable to load your event registrations' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: eventInclude
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.status(200).json(event);
  } catch (error) {
    console.error('Get event failed:', error.message);
    return res.status(500).json({ error: 'Unable to load event' });
  }
};

exports.registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const studentId = req.user.userId;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, date: true }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.date <= new Date()) {
      return res.status(400).json({ error: 'Registration is closed because this event has started or ended' });
    }

    // Serialize repeated registration attempts for the same event/student pair.
    // The transaction-scoped advisory lock prevents duplicate rows even before a
    // unique database index has been added to older installations.
    const registration = await prisma.$transaction(async (tx) => {
      const lockKey = `event-registration:${eventId}:${studentId}`;
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const existing = await tx.eventInvite.findFirst({
        where: { eventId, studentId }
      });
      if (existing) {
        if (existing.status !== 'ACCEPTED') {
          return tx.eventInvite.update({
            where: { id: existing.id },
            data: { status: 'ACCEPTED' },
            include: { event: { include: eventInclude } }
          });
        }
        return tx.eventInvite.findUnique({
          where: { id: existing.id },
          include: { event: { include: eventInclude } }
        });
      }

      return tx.eventInvite.create({
        data: { eventId, studentId, status: 'ACCEPTED' },
        include: { event: { include: eventInclude } }
      });
    });

    return res.status(200).json({
      message: 'Event registration saved',
      registration
    });
  } catch (error) {
    console.error('Register for event failed:', error.message);
    return res.status(500).json({ error: 'Unable to register for this event' });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACCEPTED or DECLINED' });
  }

  try {
    const registration = await prisma.eventInvite.findFirst({
      where: { eventId: req.params.id, studentId: req.user.userId }
    });
    if (!registration) {
      return res.status(404).json({ error: 'No invitation or registration exists for this event' });
    }

    const updated = await prisma.eventInvite.update({
      where: { id: registration.id },
      data: { status },
      include: { event: { include: eventInclude } }
    });
    return res.status(200).json({ message: 'Registration status updated', registration: updated });
  } catch (error) {
    console.error('Update event registration failed:', error.message);
    return res.status(500).json({ error: 'Unable to update registration status' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, coachId } = req.body || {};
    if (typeof title !== 'string' || !title.trim() ||
        !date || Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'A title and valid event date are required' });
    }
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ error: 'Event date must be in the future' });
    }

    let authorizedCoachId = req.user.userId;
    if (req.user.role === 'ADMIN' && coachId) {
      const coach = await prisma.user.findFirst({
        where: { id: coachId, role: 'COACH' },
        select: { id: true }
      });
      if (!coach) return res.status(400).json({ error: 'The selected coach does not exist' });
      authorizedCoachId = coach.id;
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
        date: eventDate,
        coachId: authorizedCoachId
      },
      include: eventInclude
    });
    return res.status(201).json(event);
  } catch (error) {
    console.error('Create event failed:', error.message);
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'The selected coach is invalid' });
    }
    return res.status(500).json({ error: 'Unable to create event' });
  }
};
