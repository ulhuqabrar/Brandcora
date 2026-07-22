import { Link } from 'react-router-dom';
import { Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <Warning className="h-8 w-8 text-red-600" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <Link to="/dashboard" className="mt-6 block">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
