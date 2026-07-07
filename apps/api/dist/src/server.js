"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Global Prisma instance
exports.prisma = new client_1.PrismaClient({ log: ['error'] });
// ── Security Headers (helmet) ──
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow assets
    contentSecurityPolicy: false, // CSP managed by frontend
}));
// ── CORS — restrict to known origins ──
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map(o => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman in dev)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));
// ── Body Size Limit — prevent DoS via huge payloads ──
app.use(express_1.default.json({ limit: '1mb' }));
// ── Global Rate Limiter — 100 req/min per IP ──
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api', globalLimiter);
// ── Strict Rate Limiter — auth endpoints ──
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
});
// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ArthAI API is running' });
});
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const risk_routes_1 = __importDefault(require("./modules/risk/risk.routes"));
const goals_routes_1 = __importDefault(require("./modules/goals/goals.routes"));
const recommendations_routes_1 = __importDefault(require("./modules/recommendations/recommendations.routes"));
const audit_routes_1 = __importDefault(require("./modules/audit/audit.routes"));
const advisory_routes_1 = __importDefault(require("./modules/advisory/advisory.routes"));
const appointments_routes_1 = __importDefault(require("./modules/appointments/appointments.routes"));
const simulator_routes_1 = __importDefault(require("./modules/simulator/simulator.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const profile_routes_1 = __importDefault(require("./modules/profile/profile.routes"));
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/transactions', transactions_routes_1.default);
app.use('/api/risk', risk_routes_1.default);
app.use('/api/goals', goals_routes_1.default);
app.use('/api/recommendations', recommendations_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
app.use('/api/advisory', advisory_routes_1.default);
app.use('/api/appointments', appointments_routes_1.default);
app.use('/api/simulator', simulator_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
// ── Global Error Handler ──
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    if (err.message?.startsWith('CORS:')) {
        res.status(403).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: 'Internal server error' });
});
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`ArthAI Backend running at http://localhost:${port}`);
    });
}
exports.default = app;
