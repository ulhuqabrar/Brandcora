'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Fingerprint,
  Palette,
  TextAa,
  CirclesFour,
  Ruler,
  Stack,
  ListChecks,
  GitBranch,
  Download,
  PencilSimple,
  Plus,
  Eye,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const subNav = [
  { to: '/brand', label: 'Overview', icon: Fingerprint },
  { to: '/brand/colors', label: 'Colors', icon: Palette },
  { to: '/brand/typography', label: 'Typography', icon: TextAa },
  { to: '/brand/assets', label: 'Assets', icon: CirclesFour },
  { to: '/brand/layout', label: 'Layout', icon: Ruler },
  { to: '/brand/components', label: 'Components', icon: Stack },
  { to: '/brand/tokens', label: 'Tokens', icon: ListChecks },
  { to: '/brand/versions', label: 'Versions', icon: GitBranch },
];

const ASSETS = [
  { name: 'Primary mark', type: 'SVG', size: '—', pages: 12, bg: 'white' },
  { name: 'Wordmark dark', type: 'SVG', size: '—', pages: 8, bg: '#1A1918' },
  { name: 'Wordmark light', type: 'SVG', size: '—', pages: 3, bg: '#FAFAF9' },
  { name: 'Icon only', type: 'PNG', size: '240×240', pages: 15, bg: 'white' },
  { name: 'Favicon', type: 'ICO', size: '32×32', pages: 18, bg: '#F5F5F3' },
  { name: 'App icon', type: 'PNG', size: '1024×1024', pages: 0, bg: '#F5F5F3' },
];

export default function AssetsPage() {
  const pathname = usePathname();
  const isActive = (to: string) => to === '/brand' ? pathname === '/brand' : pathname.startsWith(to);

  return (
    <div className="space-y-5">
      <div className="sub-nav overflow-x-auto">
        {subNav.map((item) => (
          <Link key={item.to} href={item.to} className={cn('sub-nav-item', isActive(item.to) && 'active')}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Assets</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{ASSETS.length} logo and icon variants</p>
        </div>
        <button className="btn-primary text-[12px]">
          <Plus className="h-3.5 w-3.5" weight="bold" /> Upload asset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {ASSETS.map((asset, i) => (
          <div key={i} className="dash-card">
            <div
              className="h-32 rounded-lg mb-3 flex items-center justify-center"
              style={{ backgroundColor: asset.bg }}
            >
              <CirclesFour className="h-10 w-10 text-[#C4C4BF]" weight="bold" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">{asset.name}</div>
                <div className="text-[11px] text-[#8A8A85]">{asset.type} · {asset.size}</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#C4C4BF]">{asset.pages}p</span>
                <button className="p-1 hover:bg-[#F5F5F3] rounded" title="View">
                  <Eye className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                </button>
                <button className="p-1 hover:bg-[#F5F5F3] rounded" title="Download">
                  <Download className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
