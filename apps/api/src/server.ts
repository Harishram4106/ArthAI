import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Global Prisma instance
export const prisma = new PrismaClient({ log: ['error'] });

// ── Security Headers (helmet) ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow assets
  contentSecurityPolicy: false, // CSP managed by frontend
}));

// ── CORS — restrict to known origins ──
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body Size Limit — prevent DoS via huge payloads ──
app.use(express.json({ limit: '1mb' }));

// ── Global Rate Limiter — 100 req/min per IP ──
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api', globalLimiter);

// ── Strict Rate Limiter — auth endpoints ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ArthAI API is running' });
});

import authRoutes from './modules/auth/auth.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import riskRoutes from './modules/risk/risk.routes';
import goalsRoutes from './modules/goals/goals.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';
import auditRoutes from './modules/audit/audit.routes';
import advisoryRoutes from './modules/advisory/advisory.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import simulatorRoutes from './modules/simulator/simulator.routes';
import reportsRoutes from './modules/reports/reports.routes';
import profileRoutes from './modules/profile/profile.routes';

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/profile', profileRoutes);

// ── Global Error Handler ──
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err.message);
  if (err.message?.startsWith('CORS:')) {
    res.status(403).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`ArthAI Backend running at http://localhost:${port}`);
});
