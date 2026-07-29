'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlass,
  Plus,
} from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';
import { BrandProfileProvider } from '@/lib/brand-profile-context';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrandProfileProvider>
      <div className="space-y-6">
      {/* Greeting - constant across all tabs */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1918] tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-[#8A8A85] mt-1">
            Your brand identity is active and ready for creative checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/brand/scan" className="btn-primary">
            <MagnifyingGlass className="h-4 w-4" weight="bold" />
            Rescan
          </Link>
          <Link href="/scans/new" className="btn-secondary">
            <Plus className="h-4 w-4" weight="bold" />
            New report
          </Link>
        </div>
      </div>

      {/* Navigation tabs - constant across all tabs */}
      <BrandSubNav />

      {/* Page content - changes based on active tab */}
      {children}
    </div>
    </BrandProfileProvider>
  );
}
