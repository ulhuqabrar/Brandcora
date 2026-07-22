import { Router } from 'express';
import { prisma } from '@saas/database';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireWorkspaceAdmin } from '../../middleware/require-workspace.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';

const router = Router();

router.get('/:workspaceId/members', requireAuth, requireWorkspaceAdmin(), async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const members = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: true },
  });
  res.json({ success: true, data: members });
});

router.patch('/:membershipId/role', requireAuth, async (req: AuthenticatedRequest, res) => {
  const membershipId = String(req.params.membershipId);
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    return res.status(404).json({ success: false, error: 'Membership not found' });
  }

  if (membership.role === 'owner') {
    return res.status(400).json({ success: false, error: 'Cannot change owner role' });
  }

  const updated = await prisma.membership.update({
    where: { id: membershipId },
    data: { role: req.body.role },
  });

  res.json({ success: true, data: updated });
});

router.delete('/:membershipId', requireAuth, async (req: AuthenticatedRequest, res) => {
  const membershipId = String(req.params.membershipId);
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    return res.status(404).json({ success: false, error: 'Membership not found' });
  }

  if (membership.role === 'owner') {
    return res.status(400).json({ success: false, error: 'Cannot remove workspace owner' });
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  res.json({ success: true, message: 'Member removed' });
});

export { router as membershipRoutes };
