'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import {
  CreditCard,
  Receipt,
  ArrowRight,
  CheckCircle,
  Warning,
  Calendar,
  TrendUp,
  Sparkle,
  Buildings,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Subscription {
  planKey: string;
  status: string;
  billingInterval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 brand profile', '3 social checks/month', '1 website scan/month', 'Basic scores'],
    icon: Sparkle,
    color: 'text-gray-500',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$5',
    period: '/month',
    features: ['Unlimited brand profiles', 'Unlimited social checks', 'Unlimited website scans', 'Full reports', 'Priority support'],
    icon: Sparkle,
    color: 'text-primary',
    popular: true,
  },
];

export default function BillingSettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const res = await apiFetch('/api/v1/billing/subscription');
      const data = await res.json();
      if (data.success) {
        setSubscription(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await apiFetch('/api/v1/billing/portal');
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleCheckout(planKey: string) {
    setCheckoutLoading(planKey);
    try {
      const res = await apiFetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, interval: 'monthly' }),
      });
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setCheckoutLoading(null);
    }
  }

  const currentPlan = plans.find((p) => p.key === (subscription?.planKey || 'free'));
  const isTrialing = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan, payment method, and billing history.</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" weight="bold" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading subscription...
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{currentPlan?.name || 'Free'}</span>
                  {isTrialing && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      Trial
                    </span>
                  )}
                  {isActive && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  )}
                  {isPastDue && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                      Past Due
                    </span>
                  )}
                  {isCanceled && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      Canceled
                    </span>
                  )}
                </div>
                {subscription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    {subscription.cancelAtPeriodEnd && ' (cancels at period end)'}
                  </p>
                )}
                {!subscription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    You are on the free plan. Upgrade for more features.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {subscription && (
                  <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
                    {portalLoading ? 'Opening...' : 'Manage billing'}
                  </Button>
                )}
                {!subscription && (
                  <Button onClick={() => handleCheckout('pro')}>
                    Upgrade to Pro
                    <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan?.key === plan.key;
            return (
              <Card
                key={plan.key}
                className={cn(
                  "relative",
                  isCurrentPlan && "border-primary ring-1 ring-primary"
                )}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                    Current Plan
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", plan.color)} weight="bold" />
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" weight="fill" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!isCurrentPlan && plan.key !== 'free' && (
                    <Button
                      variant={plan.key === 'pro' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleCheckout(plan.key)}
                      disabled={checkoutLoading === plan.key}
                    >
                      {checkoutLoading === plan.key ? 'Loading...' : 'Get started'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" weight="bold" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your payment method and view invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="flex items-center justify-between max-w-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground" weight="bold" />
                </div>
                <div>
                  <p className="text-sm font-medium">•••• •••• •••• ••••</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleManageBilling}>
                Update
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No payment method on file. Upgrade to a paid plan to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" weight="bold" />
            Invoices
          </CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Pro Plan - Monthly</p>
                  <p className="text-xs text-muted-foreground">July 1, 2026</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">$79.00</span>
                  <Button variant="ghost" size="sm">
                    <Receipt className="h-4 w-4" weight="bold" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
