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

// ─── STEP 1: Instrument Better Auth ───────────────────────────────────────────
// This middleware logs EVERY request to /api/auth/* before Better Auth sees it

const betterAuthHandler = toNodeHandler(auth);

app.all('/api/auth/*', (req, res) => {
  const timestamp = new Date().toISOString();
  const isCallback = req.path.includes('/callback/');
  const isSignIn = req.path.includes('/sign-in/');
  const isGetSession = req.path.includes('/get-session') || req.path.includes('/session');

  // ─── STEP 1: AUTH START ────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('AUTH START');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Full URL: ${req.originalUrl}`);
  console.log(`Origin: ${req.headers.origin || 'NONE'}`);
  console.log(`Host: ${req.headers.host}`);
  console.log(`Referer: ${req.headers.referer || 'NONE'}`);
  console.log(`Remote IP: ${req.ip || req.socket.remoteAddress}`);

  // ─── STEP 6: Incoming Cookies ──────────────────────────────────────────────
  console.log('\n--- Incoming Cookies ---');
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    cookies.forEach(c => {
      const [name, ...rest] = c.split('=');
      const value = rest.join('=');
      console.log(`  ${name} = (length: ${value.length}, starts: ${value.substring(0, 20)}...)`);
    });
  } else {
    console.log('  No cookies received');
  }

  // ─── STEP 1: Headers ──────────────────────────────────────────────────────
  console.log('\n--- Headers ---');
  console.log(`  Origin: ${req.headers.origin || 'NONE'}`);
  console.log(`  Host: ${req.headers.host}`);
  console.log(`  Cookie: ${req.headers.cookie ? `present (${req.headers.cookie.length} bytes)` : 'MISSING'}`);
  console.log(`  X-Forwarded-Host: ${req.headers['x-forwarded-host'] || 'NONE'}`);
  console.log(`  X-Forwarded-Proto: ${req.headers['x-forwarded-proto'] || 'NONE'}`);
  console.log(`  X-Forwarded-For: ${req.headers['x-forwarded-for'] || 'NONE'}`);

  // ─── STEP 1: Environment ──────────────────────────────────────────────────
  console.log('\n--- Environment ---');
  console.log(`  BETTER_AUTH_URL: ${env.BETTER_AUTH_URL}`);
  console.log(`  WEB_APP_URL: ${env.WEB_APP_URL}`);
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);

  // ─── STEP 2: Sign-in specific logging ───────────────────────────────────────
  if (isSignIn) {
    console.log('\n--- Sign-In Request ---');
    console.log(`  Provider: ${req.body?.provider || 'UNKNOWN'}`);
    console.log(`  callbackURL: ${req.body?.callbackURL || 'NONE'}`);
    console.log(`  errorCallbackURL: ${req.body?.errorCallbackURL || 'NONE'}`);
  }

  // ─── STEP 2: Callback-specific logging ─────────────────────────────────────
  if (isCallback) {
    console.log('\n--- Callback Query Parameters ---');
    console.log(`  code: ${req.query.code ? `present (length: ${(req.query.code as string).length})` : 'MISSING'}`);
    console.log(`  state: ${req.query.state ? `present (length: ${(req.query.state as string).length})` : 'MISSING'}`);
    console.log(`  error: ${req.query.error || 'NONE'}`);
    console.log(`  error_description: ${req.query.error_description || 'NONE'}`);

    // ─── STEP 2: State cookie check ──────────────────────────────────────────
    console.log('\n--- State Cookie Check ---');
    if (cookieHeader) {
      const stateCookie = cookieHeader.split(';').find(c => c.trim().startsWith('better-auth.state='));
      if (stateCookie) {
        const value = stateCookie.split('=').slice(1).join('=');
        console.log(`  better-auth.state: PRESENT (length: ${value.length})`);
      } else {
        console.log('  better-auth.state: MISSING !!!');
        console.log('  THIS IS WHY STATE_MISMATCH OCCURS');
        console.log('  The OAuth state cookie was not sent back by the browser.');
        console.log('  Possible causes:');
        console.log('    1. Cookie domain mismatch');
        console.log('    2. Cookie was cleared');
        console.log('    3. Cookie SameSite/Secure attributes prevented it');
        console.log('    4. Cookie was set for a different domain');
      }
    } else {
      console.log('  better-auth.state: NO COOKIES AT ALL !!!');
    }
  }

  // ─── STEP 1: Redirect URLs ────────────────────────────────────────────────
  if (isSignIn) {
    console.log('\n--- Redirect URLs ---');
    console.log(`  BETTER_AUTH_URL (baseURL): ${env.BETTER_AUTH_URL}`);
    console.log(`  Google redirect_uri will be: ${env.BETTER_AUTH_URL}/callback/google`);
  }

  // ─── STEP 3: Wrap Better Auth handler ──────────────────────────────────────
  console.log('\n--- Entering Better Auth handler ---');

  // Intercept res.end to capture response
  const originalEnd = res.end;
  let responseCaptured = false;
  res.end = function(this: any, ...args: any[]) {
    if (!responseCaptured) {
      responseCaptured = true;
      console.log('\n--- Exited Better Auth handler ---');
      console.log(`  Response status: ${res.statusCode}`);

      // ─── STEP 6: ALL Response Headers ──────────────────────────────────────
      console.log('\n--- ALL Response Headers ---');
      const headers = res.getHeaders();
      for (const [key, value] of Object.entries(headers)) {
        console.log(`  ${key}: ${value}`);
      }

      // ─── STEP 6: Outgoing Set-Cookie (detailed) ──────────────────────────
      const setCookie = res.getHeader('set-cookie');
      console.log('\n--- Outgoing Set-Cookie (detailed) ---');
      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        console.log(`  Total cookies: ${cookies.length}`);
        cookies.forEach((c: string | number, i: number) => {
          const cookieStr = String(c);
          console.log(`\n  Cookie #${i + 1}:`);
          console.log(`    Raw: ${cookieStr}`);
          const parts = cookieStr.split(';').map(p => p.trim());
          const [nameValue, ...attrs] = parts;
          const [name, ...valParts] = nameValue.split('=');
          const value = valParts.join('=');
          console.log(`    Name: ${name}`);
          console.log(`    Value length: ${value.length}`);
          console.log(`    Domain: ${attrs.find(a => a.toLowerCase().startsWith('domain=')) || 'NOT SET (browser will use request domain)'}`);
          console.log(`    Path: ${attrs.find(a => a.toLowerCase().startsWith('path=')) || 'NOT SET'}`);
          console.log(`    Secure: ${attrs.some(a => a.toLowerCase() === 'secure')}`);
          console.log(`    SameSite: ${attrs.find(a => a.toLowerCase().startsWith('samesite=')) || 'NOT SET'}`);
          console.log(`    HttpOnly: ${attrs.some(a => a.toLowerCase() === 'httponly')}`);
          console.log(`    Max-Age: ${attrs.find(a => a.toLowerCase().startsWith('max-age=')) || 'NOT SET'}`);
        });
      } else {
        console.log('  NO SET-COOKIE HEADER IN RESPONSE !!!');
        console.log('  This means the backend did not issue any cookies.');
      }

      // ─── STEP 7: Redirect URLs ──────────────────────────────────────────
      const location = res.getHeader('location');
      if (location) {
        console.log('\n--- Redirect ---');
        console.log(`  Location: ${location}`);
      }

      console.log('='.repeat(60) + '\n');
    }
    return originalEnd.apply(this, args as any);
  };

  // ─── STEP 3: Execute handler with error catching ──────────────────────────
  try {
    betterAuthHandler(req, res);
  } catch (err: any) {
    console.log('\n' + '='.repeat(60));
    console.log('EXCEPTION IN BETTER AUTH HANDLER');
    console.log('='.repeat(60));
    console.log(`  Name: ${err.name}`);
    console.log(`  Message: ${err.message}`);
    console.log(`  Stack: ${err.stack}`);
  }
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
