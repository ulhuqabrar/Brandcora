'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthPage() {
  const { isAuthenticated, isLoading, signIn, signUp, signInSocial } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  }

  function toggleMode(newMode: 'signin' | 'signup') {
    if (mode === newMode) return;
    resetForm();
    setMode(newMode);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : mode === 'signin' ? 'Sign in failed' : 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 gradient-hero">
      <div className="w-full max-w-sm">
        <div className="glass-strong rounded-2xl p-8 shadow-elevated">
          <div className="text-center mb-6">
            <Link href="/" className="flex justify-center">
              <img src="/logo.png" alt="Brandcora" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Toggle — Sign Up on left, Sign In on right */}
          <div className="flex rounded-full bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => toggleMode('signup')}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => toggleMode('signin')}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-300 ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form container with transition */}
          <div className="relative overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-300 ease-in-out ${
                mode === 'signin'
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-0 opacity-100'
              }`}
            >
              {mode === 'signin' ? (
                <div className="animate-fade-slide-in">
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-semibold text-foreground">Sign in to your account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-medium mb-4">{error}</div>
                  )}

                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder="johndoe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white"
                    />

                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Enter 8+ character password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white"
                      />
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full gradient-accent text-white shadow-glass" disabled={submitting || isLoading}>
                      {submitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-slide-in">
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Get started with your free account</p>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-medium mb-4">{error}</div>
                  )}

                  <div className="space-y-4">
                    <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white" />
                    <Input type="email" placeholder="johndoe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white" />
                    <Input type="password" placeholder="8+ chars, A-Z, a-z, 0-9" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white" />
                    <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-white" />

                    <Button type="submit" className="w-full gradient-accent text-white shadow-glass" disabled={submitting || isLoading}>
                      {submitting ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

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
              setError('');
              try {
                await signInSocial('google', '/auth/complete');
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Google sign-in could not be started.');
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
  );
}
