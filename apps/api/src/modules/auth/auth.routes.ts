import { Router, Request, Response } from 'express';
import { prisma } from '../../server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-demo-mvp';

// Supabase Admin client for verifying Google OAuth tokens
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// ── Register ──
router.post('/register', async (req: Request, res: Response) => {
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
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
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

    const token = jwt.sign({ userId: user.id, type: 'password' }, JWT_SECRET, { expiresIn: '30d' });

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
  } catch (error: any) {
    console.error('[register]', error);
    res.status(500).json({ error: 'Failed to create account. Details: ' + (error.message || String(error)) });
  }
});

// ── Login ──
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // 30-day token — enables "remember me" without asking again
    const token = jwt.sign({ userId: user.id, type: 'password' }, JWT_SECRET, { expiresIn: '30d' });

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
  } catch (error: any) {
    console.error('[login]', error);
    res.status(500).json({ error: 'Failed to login. Details: ' + (error.message || String(error)) });
  }
});

// ── Demo Login (kept for quick testing) ──
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'aarav@demo.com' },
      include: { profile: true }
    });

    if (!user) {
      res.status(404).json({ error: 'Demo user not found. Please run DB seed.' });
      return;
    }

    const token = jwt.sign({ userId: user.id, type: 'demo' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name || 'Demo User',
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── Auth Middleware ──
export const requireAuth = async (req: Request, res: Response, next: Function) => {
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
        (req as any).userId = data.user.id;
        (req as any).authType = 'supabase';
        next();
        return;
      }
    } catch (_) { /* fall through */ }
  }

  // 2. Fall back to local JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = decoded.userId;
    (req as any).authType = 'local';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized - Invalid Token' });
  }
};

export default router;
