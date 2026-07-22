import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';
import * as scanService from './service.js';
import { getRemainingUsage } from '../entitlements/service.js';
import { prisma } from '@saas/database';

const router = Router();

router.post('/social', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { brandProfileId, fileUrl, platform } = req.body;

    if (!brandProfileId || !fileUrl || !platform) {
      return res.status(400).json({ success: false, error: 'brandProfileId, fileUrl, and platform are required' });
    }

    const profile = await prisma.brandProfile.findFirst({
      where: { id: brandProfileId, userId: req.userId! },
    });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Brand profile not found' });
    }

    const remaining = await getRemainingUsage(req.userId!, 'socialChecks');
    if (remaining !== null && remaining <= 0) {
      return res.status(403).json({ success: false, error: 'Monthly social check limit reached. Please upgrade your plan.' });
    }

    const scan = await scanService.createSocialScan(req.userId!, brandProfileId, fileUrl, platform);

    const result = await scanService.executeSocialScan(scan.id);

    if (remaining !== null) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      await prisma.usageRecord.create({
        data: {
          userId: req.userId!,
          scanId: scan.id,
          usageType: 'social_check',
          quantity: 1,
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          idempotencyKey: `social_${scan.id}`,
        },
      });
    }

    const scanData = await scanService.getScan(scan.id, req.userId!);

    res.json({ success: true, data: scanData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/website', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { brandProfileId, url } = req.body;

    if (!brandProfileId || !url) {
      return res.status(400).json({ success: false, error: 'brandProfileId and url are required' });
    }

    const profile = await prisma.brandProfile.findFirst({
      where: { id: brandProfileId, userId: req.userId! },
    });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Brand profile not found' });
    }

    const remaining = await getRemainingUsage(req.userId!, 'websiteScans');
    if (remaining !== null && remaining <= 0) {
      return res.status(403).json({ success: false, error: 'Monthly website scan limit reached. Please upgrade your plan.' });
    }

    const maxPages = await getRemainingUsage(req.userId!, 'maxPagesPerScan') ?? 1;
    const scan = await scanService.createWebsiteScan(req.userId!, brandProfileId, url);

    const result = await scanService.executeWebsiteScan(scan.id, maxPages);

    if (remaining !== null) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      await prisma.usageRecord.create({
        data: {
          userId: req.userId!,
          scanId: scan.id,
          usageType: 'website_scan',
          quantity: 1,
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          idempotencyKey: `website_${scan.id}`,
        },
      });
    }

    const scanData = await scanService.getScan(scan.id, req.userId!);

    res.json({ success: true, data: scanData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const scanType = req.query.scanType as any;

    const result = await scanService.listScans(req.userId!, { page, limit, scanType });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:scanId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const scan = await scanService.getScan(req.params.scanId as string, req.userId!);
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    res.json({ success: true, data: scan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:scanId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await scanService.deleteScan(req.params.scanId as string, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as scanRoutes };
