import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getServerEnv } from '@saas/config';
import { prisma } from '@saas/database';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { authRoutes } from './modules/auth/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { workspaceRoutes } from './modules/workspaces/routes.js';
import { membershipRoutes } from './modules/memberships/routes.js';
import { invitationRoutes } from './modules/invitations/routes.js';
import { billingRoutes } from './modules/billing/routes.js';
import { subscriptionRoutes } from './modules/subscriptions/routes.js';
import { webhookRoutes } from './modules/webhooks/routes.js';
import { auditRoutes } from './modules/audit/routes.js';
import { brandProfileRoutes } from './modules/brand-profile/routes.js';
import { uploadRoutes } from './modules/uploads/routes.js';
import { scanRoutes } from './modules/scans/routes.js';
import { dashboardRoutes } from './modules/dashboard/routes.js';
import { usageRoutes } from './modules/usage/routes.js';
import { brandExtractRoutes } from './modules/brand-extract/routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';

const env = getServerEnv();
const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = origin === env.WEB_APP_URL ||
      origin === 'https://brandcora.vercel.app' ||
      /^https:\/\/brandcora-.*\.vercel\.app$/.test(origin);
    callback(null, allowed);
  },
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Better Auth Handler ──────────────────────────────────────────────────────
const betterAuthHandler = toNodeHandler(auth);

app.get('/api/auth/callback/google', (req, res) => {
  betterAuthHandler(req, res);
});

app.all('/api/auth/*', (req, res) => {
  betterAuthHandler(req, res);
});

// ─── Body Parsing (after Better Auth) ────────────────────────────────────────
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/brand-profile', brandProfileRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/usage', usageRoutes);
app.use('/api/v1/brand-extract', brandExtractRoutes);

