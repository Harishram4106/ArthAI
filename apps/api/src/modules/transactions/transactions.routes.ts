import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import { requireAuth } from '../auth/auth.routes';
import { TransactionsService } from './transactions.service';
import { createAuditLog } from '../audit/audit.service';

const router = Router();
const transactionsService = new TransactionsService();

router.get('/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const summary = await transactionsService.getFinancialSnapshot(userId);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

router.post('/upload-csv', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { csvData } = req.body;
    
    if (!csvData) {
      res.status(400).json({ error: 'Missing csvData' });
      return;
    }

    const count = await transactionsService.ingestCsv(userId, csvData);

    await createAuditLog(
      userId,
      'Transactions Ingested',
      'System',
      { recordCount: count }
    );

    res.json({ message: `Successfully ingested ${count} transactions` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
