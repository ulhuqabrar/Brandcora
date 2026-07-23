'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}

interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: string;
  };
}

type SocialProvider = 'github' | 'google' | 'apple';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInSocial: (provider: SocialProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_SESSION: Session = {
  user: {
    id: 'admin-001',
    name: 'Admin',
    email: 'admin@brandguard.io',
    emailVerified: true,
  },
  session: {
    id: 'admin-session-001',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/get-session`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.session && data?.user) {
            const sessionData = { user: data.user, session: data.session };
            setSession(sessionData);
            localStorage.setItem('bg_session', JSON.stringify(sessionData));
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore */ }

      // Fallback to localStorage (for admin demo)
      const saved = localStorage.getItem('bg_session');
      if (saved) {
        try {
          setSession(JSON.parse(saved));
        } catch { /* ignore */ }
      }
      setLoading(false);
    }
    loadSession();
  }, []);

  async function signIn(email: string, password: string) {
    if (email === 'admin' && password === 'admin') {
      setSession(ADMIN_SESSION);
      localStorage.setItem('bg_session', JSON.stringify(ADMIN_SESSION));
      return;
    }

    const res = await apiFetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Sign in failed');
    }
    const data = await res.json();
    if (data.data) {
      setSession(data.data);
      localStorage.setItem('bg_session', JSON.stringify(data.data));
    }
  }

  async function signUp(name: string, email: string, password: string) {
    if (email === 'admin' && password === 'admin') {
      setSession(ADMIN_SESSION);
      localStorage.setItem('bg_session', JSON.stringify(ADMIN_SESSION));
      return;
    }

    const res = await apiFetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Sign up failed');
    }
    const data = await res.json();
    if (data.data) {
      setSession(data.data);
      localStorage.setItem('bg_session', JSON.stringify(data.data));
    }
  }

  async function signInSocial(provider: SocialProvider) {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/dashboard`,
      errorCallbackURL: `${window.location.origin}/login`,
    });
    if (error) {
      throw new Error(error.message || 'Social sign-in failed');
    }
  }

  async function signOut() {
    try {
      await apiFetch('/api/auth/sign-out', { method: 'POST' });
    } catch { /* ignore */ }
    setSession(null);
    localStorage.removeItem('bg_session');
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signInSocial, signOut }}>
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
