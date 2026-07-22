import { Router } from 'express';
import { prisma } from '@saas/database';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';

const router = Router();

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    include: { profile: true },
  });
  res.json({ success: true, data: user });
});

router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.profile.upsert({
    where: { authUserId: req.userId! },
    update: {
      displayName: req.body.displayName,
      avatar: req.body.avatar,
    },
    create: {
      authUserId: req.userId!,
      displayName: req.body.displayName,
      avatar: req.body.avatar,
    },
  });
  res.json({ success: true, data: profile });
});

router.get('/me/memberships', requireAuth, async (req: AuthenticatedRequest, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: req.userId! },
    include: { workspace: true },
  });
  res.json({ success: true, data: memberships });
});

router.delete('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  await prisma.user.delete({ where: { id: req.userId! } });
  res.json({ success: true, message: 'Account deleted' });
});

export { router as userRoutes };
