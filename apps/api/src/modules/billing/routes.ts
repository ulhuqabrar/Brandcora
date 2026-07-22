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

router.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const stripe = getStripeClient();
    const { priceId, interval } = req.body;

    // Get or create Stripe customer
    let customer: Stripe.Customer;

    const existingCustomer = await prisma.billingCustomer.findUnique({
      where: { userId: req.userId! },
    });

    if (existingCustomer?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingCustomer.stripeCustomerId) as Stripe.Customer;
    } else {
      const user = await prisma.user.findUnique({ where: { id: req.userId! } });
      customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId: req.userId! },
      });

      await prisma.billingCustomer.create({
        data: {
          userId: req.userId!,
          stripeCustomerId: customer.id,
          billingEmail: user?.email,
        },
      });
    }

    // Determine the price ID based on interval
    let selectedPriceId = priceId;
    if (!selectedPriceId && interval) {
      if (interval === 'monthly') {
        selectedPriceId = env.STRIPE_PRICE_ID_PRO_MONTHLY;
      } else {
        selectedPriceId = env.STRIPE_PRICE_ID_PRO_YEARLY;
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: selectedPriceId!, quantity: 1 }],
      success_url: `${env.WEB_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.WEB_APP_URL}/checkout/cancelled`,
      metadata: { userId: req.userId! },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, error: 'Failed to create checkout' });
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
  } catch (error: any) {
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
