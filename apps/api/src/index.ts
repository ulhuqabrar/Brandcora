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

const betterAuthHandler = toNodeHandler(auth);

// ─── Callback Instrumentation ────────────────────────────────────────────────
// Only for GET /api/auth/callback/google — traces session creation step-by-step

app.get('/api/auth/callback/google', async (req, res) => {
  const ts = () => new Date().toISOString();
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`[${ts()}] CALLBACK ENTRY — GET /api/auth/callback/google`);
  console.log(`${'═'.repeat(70)}`);

  // 1. Query parameters received
  console.log(`\n[1] QUERY PARAMETERS:`);
  console.log(`    code: ${req.query.code ? `present (${String(req.query.code).length} chars)` : 'MISSING'}`);
  console.log(`    state: ${req.query.state ? `present (${String(req.query.state).length} chars)` : 'MISSING'}`);
  console.log(`    scope: ${req.query.scope || 'NONE'}`);
  console.log(`    error: ${req.query.error || 'NONE'}`);
  console.log(`    error_description: ${req.query.error_description || 'NONE'}`);
  console.log(`    All params: ${JSON.stringify(req.query)}`);

  // 2. Incoming cookies
  console.log(`\n[2] INCOMING COOKIES:`);
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    cookies.forEach(c => {
      const eqIdx = c.indexOf('=');
      const name = eqIdx > -1 ? c.substring(0, eqIdx) : c;
      const value = eqIdx > -1 ? c.substring(eqIdx + 1) : '';
      console.log(`    ${name} = (length: ${value.length})`);
    });
    const stateCookie = cookies.find(c => c.startsWith('better-auth.state='));
    console.log(`    → better-auth.state cookie: ${stateCookie ? 'FOUND' : 'MISSING'}`);
  } else {
    console.log(`    NO COOKIES SENT BY BROWSER`);
  }

  // 3. Intercept res.end to capture response details
  const originalEnd = res.end;
  let responseBody = '';
  let endCalled = false;

  res.end = function (this: any, ...args: any[]) {
    if (endCalled) return originalEnd.apply(this, args as any);
    endCalled = true;

    // Capture body if it's a buffer/string
    if (args[0]) {
      responseBody = Buffer.isBuffer(args[0])
        ? args[0].toString('utf8')
        : typeof args[0] === 'string'
          ? args[0]
          : JSON.stringify(args[0]);
    }

    const status = res.statusCode;
    const location = res.getHeader('location');
    const setCookieRaw = res.getHeader('set-cookie');

    console.log(`\n[3] RESPONSE SENT:`);
    console.log(`    HTTP Status: ${status}`);
    console.log(`    Location: ${location || 'NONE'}`);
    console.log(`    Body length: ${responseBody.length}`);
    if (responseBody.length > 0 && responseBody.length < 2000) {
      console.log(`    Body: ${responseBody}`);
    }

    // 8. Every Set-Cookie header
    console.log(`\n[4] SET-COOKIE HEADERS:`);
    if (setCookieRaw) {
      const cookies = Array.isArray(setCookieRaw) ? setCookieRaw : [setCookieRaw];
      console.log(`    Total: ${cookies.length}`);
      cookies.forEach((c: any, i: number) => {
        const cookieStr = String(c);
        const parts = cookieStr.split(';').map((p: string) => p.trim());
        const [nameValue, ...attrs] = parts;
        const eqIdx = nameValue.indexOf('=');
        const name = eqIdx > -1 ? nameValue.substring(0, eqIdx) : nameValue;
        const value = eqIdx > -1 ? nameValue.substring(eqIdx + 1) : '';
        console.log(`\n    Cookie #${i + 1}:`);
        console.log(`      Name: ${name}`);
        console.log(`      Value length: ${value.length}`);
        console.log(`      Domain: ${attrs.find((a: string) => a.toLowerCase().startsWith('domain=')) || 'NOT SET (browser default)'}`);
        console.log(`      Path: ${attrs.find((a: string) => a.toLowerCase().startsWith('path=')) || 'NOT SET'}`);
        console.log(`      Secure: ${attrs.some((a: string) => a.toLowerCase() === 'secure')}`);
        console.log(`      SameSite: ${attrs.find((a: string) => a.toLowerCase().startsWith('samesite=')) || 'NOT SET'}`);
        console.log(`      HttpOnly: ${attrs.some((a: string) => a.toLowerCase() === 'httponly')}`);
        console.log(`      Max-Age: ${attrs.find((a: string) => a.toLowerCase().startsWith('max-age=')) || 'NOT SET'}`);
        console.log(`      Expires: ${attrs.find((a: string) => a.toLowerCase().startsWith('expires=')) || 'NOT SET'}`);
      });
    } else {
      console.log(`    NO SET-COOKIE HEADERS !!!`);
    }

    // 9. Error detection
    if (status >= 400 || (responseBody && responseBody.includes('error'))) {
      console.log(`\n[5] ERROR DETECTED:`);
      console.log(`    Status ${status} indicates failure`);
      if (responseBody) {
        try {
          const parsed = JSON.parse(responseBody);
          console.log(`    Error response: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          console.log(`    Raw response: ${responseBody}`);
        }
      }
    }

    // 10. Database verification — check what Better Auth actually wrote
    console.log(`\n[6] DATABASE VERIFICATION:`);
    try {
      // Look up user by Google email
      const googleAccount = await prisma.account.findFirst({
        where: { providerId: 'google' },
        include: { user: true },
      });
      if (googleAccount) {
        console.log(`    Account: FOUND (id=${googleAccount.id}, providerAccountId=${googleAccount.providerAccountId})`);
        console.log(`    User: FOUND (id=${googleAccount.user.id}, email=${googleAccount.user.email})`);

        // Check for session
        const session = await prisma.session.findFirst({
          where: { userId: googleAccount.user.id },
          orderBy: { createdAt: 'desc' },
        });
        if (session) {
          console.log(`    Session: FOUND (id=${session.id}, expiresAt=${session.expiresAt})`);
          // 7. Whether session cookie was attempted
          const hasSessionCookie = setCookieRaw && String(setCookieRaw).includes('better-auth.session_token');
          console.log(`    → Session cookie in Set-Cookie: ${hasSessionCookie ? 'YES' : 'NO'}`);
        } else {
          console.log(`    Session: NOT CREATED !!!`);
          console.log(`    → This is why get-session returns null`);
        }
      } else {
        console.log(`    Account: NOT FOUND`);
        console.log(`    → Better Auth did not create an Account record`);
        console.log(`    → The Google token exchange may have failed`);
      }
    } catch (dbErr: any) {
      console.log(`    DB QUERY FAILED: ${dbErr.message}`);
      console.log(`    ${dbErr.stack}`);
    }

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`[${ts()}] CALLBACK TRACE COMPLETE`);
    console.log(`${'═'.repeat(70)}\n`);

    return originalEnd.apply(this, args as any);
  };

  // Execute Better Auth handler
  try {
    betterAuthHandler(req, res);
  } catch (err: any) {
    console.log(`\n[${ts()}] EXCEPTION IN BETTER AUTH HANDLER:`);
    console.log(`    Name: ${err.name}`);
    console.log(`    Message: ${err.message}`);
    console.log(`    Stack:\n${err.stack}`);
  }
});

// ─── Catch-all for other auth routes (sign-in, get-session, etc.) ────────────
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
