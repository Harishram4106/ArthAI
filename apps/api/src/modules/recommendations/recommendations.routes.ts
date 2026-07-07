import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import { requireAuth } from '../auth/auth.routes';
import { createAuditLog } from '../audit/audit.service';

const router = Router();

function computeAllocation(
  surplus: number,
  profile: string,
  products: any[]
): any[] {
  const getP = (tag: string) => products.find(p => p.tag === tag);

  if (profile === 'Conservative') {
    const p1 = Math.round(surplus * 0.35);
    const p2 = Math.round(surplus * 0.35);
    const p3 = Math.round(surplus * 0.20);
    const p4 = surplus - p1 - p2 - p3;
    return [
      { product: getP('Emergency Buffer'), amount: p1, percentage: 35, rationale: 'High liquidity liquid debt fund. Instant T+1 redemption protects your cash needs.' },
      { product: getP('Capital Safety'), amount: p2, percentage: 35, rationale: '7.25% p.a. guaranteed returns with IDBI Bank sovereign DICGC deposit cover.' },
      { product: getP('Inflation Hedge'), amount: p3, percentage: 20, rationale: '2.5% fixed interest + tax-free gold price growth backed by Govt of India.' },
      { product: getP('Balanced Growth'), amount: p4, percentage: 10, rationale: 'Modest hybrid exposure to inflation-proof your capital without high downside.' },
    ].filter(a => a.product && a.amount > 0);
  }

  if (profile === 'Moderate') {
    const p1 = Math.round(surplus * 0.40);
    const p2 = Math.round(surplus * 0.25);
    const p3 = Math.round(surplus * 0.20);
    const p4 = surplus - p1 - p2 - p3;
    return [
      { product: getP('Balanced Growth'), amount: p1, percentage: 40, rationale: 'Core holding. Dynamic equity-debt asset allocation shields capital while capturing market upside.' },
      { product: getP('Emergency Buffer'), amount: p2, percentage: 25, rationale: 'Liquid fund buffer for easy cash access and planned goal top-ups.' },
      { product: getP('Capital Safety'), amount: p3, percentage: 20, rationale: 'Guaranteed 7.25% return anchor providing predictable monthly yield.' },
      { product: getP('Wealth Creation'), amount: p4, percentage: 15, rationale: 'Capped equity exposure for high long-term compounding with risk caution applied.' },
    ].filter(a => a.product && a.amount > 0);
  }

  // Aggressive
  const p1 = Math.round(surplus * 0.40);
  const p2 = Math.round(surplus * 0.25);
  const p3 = Math.round(surplus * 0.20);
  const p4 = surplus - p1 - p2 - p3;
  return [
    { product: getP('Wealth Creation'), amount: p1, percentage: 40, rationale: 'Flexi cap equity multi-sector fund for maximum long-term capital appreciation over 7+ years.' },
    { product: getP('Core Equity'), amount: p2, percentage: 25, rationale: 'Ultra low-cost Index fund tracking Nifty 50 blue-chip market leaders.' },
    { product: getP('Balanced Growth'), amount: p3, percentage: 20, rationale: 'Hybrid balancer to automatically rebalance portfolio during market volatility.' },
    { product: getP('Emergency Buffer'), amount: p4, percentage: 15, rationale: 'Liquidity bucket for opportunistic market buying or emergency access.' },
  ].filter(a => a.product && a.amount > 0);
}

router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { surplus } = req.body;
    
    // Get latest risk assessment and products concurrently
    const [assessment, products] = await Promise.all([
      prisma.riskAssessment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.productFact.findMany()
    ]);

    if (!assessment) {
      res.status(400).json({ error: 'Risk assessment not completed' });
      return;
    }

    const allocations = computeAllocation(surplus, assessment.profile, products);

    const portfolio = await prisma.portfolioRecommendation.create({
      data: {
        userId,
        items: {
          create: allocations.map(a => ({
            productId: a.product.id,
            amount: a.amount,
            percentage: a.percentage,
            rationale: a.rationale
          }))
        }
      },
      include: { items: { include: { product: true } } }
    });

    // Write to audit log
    await createAuditLog(
      userId,
      'Portfolio Recommendation Generated',
      'Advice',
      { profile: assessment.profile, surplus, itemsCount: allocations.length }
    );

    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

router.get('/current', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const portfolio = await prisma.portfolioRecommendation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    res.json(portfolio || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

router.post('/consent', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { portfolioId } = req.body;

    await prisma.portfolioRecommendation.update({
      where: { id: portfolioId },
      data: { status: 'Consented' }
    });

    await prisma.consentRecord.create({
      data: {
        userId,
        policyVersion: 'v1.0',
        recommendationId: portfolioId
      }
    });

    await createAuditLog(
      userId,
      'Recommendation Plan Consented',
      'Consent',
      { portfolioId }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to consent' });
  }
});

export default router;