// ─── Static uploads ─────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Webhook Routes ───────────────────────────────────────────────────────────
app.use('/api/v1/webhooks', webhookRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Ensure all tables exist (idempotent) ─────────────────────────────────────
const TABLES = [
  `CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"email" TEXT NOT NULL,"emailVerified" BOOLEAN NOT NULL DEFAULT false,"image" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "users_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "sessions" ("id" TEXT NOT NULL,"expiresAt" TIMESTAMP(3) NOT NULL,"token" TEXT NOT NULL,"ipAddress" TEXT,"userAgent" TEXT,"userId" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "accounts" ("id" TEXT NOT NULL,"accountId" TEXT NOT NULL,"providerId" TEXT NOT NULL,"userId" TEXT NOT NULL,"accessToken" TEXT,"refreshToken" TEXT,"idToken" TEXT,"accessTokenExpiresAt" TIMESTAMP(3),"refreshTokenExpiresAt" TIMESTAMP(3),"scope" TEXT,"password" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "verifications" ("id" TEXT NOT NULL,"identifier" TEXT NOT NULL,"value" TEXT NOT NULL,"expiresAt" TIMESTAMP(3) NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "verifications_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "profiles" ("id" TEXT NOT NULL,"authUserId" TEXT NOT NULL,"displayName" TEXT,"avatar" TEXT,"onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "workspaces" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"slug" TEXT NOT NULL,"ownerId" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "memberships" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"workspaceId" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'member',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "memberships_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "invitations" ("id" TEXT NOT NULL,"workspaceId" TEXT NOT NULL,"email" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'member',"token" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'pending',"invitedById" TEXT NOT NULL,"expiresAt" TIMESTAMP(3) NOT NULL,"acceptedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "invitations_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "billing_customers" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"workspaceId" TEXT,"stripeCustomerId" TEXT NOT NULL,"billingEmail" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "billing_customers_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "subscriptions" ("id" TEXT NOT NULL,"workspaceId" TEXT NOT NULL,"stripeSubscriptionId" TEXT NOT NULL,"stripeCustomerId" TEXT NOT NULL,"stripePriceId" TEXT NOT NULL,"planKey" TEXT NOT NULL,"status" TEXT NOT NULL,"billingInterval" TEXT NOT NULL,"currentPeriodStart" TIMESTAMP(3) NOT NULL,"currentPeriodEnd" TIMESTAMP(3) NOT NULL,"cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "webhook_events" ("id" TEXT NOT NULL,"provider" TEXT NOT NULL,"externalEventId" TEXT NOT NULL,"eventType" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'pending',"failureReason" TEXT,"processedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "audit_logs" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"workspaceId" TEXT,"action" TEXT NOT NULL,"entityType" TEXT NOT NULL,"entityId" TEXT,"metadata" JSONB,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "brand_profiles" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"headingFont" TEXT,"bodyFont" TEXT,"buttonRadius" INTEGER NOT NULL DEFAULT 8,"borderRadius" INTEGER NOT NULL DEFAULT 8,"spacingPreference" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "brand_colors" ("id" TEXT NOT NULL,"brandProfileId" TEXT NOT NULL,"name" TEXT NOT NULL,"hexValue" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'additional',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "brand_colors_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "brand_fonts" ("id" TEXT NOT NULL,"brandProfileId" TEXT NOT NULL,"name" TEXT NOT NULL,"family" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'body',"weight" INTEGER NOT NULL DEFAULT 400,"url" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "brand_fonts_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "brand_logos" ("id" TEXT NOT NULL,"brandProfileId" TEXT NOT NULL,"fileUrl" TEXT NOT NULL,"storageKey" TEXT NOT NULL,"logoType" TEXT NOT NULL DEFAULT 'primary',"backgroundType" TEXT NOT NULL DEFAULT 'any',"width" INTEGER,"height" INTEGER,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "brand_logos_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "brand_rules" ("id" TEXT NOT NULL,"brandProfileId" TEXT NOT NULL,"category" TEXT NOT NULL,"name" TEXT NOT NULL,"value" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "brand_rules_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "brand_gradients" ("id" TEXT NOT NULL,"brandProfileId" TEXT NOT NULL,"name" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'additional',"gradientType" TEXT NOT NULL DEFAULT 'linear',"repeating" BOOLEAN NOT NULL DEFAULT false,"originalValue" TEXT NOT NULL,"normalizedValue" TEXT NOT NULL,"angle" DOUBLE PRECISION,"shape" TEXT,"position" TEXT,"stops" JSONB NOT NULL,"usageCount" INTEGER NOT NULL DEFAULT 0,"pageCount" INTEGER NOT NULL DEFAULT 0,"sourceType" TEXT NOT NULL DEFAULT 'detected',"cssVariableName" TEXT,"confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,"isApproved" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "brand_gradients_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "scans" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"brandProfileId" TEXT NOT NULL,"scanType" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'pending',"progress" INTEGER NOT NULL DEFAULT 0,"currentStage" TEXT,"pagesDiscovered" INTEGER NOT NULL DEFAULT 0,"pagesAnalyzed" INTEGER NOT NULL DEFAULT 0,"warnings" JSONB NOT NULL DEFAULT '[]'::jsonb,"sourceUrl" TEXT,"sourceFileUrl" TEXT,"platform" TEXT,"overallScore" DOUBLE PRECISION,"scoringVersion" TEXT NOT NULL DEFAULT '1.0',"startedAt" TIMESTAMP(3),"completedAt" TIMESTAMP(3),"failedAt" TIMESTAMP(3),"errorCode" TEXT,"errorMessage" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "scans_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "scan_scores" ("id" TEXT NOT NULL,"scanId" TEXT NOT NULL,"category" TEXT NOT NULL,"score" DOUBLE PRECISION NOT NULL,"weight" DOUBLE PRECISION NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "scan_scores_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "scan_issues" ("id" TEXT NOT NULL,"scanId" TEXT NOT NULL,"category" TEXT NOT NULL,"severity" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT NOT NULL,"recommendation" TEXT,"metadataJson" JSONB,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "scan_issues_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "scan_pages" ("id" TEXT NOT NULL,"scanId" TEXT NOT NULL,"url" TEXT NOT NULL,"pageTitle" TEXT,"desktopScreenshotUrl" TEXT,"mobileScreenshotUrl" TEXT,"status" TEXT NOT NULL DEFAULT 'pending',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "scan_pages_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "usage_records" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"scanId" TEXT,"usageType" TEXT NOT NULL,"quantity" INTEGER NOT NULL DEFAULT 1,"billingPeriodStart" TIMESTAMP(3) NOT NULL,"billingPeriodEnd" TIMESTAMP(3) NOT NULL,"idempotencyKey" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id"))`,
];

const INDEXES = [
  `CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token")`,
  `CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "accounts_accountId_providerId_key" ON "accounts"("accountId", "providerId")`,
  `CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "verifications_identifier_value_key" ON "verifications"("identifier", "value")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "profiles_authUserId_key" ON "profiles"("authUserId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_slug_key" ON "workspaces"("slug")`,
  `CREATE INDEX IF NOT EXISTS "workspaces_ownerId_idx" ON "workspaces"("ownerId")`,
  `CREATE INDEX IF NOT EXISTS "memberships_userId_idx" ON "memberships"("userId")`,
  `CREATE INDEX IF NOT EXISTS "memberships_workspaceId_idx" ON "memberships"("workspaceId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "memberships_userId_workspaceId_key" ON "memberships"("userId", "workspaceId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "invitations_token_key" ON "invitations"("token")`,
  `CREATE INDEX IF NOT EXISTS "invitations_workspaceId_idx" ON "invitations"("workspaceId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "billing_customers_stripeCustomerId_key" ON "billing_customers"("stripeCustomerId")`,
  `CREATE INDEX IF NOT EXISTS "billing_customers_userId_idx" ON "billing_customers"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId")`,
  `CREATE INDEX IF NOT EXISTS "subscriptions_workspaceId_idx" ON "subscriptions"("workspaceId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_provider_externalEventId_key" ON "webhook_events"("provider", "externalEventId")`,
  `CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "brand_profiles_userId_key" ON "brand_profiles"("userId")`,
  `CREATE INDEX IF NOT EXISTS "brand_colors_brandProfileId_idx" ON "brand_colors"("brandProfileId")`,
  `CREATE INDEX IF NOT EXISTS "brand_fonts_brandProfileId_idx" ON "brand_fonts"("brandProfileId")`,
  `CREATE INDEX IF NOT EXISTS "brand_logos_brandProfileId_idx" ON "brand_logos"("brandProfileId")`,
  `CREATE INDEX IF NOT EXISTS "brand_rules_brandProfileId_idx" ON "brand_rules"("brandProfileId")`,
  `CREATE INDEX IF NOT EXISTS "brand_gradients_brandProfileId_idx" ON "brand_gradients"("brandProfileId")`,
  `CREATE INDEX IF NOT EXISTS "scans_userId_idx" ON "scans"("userId")`,
  `CREATE INDEX IF NOT EXISTS "scans_brandProfileId_idx" ON "scans"("brandProfileId")`,
  `CREATE INDEX IF NOT EXISTS "scan_scores_scanId_idx" ON "scan_scores"("scanId")`,
  `CREATE INDEX IF NOT EXISTS "scan_issues_scanId_idx" ON "scan_issues"("scanId")`,
  `CREATE INDEX IF NOT EXISTS "scan_issues_severity_idx" ON "scan_issues"("severity")`,
  `CREATE INDEX IF NOT EXISTS "scan_pages_scanId_idx" ON "scan_pages"("scanId")`,
  `CREATE INDEX IF NOT EXISTS "usage_records_userId_idx" ON "usage_records"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "usage_records_idempotencyKey_key" ON "usage_records"("idempotencyKey")`,
  `CREATE INDEX IF NOT EXISTS "usage_records_usageType_idx" ON "usage_records"("usageType")`,
  `CREATE INDEX IF NOT EXISTS "usage_records_billingPeriodStart_idx" ON "usage_records"("billingPeriodStart")`,
];

async function ensureSchema() {
  try {
    for (const sql of TABLES) {
      await prisma.$executeRawUnsafe(sql);
    }
    for (const sql of INDEXES) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ Database schema verified');
  } catch (e: any) {
    console.warn('⚠️ Schema migration warning:', e.message);
  }
}

ensureSchema().catch(() => {});

// ─── Start Server ─────────────────────────────────────────────────────────────
const port = Number(process.env.PORT || 10000);

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API server running on port ${port}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API URL: ${env.API_BASE_URL}`);
  console.log(`🔐 BETTER_AUTH_URL: ${env.BETTER_AUTH_URL}`);
  console.log(`🌐 WEB_APP_URL: ${env.WEB_APP_URL}`);
});

export default app;
