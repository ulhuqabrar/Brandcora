'use client';

import Link from 'next/link';
import {
  Palette,
  TextAa,
  CirclesFour,
  Ruler,
  Stack,
  CheckCircle,
  Warning,
  ArrowRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const BRAND = {
  name: 'seocontent.ai',
  url: 'seocontent.ai',
  status: 'active',
  version: 2,
  lastScan: '2 hours ago',
  approvalState: 'approved',
  completeness: {
    logo: 'complete',
    colors: 'complete',
    typography: 'complete',
    icons: 'complete',
    spacing: 'complete',
    radius: 'complete',
    components: 'review',
  },
};

const COLORS = [
  { name: 'Primary', hex: '#FF5F45', token: 'brand.primary', usage: 24 },
  { name: 'Secondary', hex: '#FF8A5B', token: 'brand.secondary', usage: 18 },
  { name: 'Accent', hex: '#F2B84B', token: 'brand.accent', usage: 12 },
  { name: 'Dark', hex: '#1A1918', token: 'neutral.900', usage: 31 },
  { name: 'Light', hex: '#FAFAF9', token: 'neutral.50', usage: 28 },
];

const FONTS = [
  { name: 'Manrope', role: 'Headings', weight: '700', sample: 'Brand Identity' },
  { name: 'IBM Plex Mono', role: 'Code', weight: '400', sample: 'token-value' },
  { name: 'Inter', role: 'Body', weight: '400', sample: 'The quick brown fox' },
];

const LOGOS = [
  { name: 'Primary mark', type: 'SVG', size: '—', pages: 12 },
  { name: 'Wordmark dark', type: 'SVG', size: '—', pages: 8 },
  { name: 'Icon only', type: 'PNG', size: '240×240', pages: 15 },
];

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64];
const RADIUS = [
  { label: 'sm', value: '4px' },
  { label: 'md', value: '8px' },
  { label: 'lg', value: '12px' },
  { label: 'xl', value: '16px' },
];

const COMPONENTS = [
  { name: 'Primary button', usage: 18 },
  { name: 'Secondary button', usage: 12 },
  { name: 'Input field', usage: 8 },
  { name: 'Card', usage: 15 },
  { name: 'Badge', usage: 6 },
];

