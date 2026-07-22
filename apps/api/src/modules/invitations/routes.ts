import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@saas/database';
import crypto from 'crypto';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireWorkspaceAdmin } from '../../middleware/require-workspace.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';

const router = Router();

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

router.post('/:workspaceId', requireAuth, requireWorkspaceAdmin(), async (req: AuthenticatedRequest, res) => {
  const data = inviteSchema.parse(req.body);
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const workspaceId = String(req.params.workspaceId);

  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      email: data.email,
      role: data.role,
      token,
      invitedById: req.userId!,
      expiresAt,
    },
  });

  // TODO: Send invitation email
  console.log(`📧 Invitation token for ${data.email}: ${token}`);

  res.status(201).json({ success: true, data: invitation });
});

router.post('/accept', requireAuth, async (req: AuthenticatedRequest, res) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token: req.body.token },
  });

  if (!invitation) {
    return res.status(404).json({ success: false, error: 'Invitation not found' });
  }

  if (invitation.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Invitation already used' });
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'expired' },
    });
    return res.status(400).json({ success: false, error: 'Invitation expired' });
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: req.userId!,
        workspaceId: invitation.workspaceId,
      },
    },
  });

  if (existingMembership) {
    return res.status(400).json({ success: false, error: 'Already a member' });
  }

  const [membership] = await prisma.$transaction([
    prisma.membership.create({
      data: {
        userId: req.userId!,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted', acceptedAt: new Date() },
    }),
  ]);

  res.json({ success: true, data: membership });
});

router.get('/:workspaceId', requireAuth, requireWorkspaceAdmin(), async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const invitations = await prisma.invitation.findMany({
    where: { workspaceId },
  });
  res.json({ success: true, data: invitations });
});

router.delete('/:invitationId', requireAuth, requireWorkspaceAdmin(), async (req: AuthenticatedRequest, res) => {
  const invitationId = String(req.params.invitationId);
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: 'revoked' },
  });
  res.json({ success: true, message: 'Invitation revoked' });
});

export { router as invitationRoutes };
