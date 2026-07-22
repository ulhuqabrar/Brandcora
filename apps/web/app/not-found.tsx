'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="mt-4 text-lg">Page not found</p>
          <p className="mt-2 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" className="mt-6 block">
            <Button className="w-full">Go home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
