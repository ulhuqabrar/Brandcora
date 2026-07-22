import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '@saas/database';
import { getServerEnv } from '@saas/config';

const router = Router();
const env = getServerEnv();

router.post('/stripe', async (req, res) => {
  const stripe = getStripeClient();
  const sig = req.headers['stripe-signature'] as string;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // We need the raw body for signature verification
    const rawBody = (req as any).rawBody;
    event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Idempotent processing
  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider: 'stripe',
        externalEventId: event.id,
      },
    },
  });

  if (existing && existing.status === 'processed') {
    return res.status(200).json({ received: true });
  }

  // Log the event
  await prisma.webhookEvent.create({
    data: {
      provider: 'stripe',
      externalEventId: event.id,
      eventType: event.type,
      status: 'processing',
    },
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    await prisma.webhookEvent.update({
      where: {
        provider_externalEventId: {
          provider: 'stripe',
          externalEventId: event.id,
        },
      },
      data: { status: 'processed', processedAt: new Date() },
    });

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);

    await prisma.webhookEvent.update({
      where: {
        provider_externalEventId: {
          provider: 'stripe',
          externalEventId: event.id,
        },
      },
      data: { status: 'failed', failureReason: error.message },
    });

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const stripeSubscriptionId = session.subscription as string;
  if (!stripeSubscriptionId) return;

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Find workspace from user
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (!membership?.workspace) return;

  await prisma.subscription.create({
    data: {
      workspaceId: membership.workspace.id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: session.customer as string,
      stripePriceId: subscription.items.data[0]?.price.id || '',
      planKey: determinePlanKey(subscription.items.data[0]?.price.id || ''),
      status: subscription.status,
      billingInterval: subscription.items.data[0]?.plan.interval === 'year' ? 'yearly' : 'monthly',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const existing = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  const data = {
    stripePriceId: subscription.items.data[0]?.price.id || '',
    planKey: determinePlanKey(subscription.items.data[0]?.price.id || ''),
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data,
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existing = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: { status: 'canceled' },
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Update subscription status if needed
  const subscriptionId = invoice.subscription as string;
  if (subscriptionId) {
    const existing = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'active' },
      });
    }
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (subscriptionId) {
    const existing = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'past_due' },
      });
    }
  }
}

function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

function determinePlanKey(priceId: string): string {
  const env = getServerEnv();
  if (priceId === env.STRIPE_PRICE_ID_BRAND_GUARD_LITE_MONTHLY) {
    return 'brand-guard-lite';
  }
  if (
    priceId === env.STRIPE_PRICE_ID_STARTER_MONTHLY ||
    priceId === env.STRIPE_PRICE_ID_STARTER_YEARLY
  ) {
    return 'starter';
  }
  if (
    priceId === env.STRIPE_PRICE_ID_PRO_MONTHLY ||
    priceId === env.STRIPE_PRICE_ID_PRO_YEARLY
  ) {
    return 'pro';
  }
  if (
    priceId === env.STRIPE_PRICE_ID_BUSINESS_MONTHLY ||
    priceId === env.STRIPE_PRICE_ID_BUSINESS_YEARLY
  ) {
    return 'business';
  }
  return 'free';
}

export { router as webhookRoutes };
