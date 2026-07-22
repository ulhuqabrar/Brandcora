import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@saas/database';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireWorkspaceMember, requireWorkspaceAdmin, requireWorkspaceOwner } from '../../middleware/require-workspace.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';

const router = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const data = createWorkspaceSchema.parse(req.body);

  const existing = await prisma.workspace.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return res.status(409).json({ success: false, error: 'Slug already taken' });
  }

  const workspace = await prisma.workspace.create({
    data: {
      ...data,
      ownerId: req.userId!,
      membership: {
        create: {
          userId: req.userId!,
          role: 'owner',
        },
      },
    },
    include: { membership: true },
  });

  res.status(201).json({ success: true, data: workspace });
});

router.get('/:workspaceId', requireAuth, requireWorkspaceMember(), async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { membership: { include: { user: true } } },
  });
  res.json({ success: true, data: workspace });
});

router.patch('/:workspaceId', requireAuth, requireWorkspaceAdmin(), async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: req.body.name, slug: req.body.slug },
  });
  res.json({ success: true, data: workspace });
});

router.delete('/:workspaceId', requireAuth, requireWorkspaceOwner(), async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  await prisma.workspace.delete({ where: { id: workspaceId } });
  res.json({ success: true, message: 'Workspace deleted' });
});

export { router as workspaceRoutes };
