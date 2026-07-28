'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const { isAuthenticated, isLoading, signIn, signUp, signInSocial } = useAuth();
  const router = useRouter();

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSubmitting, setSignUpSubmitting] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInSubmitting, setSignInSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSignUpError('');
    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Passwords do not match');
      return;
    }
    setSignUpSubmitting(true);
    try {
      await signUp(signUpName, signUpEmail, signUpPassword);
    } catch (err: unknown) {
      setSignUpError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setSignUpSubmitting(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError('');
    setSignInSubmitting(true);
    try {
      await signIn(signInEmail, signInPassword);
    } catch (err: unknown) {
      setSignInError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSignInSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 gradient-hero">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="flex justify-center">
            <img src="/logo.png" alt="Brandcora" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ─── Sign Up (Left) ─── */}
          <div className="glass-strong rounded-2xl p-8 shadow-elevated">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Get started with your free account</p>
            </div>

            {signUpError && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-medium mb-4">{signUpError}</div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input id="signup-name" type="text" placeholder="Your name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" placeholder="Create a password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input id="signup-confirm" type="password" placeholder="Repeat your password" value={signUpConfirm} onChange={(e) => setSignUpConfirm(e.target.value)} required className="bg-white" />
              </div>

              <Button type="submit" className="w-full gradient-accent text-white shadow-glass" disabled={signUpSubmitting || isLoading}>
                {signUpSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              disabled={isLoading}
              onClick={async () => {
                setSignUpError('');
                try {
                  await signInSocial('google', '/auth/complete');
                } catch (err: unknown) {
                  setSignUpError(err instanceof Error ? err.message : 'Google sign-in could not be started.');
                }
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              No credit card required. 5 free campaigns per month.
            </p>
          </div>

          {/* ─── Sign In (Right) ─── */}
          <div className="glass-strong rounded-2xl p-8 shadow-elevated">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-foreground">Sign in to your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>
            </div>

            {signInError && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-medium mb-4">{signInError}</div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <Button type="submit" className="w-full gradient-accent text-white shadow-glass" disabled={signInSubmitting || isLoading}>
                {signInSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              disabled={isLoading}
              onClick={async () => {
                setSignInError('');
                try {
                  await signInSocial('google', '/auth/complete');
                } catch (err: unknown) {
                  setSignInError(err instanceof Error ? err.message : 'Google sign-in could not be started.');
                }
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              No credit card required. 5 free campaigns per month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
