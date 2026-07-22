'use client';

import Link from 'next/link';
import { Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckoutCancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-6">
            <Warning className="h-8 w-8 text-yellow-600" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold">Checkout cancelled</h1>
          <p className="mt-2 text-muted-foreground">
            Your payment was not processed. You can try again anytime.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/pricing">
              <Button className="w-full">View plans</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Go to dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
