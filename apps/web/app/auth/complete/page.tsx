'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@phosphor-icons/react';

export default function AuthCompletePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      router.replace('/dashboard');
      router.refresh();
      return;
    }

    router.replace('/login?error=session_not_created');
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero">
      <div className="text-center">
        <Spinner className="h-8 w-8 animate-spin text-primary mx-auto" weight="bold" />
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