export default function BrandIdentityOverview() {
  const completedCount = Object.values(BRAND.completeness).filter(v => v === 'complete').length;
  const totalCount = Object.keys(BRAND.completeness).length;

  return (
    <div className="space-y-6">
      {/* Top Row: Brand Profile / Scan Status / Identity Completeness */}
      <div className="grid grid-cols-12 gap-4">
        {/* Brand Profile (5 cols) */}
        <div className="col-span-5 dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Brand profile</div>
            <Link href="/brand" className="btn-ghost text-[12px]">
              Edit <ArrowRight className="h-3 w-3" weight="bold" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Brand</span>
              <span className="text-[13px] font-semibold text-[#1A1918]">{BRAND.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Website</span>
              <span className="text-[13px] font-mono text-[#3D3D3A]">{BRAND.url}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Status</span>
              <span className="status-badge active">
                <span className="status-dot active" />
                Approved
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Version</span>
              <span className="text-[13px] font-semibold text-[#1A1918]">v{BRAND.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Last scan</span>
              <span className="text-[13px] text-[#3D3D3A]">{BRAND.lastScan}</span>
            </div>
          </div>
        </div>

        {/* Scan Status (3 cols) */}
        <div className="col-span-3 dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Scan status</div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#8A8A85]">Scans this month</span>
                <span className="text-[13px] font-semibold text-[#1A1918]">12 / 50</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '24%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#8A8A85]">Exports</span>
                <span className="text-[13px] font-semibold text-[#1A1918]">3 / 10</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '30%' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle className="h-4 w-4 text-[#16A34A]" weight="bold" />
              <span className="text-[12px] text-[#16A34A] font-medium">All up to date</span>
            </div>
          </div>
        </div>

        {/* Identity Completeness (4 cols) */}
        <div className="col-span-4 dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Identity completeness</div>
            <span className="text-[12px] font-semibold text-[#3D3D3A]">{completedCount}/{totalCount}</span>
          </div>
          <div className="space-y-0">
            {Object.entries(BRAND.completeness).map(([key, value]) => (
              <div key={key} className="completeness-row">
                <span className="completeness-label capitalize">{key}</span>
                <span className={cn('completeness-status', value)}>
                  {value === 'complete' ? (
                    <><CheckCircle className="h-3.5 w-3.5" weight="bold" /> Complete</>
                  ) : (
                    <><Warning className="h-3.5 w-3.5" weight="bold" /> Review</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Colors / Typography */}
      <div className="grid grid-cols-12 gap-4">
        {/* Colors & Gradients (6 cols) */}
        <div className="col-span-6 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FF5F45]/10 flex items-center justify-center">
                <Palette className="h-4 w-4 text-[#FF5F45]" weight="bold" />
              </div>
              <div className="dash-card-title">Colors &amp; gradients</div>
            </div>
            <Link href="/brand/colors" className="btn-ghost text-[12px]">
              View all <ArrowRight className="h-3 w-3" weight="bold" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {COLORS.map((c) => (
              <div key={c.hex} className="color-swatch">
                <div className="color-swatch-preview" style={{ backgroundColor: c.hex }} />
                <div className="color-swatch-info">
                  <div className="color-swatch-name">{c.name}</div>
                  <div className="color-swatch-hex">{c.hex}</div>
                </div>
                <span className="text-[11px] font-mono text-[#8A8A85]">{c.token}</span>
                <span className="text-[11px] text-[#C4C4BF]">{c.usage}×</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider mb-2">Gradient</div>
            <div className="h-8 rounded-lg bg-gradient-to-r from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B]" />
          </div>
        </div>

        {/* Typography (6 cols) */}
        <div className="col-span-6 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FF8A5B]/10 flex items-center justify-center">
                <TextAa className="h-4 w-4 text-[#FF8A5B]" weight="bold" />
              </div>
              <div className="dash-card-title">Typography</div>
            </div>
            <Link href="/brand/typography" className="btn-ghost text-[12px]">
              View all <ArrowRight className="h-3 w-3" weight="bold" />
            </Link>
          </div>
          <div className="space-y-2">
            {FONTS.map((f) => (
              <div key={f.name} className="type-specimen">
                <div className="flex items-center justify-between mb-1">
                  <span className="type-specimen-name">{f.name}</span>
                  <span className="text-[11px] text-[#8A8A85]">{f.role}</span>
                </div>
                <div className="type-specimen-sample" style={{ fontFamily: f.name }}>
                  {f.sample}
                </div>
                <div className="type-specimen-meta">Weight {f.weight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Logos / Spacing / Components */}
      <div className="grid grid-cols-12 gap-4">
        {/* Logos & Assets (4 cols) */}
        <div className="col-span-4 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#F2B84B]/10 flex items-center justify-center">
                <CirclesFour className="h-4 w-4 text-[#F2B84B]" weight="bold" />
              </div>
              <div className="dash-card-title">Logos &amp; assets</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {LOGOS.map((l, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-[#F0F0EE]">
                <div className="w-9 h-9 rounded-md bg-[#F5F5F3] flex items-center justify-center">
                  <CirclesFour className="h-4 w-4 text-[#8A8A85]" weight="bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[#3D3D3A] truncate">{l.name}</div>
                  <div className="text-[11px] text-[#8A8A85]">{l.type} · {l.size}</div>
                </div>
                <span className="text-[11px] text-[#C4C4BF]">{l.pages}p</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacing & Radius (4 cols) */}
        <div className="col-span-4 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#1A1918]/10 flex items-center justify-center">
                <Ruler className="h-4 w-4 text-[#1A1918]" weight="bold" />
              </div>
              <div className="dash-card-title">Spacing &amp; radius</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider mb-2">Spacing</div>
              <div className="space-y-1.5">
                {SPACING.map((px) => (
                  <div key={px} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#8A8A85] w-7">{px}</span>
                    <div className="spacing-bar" style={{ width: `${Math.min(px * 2.5, 120)}px` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#F5F5F3] pt-3">
              <div className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider mb-2">Radius</div>
              <div className="flex gap-3">
                {RADIUS.map((r) => (
                  <div key={r.label} className="flex flex-col items-center gap-1.5">
                    <div className="radius-box" style={{ borderRadius: r.value }} />
                    <span className="text-[10px] font-mono text-[#8A8A85]">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Components (4 cols) */}
        <div className="col-span-4 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FF5F45]/10 flex items-center justify-center">
                <Stack className="h-4 w-4 text-[#FF5F45]" weight="bold" />
              </div>
              <div className="dash-card-title">Components</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {COMPONENTS.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-2 rounded-lg border border-[#F0F0EE]">
                <span className="text-[12px] font-medium text-[#3D3D3A]">{c.name}</span>
                <span className="text-[11px] text-[#8A8A85]">{c.usage}×</span>
              </div>
            ))}
          </div>
          <Link href="/brand/components" className="btn-ghost text-[12px] w-full mt-3 justify-center">
            View all components <ArrowRight className="h-3 w-3" weight="bold" />
          </Link>
        </div>
      </div>


    </div>
  );
}
