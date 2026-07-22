import type { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
}

function toHeaders(headers: Record<string, string | string[] | undefined>): Headers {
  const h = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      h.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }
  return h;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: toHeaders(req.headers as Record<string, string | string[] | undefined>),
    });

    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    req.userId = session.user.id;
    req.sessionId = session.session.id;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}
