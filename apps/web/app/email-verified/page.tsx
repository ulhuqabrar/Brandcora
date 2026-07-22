'use client';

import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EmailVerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" weight="fill" />
          </div>
          <h2 className="text-lg font-semibold">Email verified!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Your email has been verified. You can now use all features.
          </p>
          <Link href="/dashboard" className="mt-4 block">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
