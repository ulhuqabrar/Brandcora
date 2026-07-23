'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type SocialProvider = 'github' | 'google' | 'apple';

interface AuthContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInSocial: (provider: SocialProvider, callbackURL?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isAuthenticated = Boolean(session?.user);

  async function signIn(email: string, password: string) {
    const { error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  async function signUp(name: string, email: string, password: string) {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    if (error) {
      throw new Error(error.message || 'Sign up failed');
    }
  }

  async function signInSocial(provider: SocialProvider, callbackURL = '/auth/complete') {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL: '/login?error=google_auth_failed',
    });
    if (error) {
      throw new Error(error.message || 'Social sign-in failed');
    }
  }

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace('/login');
          router.refresh();
        },
      },
    });
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading: isPending,
        isAuthenticated,
        signIn,
        signUp,
        signInSocial,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
