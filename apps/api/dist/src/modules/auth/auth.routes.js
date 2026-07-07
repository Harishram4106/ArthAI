"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const express_1 = require("express");
const server_1 = require("../../server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supabase_js_1 = require("@supabase/supabase-js");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-demo-mvp';
// Supabase Admin client for verifying Google OAuth tokens
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
    : null;
// ── Register ──
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required.' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters.' });
            return;
        }
        // Check if user already exists
        const existing = await server_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'An account with this email already exists.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await server_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                profile: {
                    create: {
                        name: name || email.split('@')[0],
                        age: 30,
                        city: '',
                        occupation: '',
                        language: 'en',
                    }
                }
            },
            include: { profile: true }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, type: 'password' }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.profile?.name || email.split('@')[0],
                profile: user.profile
            }
        });
    }
    catch (error) {
        console.error('[register]', error);
        res.status(500).json({ error: 'Failed to create account.' });
    }
});
// ── Login ──
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required.' });
            return;
        }
        const user = await server_1.prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        // 30-day token — enables "remember me" without asking again
        const token = jsonwebtoken_1.default.sign({ userId: user.id, type: 'password' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.profile?.name || email.split('@')[0],
                profile: user.profile
            }
        });
    }
    catch (error) {
        console.error('[login]', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// ── Demo Login (kept for quick testing) ──
router.post('/demo-login', async (req, res) => {
    try {
        const user = await server_1.prisma.user.findUnique({
            where: { email: 'aarav@demo.com' },
            include: { profile: true }
        });
        if (!user) {
            res.status(404).json({ error: 'Demo user not found. Please run DB seed.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, type: 'demo' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.profile?.name || 'Demo User',
                profile: user.profile
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// ── Auth Middleware ──
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized - Missing Token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    // 1. Try Supabase token verification first
    if (supabaseAdmin) {
        try {
            const { data, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && data.user) {
                req.userId = data.user.id;
                req.authType = 'supabase';
                next();
                return;
            }
        }
        catch (_) { /* fall through */ }
    }
    // 2. Fall back to local JWT verification
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.authType = 'local';
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
};
exports.requireAuth = requireAuth;
exports.default = router;
