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
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = origin === env.WEB_APP_URL ||
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

// ─── Auth Routes (Better Auth MUST be before body parsing) ────────────────────
app.all('/api/auth/*', toNodeHandler(auth));

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

// ─── Start Server ─────────────────────────────────────────────────────────────
const port = Number(process.env.PORT || 10000);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API server running on port ${port}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API URL: ${env.API_BASE_URL}`);
});

export default app;
