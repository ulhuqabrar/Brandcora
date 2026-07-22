# Stripe Payments Setup

## Overview

Stripe handles subscription payments, checkout, and billing.

## Configuration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Create products and prices in the Stripe dashboard

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_ID_STARTER_MONTHLY=price_...
STRIPE_PRICE_ID_STARTER_YEARLY=price_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_PRICE_ID_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_ID_BUSINESS_YEARLY=price_...
```

## Test Mode

Use `sk_test_...` keys for development. Switch to `sk_live_...` for production.

## Creating Products

1. Go to https://dashboard.stripe.com
2. Create a new product
3. Add prices (monthly and/or yearly)
4. Copy the price IDs to `.env`

## Webhook Setup

1. In the Stripe dashboard, go to Developers > Webhooks
2. Add a new endpoint:
   - URL: `https://your-api.com/api/v1/webhooks/stripe`
   - Events: Select all subscription and checkout events
3. Copy the webhook signing secret to `.env`

### Required Events

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Checkout Flow

1. Frontend calls `/api/v1/billing/checkout` with price ID
2. Backend creates a Stripe checkout session
3. User is redirected to Stripe's hosted checkout page
4. After payment, Stripe redirects to success/cancel URL
5. Stripe sends webhook events to update subscription status

## Customer Portal

1. Frontend calls `/api/v1/billing/portal`
2. Backend creates a Stripe customer portal session
3. User is redirected to manage their subscription

## Webhook Events

The application handles these events:

- `checkout.session.completed` - Checkout finished
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment received
- `invoice.payment_failed` - Payment failed

## Idempotent Processing

Webhook events are deduplicated using the `webhook_events` table. Duplicate events are silently ignored.

## Testing

1. Use Stripe's test cards in test mode
2. Test card: `4242 4242 4242 4242`
3. Test various scenarios: successful payment, failed payment, cancellation

## Local Development

For local development, you can use the Stripe CLI:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
```

This will forward webhook events to your local server.
