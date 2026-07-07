"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../../server");
const auth_routes_1 = require("../auth/auth.routes");
const router = (0, express_1.Router)();
router.get('/', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const logs = await server_1.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        const parsedLogs = logs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));
        res.json(parsedLogs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});
router.get('/report', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const logs = await server_1.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        // In a real app, generate a PDF. For MVP, we return structured JSON.
        res.json({
            title: 'Compliance Audit Report',
            generatedAt: new Date(),
            recordCount: logs.length,
            records: logs.map(log => ({
                ...log,
                details: log.details ? JSON.parse(log.details) : null
            }))
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});
exports.default = router;
