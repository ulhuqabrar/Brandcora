'use client';

import { useState } from 'react';
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
  Copy,
  Download,
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  Warning,
  PencilSimple,
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

const TOKENS = [
  { category: 'Colors', tokens: [
    { name: 'brand.primary', value: '#FF5F45', preview: '#FF5F45', type: 'color', status: 'approved', usage: 24 },
    { name: 'brand.secondary', value: '#FF8A5B', preview: '#FF8A5B', type: 'color', status: 'approved', usage: 18 },
    { name: 'brand.accent', value: '#F2B84B', preview: '#F2B84B', type: 'color', status: 'approved', usage: 12 },
    { name: 'neutral.900', value: '#1A1918', preview: '#1A1918', type: 'color', status: 'approved', usage: 31 },
    { name: 'neutral.50', value: '#FAFAF9', preview: '#FAFAF9', type: 'color', status: 'approved', usage: 28 },
  ]},
  { category: 'Typography', tokens: [
    { name: 'font.heading', value: 'Manrope', preview: '', type: 'font', status: 'approved', usage: 32 },
    { name: 'font.mono', value: 'IBM Plex Mono', preview: '', type: 'font', status: 'approved', usage: 18 },
    { name: 'font.body', value: 'Inter', preview: '', type: 'font', status: 'approved', usage: 45 },
  ]},
  { category: 'Spacing', tokens: [
    { name: 'spacing.1', value: '4px', preview: '', type: 'spacing', status: 'approved', usage: 42 },
    { name: 'spacing.2', value: '8px', preview: '', type: 'spacing', status: 'approved', usage: 38 },
    { name: 'spacing.3', value: '12px', preview: '', type: 'spacing', status: 'approved', usage: 28 },
    { name: 'spacing.4', value: '16px', preview: '', type: 'spacing', status: 'approved', usage: 35 },
    { name: 'spacing.6', value: '24px', preview: '', type: 'spacing', status: 'approved', usage: 22 },
  ]},
  { category: 'Radius', tokens: [
    { name: 'radius.sm', value: '4px', preview: '', type: 'radius', status: 'approved', usage: 15 },
    { name: 'radius.md', value: '8px', preview: '', type: 'radius', status: 'approved', usage: 24 },
    { name: 'radius.lg', value: '12px', preview: '', type: 'radius', status: 'approved', usage: 18 },
    { name: 'radius.xl', value: '16px', preview: '', type: 'radius', status: 'review', usage: 8 },
  ]},
];

export default function TokensPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const isActive = (to: string) => to === '/brand' ? pathname === '/brand' : pathname.startsWith(to);

  const allTokens = TOKENS.flatMap(c => c.tokens);
  const filtered = allTokens.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && t.type !== filter) return false;
    return true;
  });

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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Design Tokens</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{allTokens.length} tokens across {TOKENS.length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-[12px]">
            <Copy className="h-3.5 w-3.5" weight="bold" /> Copy all
          </button>
          <button className="btn-secondary text-[12px]">
            <Download className="h-3.5 w-3.5" weight="bold" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[280px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C4C4BF]" weight="bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="input-compact pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {['color', 'font', 'spacing', 'radius'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? null : type)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors',
                filter === type
                  ? 'bg-[#1A1918] text-white'
                  : 'bg-[#F5F5F3] text-[#6B6B66] hover:bg-[#ECECEA]'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Token Table */}
      <div className="dash-card p-0 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Type</th>
              <th>Status</th>
              <th>Usage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((token) => (
              <tr key={token.name}>
                <td>
                  <span className="font-mono text-[12px] text-[#1A1918]">{token.name}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {token.preview && (
                      <div className="w-4 h-4 rounded border border-[#E8E8E6]" style={{ backgroundColor: token.preview }} />
                    )}
                    <span className="font-mono text-[12px] text-[#3D3D3A]">{token.value}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[11px] font-medium text-[#8A8A85] uppercase">{token.type}</span>
                </td>
                <td>
                  {token.status === 'approved' ? (
                    <span className="status-badge active text-[10px]">
                      <CheckCircle className="h-3 w-3" weight="bold" /> Approved
                    </span>
                  ) : (
                    <span className="status-badge pending text-[10px]">
                      <Warning className="h-3 w-3" weight="bold" /> Review
                    </span>
                  )}
                </td>
                <td>
                  <span className="text-[12px] text-[#8A8A85]">{token.usage}×</span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-[#F5F5F3] rounded" title="Copy">
                      <Copy className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                    </button>
                    <button className="p-1 hover:bg-[#F5F5F3] rounded" title="Edit">
                      <PencilSimple className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
