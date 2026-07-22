import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '@saas/database';
import { getServerEnv } from '@saas/config';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';

const router = Router();
const env = getServerEnv();

function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

router.get('/:workspaceId', requireAuth, async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const subscription = await prisma.subscription.findFirst({
    where: { workspaceId },
  });
  res.json({ success: true, data: subscription });
});

router.post('/:workspaceId/cancel', requireAuth, async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const stripe = getStripeClient();

  const subscription = await prisma.subscription.findFirst({
    where: { workspaceId },
  });

  if (!subscription) {
    return res.status(404).json({ success: false, error: 'No active subscription' });
  }

  // Cancel at period end in Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: true },
  });

  res.json({ success: true, data: updated });
});

router.post('/:workspaceId/reactivate', requireAuth, async (req: AuthenticatedRequest, res) => {
  const workspaceId = String(req.params.workspaceId);
  const stripe = getStripeClient();

  const subscription = await prisma.subscription.findFirst({
    where: { workspaceId },
  });

  if (!subscription) {
    return res.status(404).json({ success: false, error: 'No active subscription' });
  }

  // Reactivate in Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: false },
  });

  res.json({ success: true, data: updated });
});

export { router as subscriptionRoutes };
