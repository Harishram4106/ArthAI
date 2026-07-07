import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth.routes';
import { getCagrForProfile, PLANNING_ASSUMPTIONS } from '../shared/planning-assumptions';

const router = Router();

router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const { sipMonthly, sipYears, riskProfile = 'Moderate' } = req.body;
    
    // Risk-adjusted CAGR mapping from shared assumptions
    const cagr = getCagrForProfile(riskProfile);

    const rate = cagr / 12;
    const months = sipYears * 12;
    const investedTotal = sipMonthly * months;
    
    // Future Value of SIP
    let futureWealth = 0;
    if (rate > 0) {
        futureWealth = sipMonthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    } else {
        futureWealth = investedTotal;
    }

    // Inflation adjusted (using shared assumption)
    const inflation = PLANNING_ASSUMPTIONS.inflation;
    const purchasingPower = futureWealth / Math.pow(1 + inflation, sipYears);

    res.json({
      investedTotal: Math.round(investedTotal),
      futureWealth: Math.round(futureWealth),
      purchasingPower: Math.round(purchasingPower),
      cagr: Math.round(cagr * 100),
      inflationAssumed: Math.round(inflation * 100)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run simulator' });
  }
});

export default router;
