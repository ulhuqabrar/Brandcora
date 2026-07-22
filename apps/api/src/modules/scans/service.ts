import { prisma } from '@saas/database';
import { runSocialCheck } from './social-checker.js';
import { runWebsiteCheck } from './website-checker.js';
import type { ScanType, SocialPlatform } from '@saas/shared';

export async function createSocialScan(
  userId: string,
  brandProfileId: string,
  fileUrl: string,
  platform: SocialPlatform
) {
  const scan = await prisma.scan.create({
    data: {
      userId,
      brandProfileId,
      scanType: 'social',
      status: 'pending',
      sourceFileUrl: fileUrl,
      platform,
    },
  });

  return scan;
}

export async function executeSocialScan(scanId: string) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { brandProfile: true },
  });

  if (!scan) throw new Error('Scan not found');
  if (!scan.sourceFileUrl) throw new Error('No source file');
  if (!scan.platform) throw new Error('No platform specified');

  return runSocialCheck(scanId, scan.sourceFileUrl, scan.platform, scan.brandProfileId);
}

export async function createWebsiteScan(
  userId: string,
  brandProfileId: string,
  url: string
) {
  const scan = await prisma.scan.create({
    data: {
      userId,
      brandProfileId,
      scanType: 'website',
      status: 'pending',
      sourceUrl: url,
    },
  });

  return scan;
}

export async function executeWebsiteScan(scanId: string, maxPages: number = 1) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { brandProfile: true },
  });

  if (!scan) throw new Error('Scan not found');
  if (!scan.sourceUrl) throw new Error('No source URL');

  return runWebsiteCheck(scanId, scan.sourceUrl, scan.brandProfileId, maxPages);
}

export async function getScan(scanId: string, userId: string) {
  return prisma.scan.findFirst({
    where: { id: scanId, userId },
    include: {
      scores: true,
      issues: true,
      pages: true,
      brandProfile: true,
    },
  });
}

export async function listScans(
  userId: string,
  options: { page?: number; limit?: number; scanType?: ScanType } = {}
) {
  const { page = 1, limit = 20, scanType } = options;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (scanType) where.scanType = scanType;

  const [scans, total] = await Promise.all([
    prisma.scan.findMany({
      where,
      include: {
        scores: true,
        brandProfile: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.scan.count({ where }),
  ]);

  return {
    scans,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function deleteScan(scanId: string, userId: string) {
  const scan = await prisma.scan.findFirst({
    where: { id: scanId, userId },
  });

  if (!scan) throw new Error('Scan not found');

  await prisma.scan.delete({ where: { id: scanId } });
}
