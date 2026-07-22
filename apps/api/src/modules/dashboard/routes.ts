import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';
import { prisma } from '@saas/database';
import { getUsageLimit, getRemainingUsage } from '../entitlements/service.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const profile = await prisma.brandProfile.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });

    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: {
        workspace: {
          include: { subscription: true },
        },
      },
    });

    const subscription = membership?.workspace?.subscription?.[0];
    const planKey = subscription?.planKey || 'free';

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const usage = await prisma.usageRecord.groupBy({
      by: ['usageType'],
      where: {
        userId,
        billingPeriodStart: { lte: periodEnd },
        billingPeriodEnd: { gte: periodStart },
      },
      _sum: { quantity: true },
    });

    const socialChecksUsed = usage.find(u => u.usageType === 'social_check')?._sum.quantity || 0;
    const websiteScansUsed = usage.find(u => u.usageType === 'website_scan')?._sum.quantity || 0;

    const socialChecksLimit = await getUsageLimit(membership?.workspaceId || '', 'socialChecks');
    const websiteScansLimit = await getUsageLimit(membership?.workspaceId || '', 'websiteScans');

    const recentScans = await prisma.scan.findMany({
      where: { userId },
      include: {
        brandProfile: { select: { name: true } },
        scores: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const totalScans = await prisma.scan.count({
      where: { userId, status: 'completed' },
    });

    const avgScore = await prisma.scan.aggregate({
      where: { userId, status: 'completed', overallScore: { not: null } },
      _avg: { overallScore: true },
    });

    const issuesByCategory = await prisma.scanIssue.groupBy({
      by: ['category'],
      where: {
        scan: { userId, status: 'completed' },
        severity: { in: ['critical', 'major'] },
      },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 3,
    });

    res.json({
      success: true,
      data: {
        brandProfile: profile,
        plan: planKey,
        subscription: subscription ? {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        } : null,
        usage: {
          socialChecks: {
            used: socialChecksUsed,
            limit: socialChecksLimit,
          },
          websiteScans: {
            used: websiteScansUsed,
            limit: websiteScansLimit,
          },
        },
        recentScans,
        stats: {
          totalScans,
          averageScore: avgScore._avg.overallScore || 0,
          topIssues: issuesByCategory.map(i => ({
            category: i.category,
            count: i._count,
          })),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as dashboardRoutes };
