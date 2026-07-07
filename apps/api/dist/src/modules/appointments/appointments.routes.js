"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../../server");
const auth_routes_1 = require("../auth/auth.routes");
const router = (0, express_1.Router)();
router.get('/slots', auth_routes_1.requireAuth, (req, res) => {
    // Return dummy available slots
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const slots = [
        { id: 's1', date: tomorrow.toISOString().split('T')[0], time: '10:00 AM', advisor: 'Ravi Kumar' },
        { id: 's2', date: tomorrow.toISOString().split('T')[0], time: '02:00 PM', advisor: 'Sneha Patel' },
    ];
    res.json(slots);
});
router.post('/', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { type, date, time, advisorName, branch } = req.body;
        const appointment = await server_1.prisma.appointment.create({
            data: {
                userId,
                type,
                date: new Date(date),
                time,
                advisorName,
                branch,
                status: 'Confirmed'
            }
        });
        await server_1.prisma.auditLog.create({
            data: {
                userId,
                event: 'Human Advisor Appointment Booked',
                category: 'System',
                details: JSON.stringify({ appointmentId: appointment.id, type, advisorName }),
                hash: 'hash_' + Date.now()
            }
        });
        res.json(appointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});
router.get('/', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await server_1.prisma.appointment.findMany({
            where: { userId },
            orderBy: { date: 'asc' }
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});
router.get('/latest', auth_routes_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const appointment = await server_1.prisma.appointment.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        if (!appointment) {
            return res.status(404).json({ error: 'No appointment found' });
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest appointment' });
    }
});
exports.default = router;
