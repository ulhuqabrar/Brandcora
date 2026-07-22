import { prisma } from '@saas/database';

export async function canAccessFeature(
  workspaceId: string,
  featureKey: string
): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      workspaceId,
      status: 'active',
    },
  });

  if (!subscription) {
    return getDefaultFeatureAccess(featureKey);
  }

  return getPlanFeatureAccess(subscription.planKey, featureKey);
}

export async function getUsageLimit(
  workspaceId: string,
  usageKey: string
): Promise<number | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      workspaceId,
      status: 'active',
    },
  });

  if (!subscription) {
    return getDefaultUsageLimit(usageKey);
  }

  return getPlanUsageLimit(subscription.planKey, usageKey);
}

export async function getRemainingUsage(
  workspaceId: string,
  usageKey: string
): Promise<number | null> {
  const limit = await getUsageLimit(workspaceId, usageKey);
  if (limit === null) return null;

  const usage = await getCurrentUsage(workspaceId, usageKey);
  return Math.max(0, limit - usage);
}

async function getCurrentUsage(workspaceId: string, usageKey: string): Promise<number> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { membership: true },
  });

  if (!workspace) return 0;

  const userId = workspace.membership[0]?.userId;
  if (!userId) return 0;

  const usageType = usageKey === 'socialChecks' ? 'social_check' : 'website_scan';

  const records = await prisma.usageRecord.findMany({
    where: {
      userId,
      usageType,
      billingPeriodStart: { lte: periodEnd },
      billingPeriodEnd: { gte: periodStart },
    },
  });

  return records.reduce((sum, r) => sum + r.quantity, 0);
}

function getDefaultFeatureAccess(featureKey: string): boolean {
  const freeFeatures: Record<string, boolean> = {
    downloadableReports: false,
    shareableReports: false,
    fullRecommendations: false,
    desktopWebsiteCheck: false,
    mobileWebsiteCheck: false,
  };
  return freeFeatures[featureKey] ?? false;
}

function getDefaultUsageLimit(usageKey: string): number | null {
  const freeLimits: Record<string, number> = {
    socialChecks: 3,
    websiteScans: 1,
    maxPagesPerScan: 1,
    reportHistoryDays: 7,
  };
  return freeLimits[usageKey] ?? null;
}

function getPlanFeatureAccess(planKey: string, featureKey: string): boolean {
  const planFeatures: Record<string, Record<string, boolean>> = {
    free: {
      downloadableReports: false,
      shareableReports: false,
      fullRecommendations: false,
      desktopWebsiteCheck: false,
      mobileWebsiteCheck: false,
    },
    'brand-guard-lite': {
      downloadableReports: true,
      shareableReports: true,
      fullRecommendations: true,
      desktopWebsiteCheck: true,
      mobileWebsiteCheck: true,
    },
    starter: {
      downloadableReports: true,
      shareableReports: true,
      fullRecommendations: true,
      desktopWebsiteCheck: true,
      mobileWebsiteCheck: true,
    },
    pro: {
      downloadableReports: true,
      shareableReports: true,
      fullRecommendations: true,
      desktopWebsiteCheck: true,
      mobileWebsiteCheck: true,
    },
    business: {
      downloadableReports: true,
      shareableReports: true,
      fullRecommendations: true,
      desktopWebsiteCheck: true,
      mobileWebsiteCheck: true,
    },
  };

  return planFeatures[planKey]?.[featureKey] ?? getDefaultFeatureAccess(featureKey);
}

function getPlanUsageLimit(planKey: string, usageKey: string): number | null {
  const planLimits: Record<string, Record<string, number>> = {
    free: {
      socialChecks: 3,
      websiteScans: 1,
      maxPagesPerScan: 1,
      reportHistoryDays: 7,
    },
    'brand-guard-lite': {
      socialChecks: 50,
      websiteScans: 5,
      maxPagesPerScan: 5,
      reportHistoryDays: 30,
    },
    starter: {
      socialChecks: 50,
      websiteScans: 5,
      maxPagesPerScan: 5,
      reportHistoryDays: 30,
    },
    pro: {
      socialChecks: 500,
      websiteScans: 50,
      maxPagesPerScan: 10,
      reportHistoryDays: 90,
    },
    business: {
      socialChecks: -1,
      websiteScans: -1,
      maxPagesPerScan: 20,
      reportHistoryDays: 365,
    },
  };

  return planLimits[planKey]?.[usageKey] ?? getDefaultUsageLimit(usageKey);
}
