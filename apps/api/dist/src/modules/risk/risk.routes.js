"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskQuestions = void 0;
exports.computeRiskScore = computeRiskScore;
exports.scoreToProfile = scoreToProfile;
const express_1 = require("express");
const server_1 = require("../../server");
const auth_routes_1 = require("../auth/auth.routes");
const audit_service_1 = require("../audit/audit.service");
const router = (0, express_1.Router)();
exports.riskQuestions = [
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
function computeRiskScore(answers) {
    let total = 0;
    for (const q of exports.riskQuestions) {
        const ans = answers[q.id];
        const opt = q.options.find(o => o.value === ans);
        if (opt)
            total += opt.points;
    }
    return total;
}
function scoreToProfile(score) {
    if (score <= 10)
        return 'Conservative';
    if (score <= 18)
        return 'Moderate';
    return 'Aggressive';
}
router.get('/questions', (req, res) => {
    res.json(exports.riskQuestions);
});
router.post('/submit', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { answers } = req.body;
        if (!answers) {
            res.status(400).json({ error: 'Answers are required' });
            return;
        }
        const score = computeRiskScore(answers);
        const profile = scoreToProfile(score);
        const assessment = await server_1.prisma.riskAssessment.create({
            data: {
                userId,
                score,
                profile,
                answers: JSON.stringify(answers)
            }
        });
        // Write to audit log
        await (0, audit_service_1.createAuditLog)(userId, 'Risk Profile Assessed', 'Risk', { score, profile });
        res.json(assessment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit risk assessment' });
    }
});
router.get('/latest', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const assessment = await server_1.prisma.riskAssessment.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(assessment || null);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch risk assessment' });
    }
});
exports.default = router;
