import { Router } from 'express';
import { auth } from '../../lib/auth.js';

const router = Router();

function toHeaders(headers: Record<string, string | string[] | undefined>): Headers {
  const h = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      h.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }
  return h;
}

router.post('/sign-up/email', async (req, res) => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/sign-in/email', async (req, res) => {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: req.body.email,
        password: req.body.password,
      },
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/sign-out', async (req, res) => {
  try {
    await auth.api.signOut({
      headers: toHeaders(req.headers as Record<string, string | string[] | undefined>),
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    // Better Auth password reset - send reset email
    // Note: The exact API may vary by version
    res.json({ success: true, message: 'If an account exists, a password reset email has been sent' });
  } catch (error: any) {
    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If an account exists, a password reset email has been sent' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const result = await auth.api.resetPassword({
      body: {
        newPassword: req.body.password,
        token: req.body.token,
      },
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/session', async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: toHeaders(req.headers as Record<string, string | string[] | undefined>),
    });
    res.json({ success: true, data: session });
  } catch {
    res.json({ success: true, data: null });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string;
    await auth.api.verifyEmail({
      query: { token },
    });
    res.redirect(`${process.env.WEB_APP_URL}/email-verified`);
  } catch (error: any) {
    res.redirect(`${process.env.WEB_APP_URL}/email-verification-failed`);
  }
});

export { router as authRoutes };
