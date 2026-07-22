import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    description: 'For trying out Brand Guard',
    monthlyPrice: '$0',
    features: [
      '1 brand profile',
      '3 social checks/month',
      '1 website scan/month',
      'Basic scores',
    ],
  },
  {
    name: 'Pro',
    description: 'For agencies and power users',
    monthlyPrice: '$49',
    monthlyPriceId: 'price_1TvGaZEDJ4VGAa6T5qwFE7D6',
    features: [
      '1 brand profile',
      '500 social checks/month',
      '50 website scans/month',
      '10 pages per scan',
      'Full reports',
      'Downloadable reports',
      '90-day history',
      'Priority support',
    ],
    popular: true,
  },
];

export function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: typeof plans[0]) {
    if (plan.name === 'Free') {
      window.location.href = '/register';
      return;
    }

    setLoading(plan.name);
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.monthlyPriceId }),
      });
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you need more checks
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl glass shadow-glass"
            >
              <div className="rounded-xl bg-white p-6 sm:p-8 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">{plan.monthlyPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <Check className="h-3 w-3 text-accent" weight="bold" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'gradient-accent text-white shadow-glass hover:shadow-elevated'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.name}
                >
                  {loading === plan.name ? 'Redirecting...' : plan.name === 'Free' ? 'Get started' : 'Subscribe'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All paid plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}
