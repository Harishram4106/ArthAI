"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../../server");
const auth_routes_1 = require("../auth/auth.routes");
const transactions_service_1 = require("../transactions/transactions.service");
const audit_service_1 = require("../audit/audit.service");
const router = (0, express_1.Router)();
const transactionsService = new transactions_service_1.TransactionsService();
function generateDeterministicResponse(message, context) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('health') || lowerMsg.includes('score')) {
        const health = context.healthScore || 0;
        const breakdown = context.healthBreakdown;
        if (breakdown) {
            let insights = [];
            if (breakdown.savingsRate.score < 80)
                insights.push(`Your savings rate (${breakdown.savingsRate.value}) needs work.`);
            if (breakdown.emergencyFund.score < 70)
                insights.push(`Your emergency fund (${breakdown.emergencyFund.value}) should be topped up.`);
            if (breakdown.expenseStability.score < 80)
                insights.push(`Your discretionary expenses are a bit high (${breakdown.expenseStability.value}).`);
            if (breakdown.goalReadiness.score < 80)
                insights.push(`Some of your goals are at risk.`);
            const advice = insights.length > 0
                ? `Here is where you can improve: ${insights.join(' ')}`
                : 'You have excellent coverage across all metrics!';
            return {
                text: `Your current Financial Health Score is ${health}/100. ${advice} Would you like me to generate a personalized advisory plan to help optimize this?`,
                rationale: `Synthesized from TransactionsService health breakdown.`,
                suitabilityNote: `Based on actual transaction data.`,
                needs_human_advisor: false,
                is_product_recommendation: false
            };
        }
    }
    if (lowerMsg.includes('surplus') || lowerMsg.includes('invest')) {
        return {
            text: `Based on your cash flow analysis, your monthly investable surplus is ₹${(context.surplus || 0).toLocaleString('en-IN')}. Considering your ${context.profile} risk profile, I'd recommend a diversified mix of equity and debt funds. Should I generate a specific allocation plan?`,
            rationale: `Income vs Expenses calculated. Profile: ${context.profile}.`,
            suitabilityNote: `Checked against SEBI Risk Level ${context.profile}.`,
            needs_human_advisor: false,
            is_product_recommendation: true
        };
    }
    if (lowerMsg.includes('retirement') || lowerMsg.includes('retire') || lowerMsg.includes('goal')) {
        const activeGoals = context.goalsCount || 0;
        const cagr = context.assumedCagr || 12; // We can use a rough estimate if not passed
        return {
            text: `You have ${activeGoals} active goals mapped. To bridge your goal gaps, we assume a risk-adjusted growth rate (planning assumption). For your ${context.profile} profile, a diversified equity approach can help you reach these targets faster. I can run a what-if scenario simulator for you if you'd like.`,
            rationale: `Goal-based response explicitly framing CAGR as a planning assumption.`,
            suitabilityNote: `Suitable for long-term growth.`,
            needs_human_advisor: false,
            is_product_recommendation: true
        };
    }
    if (lowerMsg.includes('tax') || lowerMsg.includes('80c')) {
        return {
            text: `You can save up to ₹46,800 in income tax under Section 80C by investing in the IDBI Equity Advantage Fund (ELSS). Please note that it has a statutory lock-in period of 3 years.`,
            rationale: `User requested tax saving options. ELSS fits 80C.`,
            suitabilityNote: `ELSS is Equity (High Risk). Lock-in applies.`,
            disclosure: 'Mutual fund investments are subject to market risks. Read scheme documents carefully.',
            needs_human_advisor: false,
            is_product_recommendation: true
        };
    }
    if (lowerMsg.includes('human') || lowerMsg.includes('advisor') || lowerMsg.includes('talk')) {
        return {
            text: `I can certainly help you connect with a human advisor for personalized execution and deeper financial planning. Would you like me to book an appointment with your branch advisor?`,
            rationale: `User explicitly requested human escalation.`,
            needs_human_advisor: true,
            is_product_recommendation: false
        };
    }
    if (lowerMsg.includes('buy') || lowerMsg.includes('execute') || lowerMsg.includes('trade')) {
        return {
            text: `As an AI advisor, I can provide recommendations and build plans, but I cannot execute trades or guarantee returns. To proceed with execution, I must escalate this to a licensed human advisor.`,
            rationale: `Execution request detected. Hard block on AI execution.`,
            needs_human_advisor: true,
            is_product_recommendation: false
        };
    }
    // Fallback
    return {
        text: `I'm ArthAI, your financial copilot. I can help analyze your spending, recommend portfolios based on your risk profile, or plan for goals like retirement. What would you like to explore?`,
        rationale: `Fallback response for unrecognized query.`,
        needs_human_advisor: false,
        is_product_recommendation: false
    };
}
router.post('/message', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { text, threadId } = req.body;
        if (!text) {
            res.status(400).json({ error: 'Message text is required' });
            return;
        }
        // Get context
        const assessment = await server_1.prisma.riskAssessment.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        const snapshot = await transactionsService.getFinancialSnapshot(userId);
        const goalsCount = await server_1.prisma.goal.count({ where: { userId } });
        let context = {
            profile: assessment?.profile || 'Moderate',
            surplus: snapshot.investableSurplus,
            healthScore: snapshot.financialHealthScore,
            healthBreakdown: snapshot.healthBreakdown,
            goalsCount
        };
        // Find or create thread
        let activeThreadId = threadId;
        if (!activeThreadId) {
            const thread = await server_1.prisma.chatThread.create({
                data: { userId }
            });
            activeThreadId = thread.id;
        }
        // Save user message
        await server_1.prisma.chatMessage.create({
            data: {
                threadId: activeThreadId,
                sender: 'user',
                text
            }
        });
        // Generate AI response
        const aiResponse = generateDeterministicResponse(text, context);
        // Save AI message
        const botMsg = await server_1.prisma.chatMessage.create({
            data: {
                threadId: activeThreadId,
                sender: 'arthai',
                text: aiResponse.text,
                rationale: aiResponse.rationale,
                suitabilityNote: aiResponse.suitabilityNote,
                disclosure: aiResponse.disclosure
            }
        });
        // Audit compliance logging
        if (aiResponse.needs_human_advisor || aiResponse.is_product_recommendation) {
            await (0, audit_service_1.createAuditLog)(userId, aiResponse.needs_human_advisor ? 'Human Escalation Triggered' : 'AI Product Recommendation Provided', 'Advice', {
                threadId: activeThreadId,
                messageId: botMsg.id,
                rationale: aiResponse.rationale
            });
        }
        res.json({
            message: botMsg,
            needs_human_advisor: aiResponse.needs_human_advisor,
            threadId: activeThreadId
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});
router.get('/threads', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const threads = await server_1.prisma.chatThread.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(threads);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
});
exports.default = router;
