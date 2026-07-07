"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const express_1 = require("express");
const server_1 = require("../../server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-demo-mvp';
router.post('/demo-login', async (req, res) => {
    try {
        const { email } = req.body;
        const userEmail = email || 'aarav@demo.com';
        const user = await server_1.prisma.user.findUnique({
            where: { email: userEmail },
            include: { profile: true }
        });
        if (!user) {
            res.status(404).json({ error: 'Demo user not found. Please run DB seed.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Real Auth Middleware
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized - Missing Token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
};
exports.requireAuth = requireAuth;
exports.default = router;
