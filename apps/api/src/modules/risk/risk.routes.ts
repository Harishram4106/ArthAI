import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import { requireAuth } from '../auth/auth.routes';
import { createAuditLog } from '../audit/audit.service';

const router = Router();

export const riskQuestions = [
  { 
    id: 'age', 
    key: 'rq.1', 
    options: [
      { key: 'ra.under30', value: 'under30', points: 4 },
      { key: 'ra.30-45', value: '30-45', points: 3 },
      { key: 'ra.45-60', value: '45-60', points: 2 },
      { key: 'ra.60+', value: '60+', points: 1 },
    ]
  },
  { 
    id: 'income', 
    key: 'rq.2', 
    options: [
      { key: 'ra.stable', value: 'stable', points: 3 },
      { key: 'ra.variable', value: 'variable', points: 2 },
      { key: 'ra.irregular', value: 'irregular', points: 1 },
    ]
  },
  { 
    id: 'goal', 
    key: 'rq.3', 
    options: [
      { key: 'ra.grow', value: 'grow', points: 4 },
      { key: 'ra.retire', value: 'retire', points: 3 },
      { key: 'ra.child', value: 'child', points: 3 },
      { key: 'ra.home', value: 'home', points: 2 },
      { key: 'ra.safety', value: 'safety', points: 1 },
    ]
  },
  { 
    id: 'horizon', 
    key: 'rq.4', 
    options: [
      { key: 'ra.lt1', value: 'lt1', points: 1 },
      { key: 'ra.1-3', value: '1-3', points: 2 },
      { key: 'ra.3-7', value: '3-7', points: 3 },
      { key: 'ra.7+', value: '7+', points: 4 },
    ]
  },
  { 
    id: 'reaction', 
    key: 'rq.5', 
    options: [
      { key: 'ra.sellAll', value: 'sellAll', points: 1 },
      { key: 'ra.sellSome', value: 'sellSome', points: 2 },
      { key: 'ra.hold', value: 'hold', points: 3 },
      { key: 'ra.investMore', value: 'investMore', points: 4 },
    ]
  },
  { 
    id: 'experience', 
    key: 'rq.6', 
    options: [
      { key: 'ra.new', value: 'new', points: 1 },
      { key: 'ra.some', value: 'some', points: 2 },
      { key: 'ra.experienced', value: 'experienced', points: 3 },
    ]
  },
];

export function computeRiskScore(answers: Record<string, string>): number {
  let total = 0;
  for (const q of riskQuestions) {
    const ans = answers[q.id];
    const opt = q.options.find(o => o.value === ans);
    if (opt) total += opt.points;
  }
  return total;
}

export function scoreToProfile(score: number): string {
  if (score <= 10) return 'Conservative';
  if (score <= 18) return 'Moderate';
  return 'Aggressive';
}

router.get('/questions', (req: Request, res: Response) => {
  res.json(riskQuestions);
});

router.post('/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { answers } = req.body;
    
    if (!answers) {
      res.status(400).json({ error: 'Answers are required' });
      return;
    }

    const score = computeRiskScore(answers);
    const profile = scoreToProfile(score);

    const assessment = await prisma.riskAssessment.create({
      data: {
        userId,
        score,
        profile,
        answers: JSON.stringify(answers)
      }
    });

    // Write to audit log
    await createAuditLog(
      userId,
      'Risk Profile Assessed',
      'Risk',
      { score, profile }
    );

    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit risk assessment' });
  }
});

router.get('/latest', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const assessment = await prisma.riskAssessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assessment || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

export default router;
