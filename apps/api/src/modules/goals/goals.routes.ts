import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import { requireAuth } from '../auth/auth.routes';
import { goalsService } from './goals.service';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    
    // Fetch user risk profile to determine CAGR assumption
    const assessment = await prisma.riskAssessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    const riskProfile = assessment?.profile || 'Moderate';
    
    const enrichedGoals = goals.map(g => goalsService.calculateGoalFeasibility(g, riskProfile));
    res.json(enrichedGoals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, target, current, targetYear, category, status } = req.body;
    
    const goal = await prisma.goal.create({
      data: {
        userId,
        name,
        target,
        current,
        targetYear,
        category,
        status: status || 'Building'
      }
    });

    res.json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const id = req.params.id as string;
    const updateData = req.body;

    // verify ownership
    const existing = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData
    });

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const id = req.params.id as string;

    const existing = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.goal.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
