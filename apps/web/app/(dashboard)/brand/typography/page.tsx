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

const FONTS = [
  {
    name: 'Manrope',
    role: 'Headings',
    weights: ['400', '500', '600', '700', '800'],
    usage: 32,
    styles: [
      { label: 'H1', size: '32px', weight: '800', lineHeight: '1.1', sample: 'Brand Identity' },
      { label: 'H2', size: '24px', weight: '700', lineHeight: '1.2', sample: 'Design System' },
      { label: 'H3', size: '18px', weight: '600', lineHeight: '1.3', sample: 'Color Palette' },
    ],
  },
  {
    name: 'IBM Plex Mono',
    role: 'Code & Data',
    weights: ['400', '500', '600'],
    usage: 18,
    styles: [
      { label: 'Code', size: '14px', weight: '400', lineHeight: '1.5', sample: 'brand.primary = #FF5F45' },
      { label: 'Token', size: '12px', weight: '500', lineHeight: '1.4', sample: 'spacing-4: 4px' },
      { label: 'Meta', size: '11px', weight: '400', lineHeight: '1.3', sample: 'Weight 400 · 14px' },
    ],
  },
  {
    name: 'Inter',
    role: 'Body',
    weights: ['400', '500', '600'],
    usage: 45,
    styles: [
      { label: 'Body', size: '14px', weight: '400', lineHeight: '1.6', sample: 'The quick brown fox jumps over the lazy dog' },
      { label: 'Small', size: '13px', weight: '500', lineHeight: '1.5', sample: 'Secondary text and labels' },
      { label: 'Caption', size: '12px', weight: '400', lineHeight: '1.4', sample: 'Metadata and timestamps' },
    ],
  },
];

export default function TypographyPage() {
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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Typography</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{FONTS.length} font families detected</p>
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

      {FONTS.map((font) => (
        <div key={font.name} className="dash-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[15px] font-semibold text-[#1A1918]">{font.name}</div>
              <div className="text-[12px] text-[#8A8A85]">{font.role} · {font.usage} uses</div>
            </div>
            <div className="flex items-center gap-1.5">
              {font.weights.map((w) => (
                <span key={w} className="text-[10px] font-mono text-[#8A8A85] bg-[#F5F5F3] px-1.5 py-0.5 rounded">
                  {w}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {font.styles.map((style) => (
              <div key={style.label} className="p-3 rounded-lg border border-[#F0F0EE]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider">{style.label}</span>
                  <span className="text-[10px] font-mono text-[#C4C4BF]">{style.size} / {style.weight}</span>
                </div>
                <div
                  style={{
                    fontFamily: font.name,
                    fontSize: style.size,
                    fontWeight: style.weight,
                    lineHeight: style.lineHeight,
                    color: '#1A1918',
                  }}
                >
                  {style.sample}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
