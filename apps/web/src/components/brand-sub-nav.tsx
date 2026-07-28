'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Fingerprint,
  MagnifyingGlass,
  Palette,
  TextAa,
  CirclesFour,
  Ruler,
  Stack,
  ListChecks,
  GitBranch,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const brandNav = [
  { to: '/dashboard', label: 'Overview', icon: Fingerprint, exact: true },
  { to: '/brand/scan', label: 'Scan', icon: MagnifyingGlass },
  { to: '/brand/colors', label: 'Colors', icon: Palette },
  { to: '/brand/typography', label: 'Typography', icon: TextAa },
  { to: '/brand/assets', label: 'Assets', icon: CirclesFour },
  { to: '/brand/layout', label: 'Layout', icon: Ruler },
  { to: '/brand/components', label: 'Components', icon: Stack },
  { to: '/brand/tokens', label: 'Tokens', icon: ListChecks },
  { to: '/brand/versions', label: 'Versions', icon: GitBranch },
];

export function BrandSubNav() {
  const pathname = usePathname();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return pathname === to;
    return pathname.startsWith(to);
  };

  return (
    <div className="sub-nav overflow-x-auto">
      {brandNav.map((item) => (
        <Link
          key={item.to}
          href={item.to}
          className={cn('sub-nav-item', isActive(item.to, item.exact) && 'active')}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
