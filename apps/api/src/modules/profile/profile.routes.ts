import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth.routes';
import { ProfileService } from './profile.service';
import { prisma } from '../../server';

const router = Router();
const profileService = new ProfileService();

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Fetch profile from Supabase (already includes user data)
    let profile = await profileService.getProfile(userId);

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const updates = req.body;
    
    // Ensure app_user_id cannot be overwritten
    delete updates.app_user_id;

    const profile = await profileService.updateProfile(userId, updates);
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/settings', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const settings = await profileService.getSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.patch('/settings', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const updates = req.body;
    
    // Ensure app_user_id cannot be overwritten
    delete updates.app_user_id;

    const settings = await profileService.updateSettings(userId, updates);
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
