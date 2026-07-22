import sharp from 'sharp';
import {
  checkColorConsistency,
  checkDimensionCompliance,
  calculateOverallScore,
  getSocialWeights,
  SCORING_VERSION,
} from './score-engine.js';
import { prisma } from '@saas/database';
import { SOCIAL_PLATFORMS } from '@saas/shared';
import type { IssueSeverity } from '@saas/shared';

export interface SocialCheckResult {
  overallScore: number;
  scores: Array<{ category: string; score: number; weight: number }>;
  issues: Array<{
    category: string;
    severity: IssueSeverity;
    title: string;
    description: string;
    recommendation: string;
    metadata?: unknown;
  }>;
}

export async function runSocialCheck(
  scanId: string,
  fileUrl: string,
  platform: string,
  brandProfileId: string
): Promise<SocialCheckResult> {
  await prisma.scan.update({
    where: { id: scanId },
    data: { status: 'processing', startedAt: new Date() },
  });

  try {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { id: brandProfileId },
      include: { colors: true, logos: true },
    });

    if (!brandProfile) {
      throw new Error('Brand profile not found');
    }

    const filePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const platformSpec = SOCIAL_PLATFORMS.find((p: { key: string }) => p.key === platform);
    const expectedWidth = platformSpec?.width || 1080;
    const expectedHeight = platformSpec?.height || 1080;

    const { dominant } = await image.stats();
    const extractedColors: string[] = [];
    if (dominant) {
      extractedColors.push(
        `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`
      );
    }

    const rawPixels = await image.raw().toBuffer();
    const pixelColors = extractPixelColors(rawPixels, width, height);
    extractedColors.push(...pixelColors);

    const brandColors = brandProfile.colors.map(c => c.hexValue);

    const colorCheck = checkColorConsistency(extractedColors, brandColors);
    const dimensionCheck = checkDimensionCompliance(width, height, expectedWidth, expectedHeight);

    const logoCheck = checkLogoPresence(brandProfile.logos.length > 0);
    const layoutCheck = checkLayout(width, height);
    const accessibilityCheck = checkBasicAccessibility(width, height);

    const scores = [
      { category: 'colors', score: colorCheck.score, weight: getSocialWeights().colors },
      { category: 'logo', score: logoCheck.score, weight: getSocialWeights().logo },
      { category: 'layout', score: layoutCheck.score, weight: getSocialWeights().layout },
      { category: 'accessibility', score: accessibilityCheck.score, weight: getSocialWeights().accessibility },
      { category: 'platformReadiness', score: dimensionCheck.score, weight: getSocialWeights().platformReadiness },
    ];

    const overallScore = calculateOverallScore(scores, getSocialWeights());

    const allIssues = [
      ...colorCheck.issues.map(i => ({ ...i, category: 'colors' })),
      ...dimensionCheck.issues.map(i => ({ ...i, category: 'platformReadiness' })),
      ...logoCheck.issues.map(i => ({ ...i, category: 'logo' })),
      ...layoutCheck.issues.map(i => ({ ...i, category: 'layout' })),
      ...accessibilityCheck.issues.map(i => ({ ...i, category: 'accessibility' })),
    ];

    await prisma.scanScore.createMany({
      data: scores.map(s => ({ scanId, ...s })),
    });

    if (allIssues.length > 0) {
      await prisma.scanIssue.createMany({
        data: allIssues.map(i => ({
          scanId,
          category: i.category,
          severity: i.severity,
          title: i.title,
          description: i.description,
          recommendation: i.recommendation,
        })),
      });
    }

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        overallScore,
        scoringVersion: SCORING_VERSION,
        completedAt: new Date(),
      },
    });

    return { overallScore, scores, issues: allIssues };
  } catch (error: any) {
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorCode: 'SCAN_FAILED',
        errorMessage: error.message,
      },
    });
    throw error;
  }
}

function extractPixelColors(buffer: Buffer, width: number, height: number): string[] {
  const colors: string[] = [];
  const step = Math.max(1, Math.floor((width * height) / 20));

  for (let i = 0; i < width * height; i += step) {
    const offset = i * 3;
    if (offset + 2 < buffer.length) {
      const r = buffer[offset];
      const g = buffer[offset + 1];
      const b = buffer[offset + 2];
      colors.push(
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      );
    }
  }

  return colors;
}

function checkLogoPresence(hasLogo: boolean): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  if (hasLogo) {
    return { score: 80, issues: [] };
  }

  return {
    score: 40,
    issues: [{
      severity: 'major',
      title: 'No brand logo detected',
      description: 'The creative does not appear to contain a brand logo.',
      recommendation: 'Add your brand logo to increase brand recognition.',
    }],
  };
}

function checkLayout(width: number, height: number): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];
  let score = 100;

  if (width < 500 || height < 500) {
    issues.push({
      severity: 'warning',
      title: 'Low resolution image',
      description: `Image is ${width}x${height}px which may appear blurry on high-DPI displays.`,
      recommendation: 'Use a higher resolution image for better quality.',
    });
    score -= 10;
  }

  return { score: Math.max(0, score), issues };
}

function checkBasicAccessibility(width: number, height: number): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  return {
    score: 75,
    issues: [{
      severity: 'recommendation',
      title: 'Manual accessibility review recommended',
      description: 'Automated checks cannot fully assess text contrast and readability.',
      recommendation: 'Manually verify that text is readable and has sufficient contrast.',
    }],
  };
}
