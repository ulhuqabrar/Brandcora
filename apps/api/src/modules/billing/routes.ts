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

function resolvePriceId(planKey: string, interval: string): string | null {
  const map: Record<string, Record<string, string | undefined>> = {
    starter: {
      monthly: env.STRIPE_PRICE_ID_STARTER_MONTHLY,
      yearly: env.STRIPE_PRICE_ID_STARTER_YEARLY,
    },
    pro: {
      monthly: env.STRIPE_PRICE_ID_PRO_MONTHLY,
      yearly: env.STRIPE_PRICE_ID_PRO_YEARLY,
    },
    business: {
      monthly: env.STRIPE_PRICE_ID_BUSINESS_MONTHLY,
      yearly: env.STRIPE_PRICE_ID_BUSINESS_YEARLY,
    },
  };
  return map[planKey]?.[interval] || env.STRIPE_PRICE_ID_PRO_MONTHLY || null;
}

router.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const stripe = getStripeClient();
    const { planKey = 'pro', interval = 'monthly' } = req.body;
    const userId = req.userId!;

    const selectedPriceId = resolvePriceId(planKey, interval);

    if (!selectedPriceId) {
      return res.status(400).json({ success: false, error: 'No price ID configured for this plan' });
    }

    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { workspace: true },
    });

    if (!membership?.workspace) {
      return res.status(400).json({ success: false, error: 'No workspace found' });
    }

    const existingBillingCustomer = await prisma.billingCustomer.findUnique({
      where: { userId },
    });

    let stripeCustomerId = existingBillingCustomer?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.body.email || undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await prisma.billingCustomer.create({
        data: {
          userId,
          workspaceId: membership.workspace.id,
          stripeCustomerId,
          billingEmail: req.body.email || null,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      success_url: `${env.WEB_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.WEB_APP_URL}/checkout/cancelled`,
      metadata: { userId, planKey, interval },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout';
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/portal', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const stripe = getStripeClient();

    const customer = await prisma.billingCustomer.findUnique({
      where: { userId: req.userId! },
    });

    if (!customer?.stripeCustomerId) {
      return res.status(404).json({ success: false, error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${env.WEB_APP_URL}/settings/billing`,
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error: unknown) {
    console.error('Portal error:', error);
    res.status(500).json({ success: false, error: 'Failed to create portal session' });
  }
});

router.get('/subscription', requireAuth, async (req: AuthenticatedRequest, res) => {
  const membership = await prisma.membership.findFirst({
    where: { userId: req.userId! },
    include: { workspace: { include: { subscription: true } } },
  });

  if (!membership?.workspace?.subscription) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: membership.workspace.subscription });
});

export { router as billingRoutes };
