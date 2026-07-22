'use client';

import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold">Payment successful!</h1>
          <p className="mt-2 text-muted-foreground">
            Your subscription has been activated. Thank you for your purchase.
          </p>
          <Link href="/dashboard" className="mt-6 block">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
