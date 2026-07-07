import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth.routes';
import { ProfileService } from './profile.service';
import { prisma } from '../../server';

const router = Router();
const profileService = new ProfileService();

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Fetch profile from Supabase
    let profile = await profileService.getProfile(userId);
    
    // Supplement with email and name from local SQLite if Supabase record is brand new / empty
    const localUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    
    if (localUser) {
      if (!profile.email) profile.email = localUser.email;
      if (!profile.full_name && localUser.profile) {
        profile.full_name = localUser.profile.name;
      }
    }

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
