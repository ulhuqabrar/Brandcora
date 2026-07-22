import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';
import { getUsageLimit, getRemainingUsage } from '../entitlements/service.js';
import { prisma } from '@saas/database';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { workspace: true },
    });

    const workspaceId = membership?.workspaceId || '';

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [socialChecksLimit, websiteScansLimit, socialChecksRemaining, websiteScansRemaining] =
      await Promise.all([
        getUsageLimit(workspaceId, 'socialChecks'),
        getUsageLimit(workspaceId, 'websiteScans'),
        getRemainingUsage(workspaceId, 'socialChecks'),
        getRemainingUsage(workspaceId, 'websiteScans'),
      ]);

    const usage = await prisma.usageRecord.groupBy({
      by: ['usageType'],
      where: {
        userId,
        billingPeriodStart: { lte: periodEnd },
        billingPeriodEnd: { gte: periodStart },
      },
      _sum: { quantity: true },
    });

    res.json({
      success: true,
      data: {
        period: { start: periodStart, end: periodEnd },
        socialChecks: {
          used: usage.find(u => u.usageType === 'social_check')?._sum.quantity || 0,
          limit: socialChecksLimit,
          remaining: socialChecksRemaining,
        },
        websiteScans: {
          used: usage.find(u => u.usageType === 'website_scan')?._sum.quantity || 0,
          limit: websiteScansLimit,
          remaining: websiteScansRemaining,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as usageRoutes };
