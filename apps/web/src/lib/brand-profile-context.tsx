'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

export interface BrandProfileData {
  id: string;
  name: string;
  description: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  buttonRadius: number;
  borderRadius: number;
  spacingPreference: string | null;
  colors: Array<{ id: string; name: string; hexValue: string; role: string }>;
  fonts: Array<{ id: string; name: string; family: string; role: string; weight: number }>;
  logos: Array<{ id: string; fileUrl: string; storageKey: string; logoType: string; backgroundType: string; width: number | null; height: number | null }>;
  gradients: Array<{ id: string; name: string; role: string; gradientType: string; repeating: boolean; originalValue: string; normalizedValue: string; angle: number | null; shape: string | null; position: string | null; stops: any; usageCount: number; pageCount: number; sourceType: string; cssVariableName: string | null; confidence: number; isApproved: boolean }>;
  rules: Array<{ id: string; category: string; name: string; value: string }>;
}

interface BrandProfileContextValue {
  profile: BrandProfileData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const BrandProfileContext = createContext<BrandProfileContextValue>({
  profile: null,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function useBrandProfile() {
  return useContext(BrandProfileContext);
}

export function BrandProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/api/v1/brand-profile');
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load brand profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Listen for custom event to refresh profile
  useEffect(() => {
    const handleRefresh = () => fetchProfile();
    window.addEventListener('brand-profile-refresh', handleRefresh);
    return () => window.removeEventListener('brand-profile-refresh', handleRefresh);
  }, [fetchProfile]);

  return (
    <BrandProfileContext.Provider value={{ profile, loading, error, refresh: fetchProfile }}>
      {children}
    </BrandProfileContext.Provider>
  );
}
