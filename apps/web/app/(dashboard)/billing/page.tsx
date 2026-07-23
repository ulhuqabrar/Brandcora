'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Warning, CheckCircle, Lightning, Star, MagnifyingGlass } from '@phosphor-icons/react';
import { apiFetch } from '@/lib/api';

const plans = [
  { key: 'free', name: 'Free', monthlyPrice: '$0', yearlyPrice: '$0' },
  { key: 'pro', name: 'Pro', monthlyPrice: '$5', yearlyPrice: '$50' },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const res = await apiFetch('/api/v1/billing/subscription');
      const data = await res.json();
      setSubscription(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!subscription) return;
    setActionLoading(true);
    try {
      await fetch(`/api/v1/subscriptions/${subscription.workspaceId}/cancel`, {
        method: 'POST',
      });
      await fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate() {
    if (!subscription) return;
    setActionLoading(true);
    try {
      await fetch(`/api/v1/subscriptions/${subscription.workspaceId}/reactivate`, {
        method: 'POST',
      });
      await fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleManageBilling() {
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/v1/billing/portal');
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setActionLoading(false);
    }
  }

  const currentPlan = plans.find(p => p.key === subscription?.planKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan.</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      ) : subscription ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{currentPlan?.name || subscription.planKey}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                      {subscription.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {subscription.billingInterval === 'monthly' ? 'Monthly' : 'Yearly'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Current period ends
                  </p>
                  <p className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <Warning className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Your subscription will cancel at the end of the current period.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleManageBilling} disabled={actionLoading}>
                  <CreditCard className="mr-2 h-4 w-4" weight="bold" />
                  Manage billing
                </Button>
                {subscription.cancelAtPeriodEnd ? (
                  <Button onClick={handleReactivate} disabled={actionLoading}>
                    Reactivate subscription
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
                    Cancel subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Plan</CardTitle>
              <CardDescription>Upgrade or downgrade your plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.key}
                    className={`p-4 rounded-lg border ${
                      plan.key === subscription.planKey
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.monthlyPrice}/mo or {plan.yearlyPrice}/yr
                    </p>
                    {plan.key === subscription.planKey ? (
                      <Badge className="mt-2">Current plan</Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/pricing">Switch to {plan.name}</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          {/* Hero CTA */}
          <div className="glass-strong rounded-2xl p-8 shadow-glass text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Lightning className="h-4 w-4" weight="bold" />
              Limited time offer
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Unlock unlimited brand protection</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Stop guessing if your designs are on-brand. Get instant feedback, exact corrections, and a brand score for every page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                <span className="text-sm">Unlimited URL checks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                <span className="text-sm">Social media uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                <span className="text-sm">Exact corrections</span>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="lg" className="gradient-accent text-white shadow-elevated px-8">
                Upgrade to Pro — $5/month
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">7-day free trial. Cancel anytime.</p>
          </div>

          {/* Benefits */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-strong rounded-2xl p-6 shadow-glass">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <MagnifyingGlass className="h-5 w-5 text-primary" weight="bold" />
              </div>
              <h3 className="font-semibold mb-1">Catch every issue</h3>
              <p className="text-sm text-muted-foreground">Colors, fonts, logos, spacing — we check everything against your brand guide.</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 shadow-glass">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <Star className="h-5 w-5 text-primary" weight="bold" />
              </div>
              <h3 className="font-semibold mb-1">Score every page</h3>
              <p className="text-sm text-muted-foreground">Get a brand match score with weighted breakdowns across all dimensions.</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 shadow-glass">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <Lightning className="h-5 w-5 text-primary" weight="bold" />
              </div>
              <h3 className="font-semibold mb-1">Fix in seconds</h3>
              <p className="text-sm text-muted-foreground">No vague feedback — exact hex codes, font names, and values to fix.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
