import { PrismaClient, Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionsService {
  /**
   * Derives financial snapshot metrics from transactions
   */
  async getFinancialSnapshot(userId: string) {
    // Check if user has dashboard overrides in settings
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    if (profile && profile.settings) {
      try {
        const settings = JSON.parse(profile.settings);
        if (settings.dashboardOverrides) {
          const overrides = settings.dashboardOverrides;
          const avgMonthlyIncome = Number(overrides.avgMonthlyIncome) || 0;
          const avgMonthlyExpense = Number(overrides.avgMonthlyExpense) || 0;
          const monthlySavings = avgMonthlyIncome - avgMonthlyExpense;
          const investableSurplus = overrides.investableSurplus !== undefined 
            ? Number(overrides.investableSurplus) 
            : Math.max(0, monthlySavings);
          const totalInvested = Number(overrides.totalInvested) || 0;
          const financialHealthScore = Number(overrides.financialHealthScore) || 75;
          const emergencyCoverageMonths = Number(overrides.emergencyCoverageMonths) || 6;
          
          const breakdownScore = financialHealthScore;
          const healthBreakdown = {
            savingsRate: {
              score: breakdownScore,
              value: avgMonthlyIncome > 0 ? `${Math.round((monthlySavings / avgMonthlyIncome) * 100)}%` : '0%',
              status: breakdownScore >= 80 ? 'Excellent' : breakdownScore >= 50 ? 'Good' : 'Needs Work',
              explanation: 'Percentage of income saved monthly.',
              action: 'Adjusted via dashboard controls.'
            },
            emergencyFund: {
              score: breakdownScore,
              value: `${emergencyCoverageMonths.toFixed(1)}x`,
              status: breakdownScore >= 80 ? 'Excellent' : 'Needs Work',
              explanation: 'Months of expenses covered by liquid assets.',
              action: 'Adjusted via dashboard controls.'
            },
            expenseStability: {
              score: breakdownScore,
              value: '30%',
              status: breakdownScore >= 80 ? 'Excellent' : 'Needs Work',
              explanation: 'Proportion of expenses that are discretionary.',
              action: 'Adjusted via dashboard controls.'
            },
            goalReadiness: {
              score: breakdownScore,
              value: 'Active',
              status: breakdownScore >= 80 ? 'Excellent' : 'Needs Work',
              explanation: 'Progress across all your financial goals.',
              action: 'Adjusted via dashboard controls.'
            }
          };

          return {
            avgMonthlyIncome,
            avgMonthlyExpense,
            monthlySavings,
            recommendedBufferTopUp: Math.round(monthlySavings * 0.3),
            investableSurplus,
            spendingByCategory: overrides.spendingByCategory || {
              Rent: Math.round(avgMonthlyExpense * 0.35),
              Groceries: Math.round(avgMonthlyExpense * 0.25),
              Dining: Math.round(avgMonthlyExpense * 0.15),
              Bills: Math.round(avgMonthlyExpense * 0.15),
              Misc: Math.round(avgMonthlyExpense * 0.10)
            },
            financialHealthScore,
            healthBreakdown,
            emergencyCoverageMonths,
            totalInvested,
            monthChange: Math.round(monthlySavings * 0.4),
            monthChangePct: totalInvested > 0 ? Number(((Math.round(monthlySavings * 0.4) / totalInvested) * 100).toFixed(2)) : 0
          };
        }
      } catch (e) {
        console.error('Failed to parse dashboard overrides', e);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const spendingByCategory: Record<string, number> = {};
    let monthsSet = new Set<string>();

    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      monthsSet.add(monthKey);

      if (t.type === 'credit') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
      }
    });

    const monthsCount = monthsSet.size || 1;
    const avgMonthlyIncome = totalIncome / monthsCount;
    const avgMonthlyExpense = totalExpense / monthsCount;
    const monthlySavings = avgMonthlyIncome - avgMonthlyExpense;
    
    // Simple heuristic for Investable Surplus
    // 30% of savings goes to emergency buffer till target met (assume 500k target)
    // For demo, we just use a flat ratio
    const recommendedBufferTopUp = Math.round(monthlySavings * 0.3);
    const investableSurplus = monthlySavings > 0 ? monthlySavings - recommendedBufferTopUp : 0;

    // Fetch Goals to calculate Goal Readiness
    const goals = await prisma.goal.findMany({
      where: { userId }
    });

    // 1. Savings Rate Score
    let savingsRateScore = 0;
    const savingsRate = avgMonthlyIncome > 0 ? monthlySavings / avgMonthlyIncome : 0;
    if (savingsRate >= 0.3) savingsRateScore = 100;
    else if (savingsRate >= 0.2) savingsRateScore = 80;
    else if (savingsRate >= 0.1) savingsRateScore = 50;
    else if (savingsRate > 0) savingsRateScore = 20;

    // 2. Emergency Fund Score
    // PLANNING ASSUMPTION: In a real system, liquid balances are fetched via Account Aggregator.
    // Here we derive a planning proxy: a base balance plus actual transaction net cash flow.
    const assumedBaseBalance = 200000;
    const netCashFlow = totalIncome - totalExpense;
    const estimatedLiquidAssets = assumedBaseBalance + Math.max(0, netCashFlow);
    const emergencyCoverageMonths = avgMonthlyExpense > 0 ? estimatedLiquidAssets / avgMonthlyExpense : 0;
    let emergencyFundScore = 0;
    if (emergencyCoverageMonths >= 6) emergencyFundScore = 100;
    else if (emergencyCoverageMonths >= 3) emergencyFundScore = 70;
    else if (emergencyCoverageMonths >= 1) emergencyFundScore = 40;

    // 3. Expense Stability Score
    // Calculate discretionary vs fixed.
    const discretionarySpend = Object.keys(spendingByCategory)
      .filter(cat => ['Dining', 'Shopping', 'Subscriptions', 'Misc'].includes(cat))
      .reduce((sum, cat) => sum + spendingByCategory[cat], 0);
    const discretionaryRatio = totalExpense > 0 ? discretionarySpend / totalExpense : 0;
    let expenseStabilityScore = 100;
    if (discretionaryRatio > 0.4) expenseStabilityScore = 40;
    else if (discretionaryRatio > 0.3) expenseStabilityScore = 60;
    else if (discretionaryRatio > 0.2) expenseStabilityScore = 80;

    // 4. Goal Readiness Score
    let goalReadinessScore = 100;
    if (goals.length > 0) {
      const onTrack = goals.filter(g => g.status === 'On track').length;
      goalReadinessScore = Math.round((onTrack / goals.length) * 100);
    } else {
      goalReadinessScore = 70; // default if no goals
    }

    const healthScore = Math.round(
      (savingsRateScore * 0.35) + 
      (emergencyFundScore * 0.25) + 
      (expenseStabilityScore * 0.20) + 
      (goalReadinessScore * 0.20)
    );

    const healthBreakdown = {
      savingsRate: {
        score: savingsRateScore,
        value: `${Math.round(savingsRate * 100)}%`,
        status: savingsRateScore >= 80 ? 'Excellent' : savingsRateScore >= 50 ? 'Good' : 'Needs Work',
        explanation: 'Percentage of income saved monthly.',
        action: savingsRateScore < 80 ? 'Try to reduce discretionary expenses to boost savings.' : 'Keep up the great savings habit!'
      },
      emergencyFund: {
        score: emergencyFundScore,
        value: `${emergencyCoverageMonths.toFixed(1)}x`,
        status: emergencyFundScore >= 70 ? 'Excellent' : 'Needs Work',
        explanation: 'Months of expenses covered by liquid assets.',
        action: emergencyFundScore < 70 ? 'Redirect some surplus to a liquid emergency fund.' : 'Your emergency buffer is solid.'
      },
      expenseStability: {
        score: expenseStabilityScore,
        value: `${Math.round(discretionaryRatio * 100)}%`,
        status: expenseStabilityScore >= 80 ? 'Excellent' : expenseStabilityScore >= 60 ? 'Good' : 'Needs Work',
        explanation: 'Proportion of expenses that are discretionary.',
        action: expenseStabilityScore < 80 ? 'Audit dining and shopping expenses this month.' : 'Your expenses are well controlled.'
      },
      goalReadiness: {
        score: goalReadinessScore,
        value: `${goals.length} Goals`,
        status: goalReadinessScore >= 80 ? 'Excellent' : goalReadinessScore >= 50 ? 'Good' : 'Needs Work',
        explanation: 'Progress across all your financial goals.',
        action: goalReadinessScore < 80 ? 'Increase monthly SIPs to get goals on track.' : 'You are on track for your targets!'
      }
    };

    // PLANNING ASSUMPTION: In a real system, these would come from an Investment/Portfolio table.
    // For this MVP, we synthesize a derived portfolio balance from liquid assets.
    const monthChange = Math.round(monthlySavings * 0.4); // assume 40% of savings went into investments this month
    const totalInvested = estimatedLiquidAssets * 1.5 + monthChange;
    const monthChangePct = totalInvested > 0 ? Number(((monthChange / (totalInvested - monthChange)) * 100).toFixed(2)) : 0;

    return {
      avgMonthlyIncome,
      avgMonthlyExpense,
      monthlySavings,
      recommendedBufferTopUp,
      investableSurplus,
      spendingByCategory,
      financialHealthScore: healthScore,
      healthBreakdown,
      emergencyCoverageMonths, // using the calculated value
      totalInvested,
      monthChange,
      monthChangePct
    };
  }

  /**
   * Parse IDBI Bank CSV and ingest
   * Format: S.No., Value Date, Transaction Date, Cheque Number, Transaction Remarks, Withdrawal Amount (INR ), Deposit Amount (INR ), Balance (INR )
   */
  async ingestCsv(userId: string, csvData: string) {
    const lines = csvData.split('\n');
    const transactionsToInsert = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',');
      if (cols.length < 7) continue;

      const dateStr = cols[2].trim(); // Transaction Date
      const remarks = cols[4].trim(); // Transaction Remarks
      const withdrawal = parseFloat(cols[5].trim()) || 0;
      const deposit = parseFloat(cols[6].trim()) || 0;

      if (withdrawal === 0 && deposit === 0) continue;

      let amount = 0;
      let type = 'debit';
      
      if (deposit > 0) {
        amount = deposit;
        type = 'credit';
      } else {
        amount = withdrawal;
        type = 'debit';
      }

      // Very simple category mapping heuristic
      let category = 'Other';
      const rLower = remarks.toLowerCase();
      if (rLower.includes('salary') || rLower.includes('techcorp')) category = 'Income';
      else if (rLower.includes('zomato') || rLower.includes('swiggy')) category = 'Dining';
      else if (rLower.includes('bigbasket') || rLower.includes('dmart')) category = 'Groceries';
      else if (rLower.includes('rent')) category = 'Rent';
      else if (rLower.includes('electricity') || rLower.includes('bill')) category = 'Bills';

      let parsedDate = new Date();
      // Try to parse DD/MM/YYYY or DD-MM-YYYY (IDBI format)
      if (dateStr.includes('/') || dateStr.includes('-')) {
        const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
        if (parts.length === 3) {
          // Check if DD is first (if > 12 it's definitely DD, but usually IDBI is DD/MM/YYYY)
          // We'll assume DD/MM/YYYY format based on Indian bank standards
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          // Only apply if it's a valid day
          if (day > 0 && day <= 31 && month >= 0 && month <= 11) {
            parsedDate = new Date(year, month, day);
          } else {
            parsedDate = new Date(dateStr);
          }
        } else {
          parsedDate = new Date(dateStr);
        }
      } else {
        parsedDate = new Date(dateStr);
      }

      transactionsToInsert.push({
        userId,
        date: parsedDate,
        description: remarks,
        category,
        amount,
        type,
        isDiscretionary: category === 'Dining'
      });
    }

    await prisma.transaction.createMany({
      data: transactionsToInsert
    });

    return transactionsToInsert.length;
  }
}
