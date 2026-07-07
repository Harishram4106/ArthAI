"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../../server");
const auth_routes_1 = require("../auth/auth.routes");
const transactions_service_1 = require("./transactions.service");
const router = (0, express_1.Router)();
const transactionsService = new transactions_service_1.TransactionsService();
router.get('/summary', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const summary = await transactionsService.getFinancialSnapshot(userId);
        res.json(summary);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});
router.post('/upload-csv', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { csvData } = req.body;
        if (!csvData) {
            res.status(400).json({ error: 'Missing csvData' });
            return;
        }
        const count = await transactionsService.ingestCsv(userId, csvData);
        await server_1.prisma.auditLog.create({
            data: {
                userId,
                event: 'Transactions Ingested',
                category: 'System',
                details: JSON.stringify({ recordCount: count }),
                hash: 'hash_' + Date.now()
            }
        });
        res.json({ message: `Successfully ingested ${count} transactions` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process CSV' });
    }
});
router.get('/', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const transactions = await server_1.prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});
exports.default = router;
