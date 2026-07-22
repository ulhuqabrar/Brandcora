import type { Response, NextFunction } from 'express';
import { prisma } from '@saas/database';
import type { AuthenticatedRequest } from './require-auth.js';

export function requireWorkspaceMember(
  paramName: string = 'workspaceId'
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workspaceId = String(req.params[paramName] || '');
    if (!workspaceId || !req.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    (req as any).membership = membership;
    next();
  };
}

export function requireWorkspaceAdmin(
  paramName: string = 'workspaceId'
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workspaceId = String(req.params[paramName] || '');
    if (!workspaceId || !req.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.userId,
          workspaceId,
        },
      },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    (req as any).membership = membership;
    next();
  };
}

export function requireWorkspaceOwner(
  paramName: string = 'workspaceId'
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workspaceId = String(req.params[paramName] || '');
    if (!workspaceId || !req.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.userId,
          workspaceId,
        },
      },
    });

    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    (req as any).membership = membership;
    next();
  };
}
