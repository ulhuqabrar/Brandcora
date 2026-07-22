import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from '@phosphor-icons/react';

export function BillingSettingsPage() {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/billing/portal');
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your billing and subscription.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment method and billing history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" weight="bold" />
            </div>
            <h3 className="text-lg font-medium">Manage billing</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Open the Stripe customer portal to manage your payment method and invoices.
            </p>
            <Button className="mt-4" onClick={handleManageBilling} disabled={loading}>
              {loading ? 'Opening...' : 'Manage billing'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
