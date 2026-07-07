"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../../server");
const auth_routes_1 = require("../auth/auth.routes");
const goals_service_1 = require("./goals.service");
const router = (0, express_1.Router)();
router.get('/', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const goals = await server_1.prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        // Fetch user risk profile to determine CAGR assumption
        const assessment = await server_1.prisma.riskAssessment.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        const riskProfile = assessment?.profile || 'Moderate';
        const enrichedGoals = goals.map(g => goals_service_1.goalsService.calculateGoalFeasibility(g, riskProfile));
        res.json(enrichedGoals);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});
router.post('/', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, target, current, targetYear, category, status } = req.body;
        const goal = await server_1.prisma.goal.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});
router.patch('/:id', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
        const updateData = req.body;
        // verify ownership
        const existing = await server_1.prisma.goal.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const goal = await server_1.prisma.goal.update({
            where: { id },
            data: updateData
        });
        res.json(goal);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update goal' });
    }
});
router.delete('/:id', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
        const existing = await server_1.prisma.goal.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        await server_1.prisma.goal.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});
exports.default = router;
