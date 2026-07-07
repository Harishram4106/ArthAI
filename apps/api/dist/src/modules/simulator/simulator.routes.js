"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("../auth/auth.routes");
const planning_assumptions_1 = require("../shared/planning-assumptions");
const router = (0, express_1.Router)();
router.post('/', auth_routes_1.requireAuth, (req, res) => {
    try {
        const { sipMonthly, sipYears, riskProfile = 'Moderate' } = req.body;
        // Risk-adjusted CAGR mapping from shared assumptions
        const cagr = (0, planning_assumptions_1.getCagrForProfile)(riskProfile);
        const rate = cagr / 12;
        const months = sipYears * 12;
        const investedTotal = sipMonthly * months;
        // Future Value of SIP
        let futureWealth = 0;
        if (rate > 0) {
            futureWealth = sipMonthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
        }
        else {
            futureWealth = investedTotal;
        }
        // Inflation adjusted (using shared assumption)
        const inflation = planning_assumptions_1.PLANNING_ASSUMPTIONS.inflation;
        const purchasingPower = futureWealth / Math.pow(1 + inflation, sipYears);
        res.json({
            investedTotal: Math.round(investedTotal),
            futureWealth: Math.round(futureWealth),
            purchasingPower: Math.round(purchasingPower),
            cagr: Math.round(cagr * 100),
            inflationAssumed: Math.round(inflation * 100)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to run simulator' });
    }
});
exports.default = router;
