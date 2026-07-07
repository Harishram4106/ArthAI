import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import { requireAuth } from '../auth/auth.routes';
import { createAuditLog } from '../audit/audit.service';

const router = Router();

router.get('/slots', requireAuth, (req: Request, res: Response) => {
  // Return dummy available slots
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const slots = [
    { id: 's1', date: tomorrow.toISOString().split('T')[0], time: '10:00 AM', advisor: 'Ravi Kumar' },
    { id: 's2', date: tomorrow.toISOString().split('T')[0], time: '02:00 PM', advisor: 'Sneha Patel' },
  ];
  res.json(slots);
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type, date, time, advisorName, branch } = req.body;
    
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        type,
        date: new Date(date),
        time,
        advisorName,
        branch,
        status: 'Confirmed'
      }
    });

    await createAuditLog(
      userId,
      'Human Advisor Appointment Booked',
      'System',
      { appointmentId: appointment.id, type, advisorName }
    );

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/latest', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const appointment = await prisma.appointment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    if (!appointment) {
      return res.status(404).json({ error: 'No appointment found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest appointment' });
  }
});

export default router;
