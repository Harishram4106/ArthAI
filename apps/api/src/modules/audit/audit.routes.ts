import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import { requireAuth } from '../auth/auth.routes';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
    res.json(parsedLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.get('/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    
    // In a real app, generate a PDF. For MVP, we return structured JSON.
    res.json({
      title: 'Compliance Audit Report',
      generatedAt: new Date(),
      recordCount: logs.length,
      records: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
