import { Router } from 'express';
import { prisma } from '@saas/database';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';

const router = Router();

router.get('/:workspaceId', requireAuth, async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({
      where: { workspaceId },
    }),
  ]);

  res.json({
    success: true,
    data: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export { router as auditRoutes };
