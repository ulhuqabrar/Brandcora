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
  Copy,
  PencilSimple,
  ArrowRight,
  CheckCircle,
  Warning,
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

const COLORS = [
  { name: 'Primary', hex: '#FF5F45', token: 'brand.primary', usage: 24, category: 'Brand' },
  { name: 'Secondary', hex: '#FF8A5B', token: 'brand.secondary', usage: 18, category: 'Brand' },
  { name: 'Accent', hex: '#F2B84B', token: 'brand.accent', usage: 12, category: 'Brand' },
  { name: 'Success', hex: '#16A34A', token: 'semantic.success', usage: 8, category: 'Semantic' },
  { name: 'Warning', hex: '#D97706', token: 'semantic.warning', usage: 5, category: 'Semantic' },
  { name: 'Error', hex: '#DC2626', token: 'semantic.error', usage: 3, category: 'Semantic' },
  { name: 'Dark', hex: '#1A1918', token: 'neutral.900', usage: 31, category: 'Neutral' },
  { name: 'Gray 700', hex: '#3D3D3A', token: 'neutral.700', usage: 22, category: 'Neutral' },
  { name: 'Gray 500', hex: '#6B6B66', token: 'neutral.500', usage: 18, category: 'Neutral' },
  { name: 'Gray 300', hex: '#C4C4BF', token: 'neutral.300', usage: 14, category: 'Neutral' },
  { name: 'Light', hex: '#FAFAF9', token: 'neutral.50', usage: 28, category: 'Neutral' },
];

const GRADIENTS = [
  { name: 'Brand gradient', value: 'linear-gradient(135deg, #FF5F45, #FF8A5B, #F2B84B)', usage: 6 },
  { name: 'Subtle warm', value: 'linear-gradient(180deg, #FAF8F5, #F5F0EB)', usage: 3 },
];

export default function ColorsPage() {
  const pathname = usePathname();
  const isActive = (to: string) => to === '/brand' ? pathname === '/brand' : pathname.startsWith(to);

  const grouped = COLORS.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, typeof COLORS>);

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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Colors</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{COLORS.length} color tokens detected</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-[12px]">
            <Copy className="h-3.5 w-3.5" weight="bold" /> Copy CSS
          </button>
          <button className="btn-secondary text-[12px]">
            <PencilSimple className="h-3.5 w-3.5" weight="bold" /> Edit
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([category, colors]) => (
        <div key={category} className="dash-card">
          <div className="dash-card-title mb-3">{category}</div>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((c) => (
              <div key={c.hex} className="color-swatch">
                <div className="color-swatch-preview" style={{ backgroundColor: c.hex }} />
                <div className="color-swatch-info">
                  <div className="color-swatch-name">{c.name}</div>
                  <div className="color-swatch-hex">{c.hex}</div>
                </div>
                <span className="text-[11px] font-mono text-[#8A8A85]">{c.token}</span>
                <span className="text-[11px] text-[#C4C4BF]">{c.usage}×</span>
                <button className="p-1 hover:bg-[#F5F5F3] rounded" title="Copy">
                  <Copy className="h-3 w-3 text-[#C4C4BF]" weight="bold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="dash-card">
        <div className="dash-card-title mb-3">Gradients</div>
        <div className="space-y-2">
          {GRADIENTS.map((g) => (
            <div key={g.name} className="flex items-center gap-3 p-2 rounded-lg border border-[#F0F0EE]">
              <div className="w-20 h-8 rounded-md" style={{ background: g.value }} />
              <div className="flex-1">
                <div className="text-[12px] font-medium text-[#3D3D3A]">{g.name}</div>
                <div className="text-[11px] font-mono text-[#8A8A85] truncate">{g.value}</div>
              </div>
              <span className="text-[11px] text-[#C4C4BF]">{g.usage}×</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
