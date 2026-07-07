import { Goal } from '@prisma/client';
import { getCagrForProfile } from '../shared/planning-assumptions';

export class GoalsService {
  /**
   * Calculates gap analysis and required monthly contribution for a goal.
   * Assumes a risk-adjusted annual return on investments for the gap.
   */
  calculateGoalFeasibility(goal: Goal, riskProfile: string = 'Moderate') {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Calculate remaining months
    const yearsRemaining = Math.max(0, goal.targetYear - currentYear);
    const monthsRemaining = yearsRemaining * 12 + (11 - currentMonth);

    if (monthsRemaining <= 0) {
      return {
        ...goal,
        gap: Math.max(0, goal.target - goal.current),
        monthsRemaining: 0,
        requiredMonthlyContribution: Math.max(0, goal.target - goal.current),
        isFeasible: goal.current >= goal.target,
        assumedCagr: getCagrForProfile(riskProfile)
      };
    }

    const gap = Math.max(0, goal.target - goal.current);
    
    // Future value of current savings (using risk-adjusted return)
    const annualReturn = getCagrForProfile(riskProfile);
    const monthlyRate = annualReturn / 12;
    
    const fvCurrent = goal.current * Math.pow(1 + monthlyRate, monthsRemaining);
    
    // Target amount still needed after current savings grow
    const adjustedTarget = Math.max(0, goal.target - fvCurrent);

    // Required monthly contribution to reach adjustedTarget
    // PMT = (FV * r) / ((1 + r)^n - 1)
    let requiredMonthlyContribution = 0;
    if (adjustedTarget > 0) {
      requiredMonthlyContribution = (adjustedTarget * monthlyRate) / (Math.pow(1 + monthlyRate, monthsRemaining) - 1);
    }

    return {
      ...goal,
      gap,
      monthsRemaining,
      requiredMonthlyContribution: Math.round(requiredMonthlyContribution),
      // We'll let the frontend determine feasibility based on surplus, but we pass the raw value
      isFeasible: true,
      assumedCagr: annualReturn // Explicitly pass the assumption back
    };
  }
}

export const goalsService = new GoalsService();
