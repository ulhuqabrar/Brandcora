'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  CheckCircle,
  Warning,
  ArrowRight,
  ArrowClockwise,
  Download,
  PencilSimple,
  Globe,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const subNav = [
  { to: '/brand', label: 'Overview', icon: Fingerprint },
  { to: '/brand/scan', label: 'Scan', icon: MagnifyingGlass },
  { to: '/brand/colors', label: 'Colors', icon: Palette },
  { to: '/brand/typography', label: 'Typography', icon: TextAa },
  { to: '/brand/assets', label: 'Assets', icon: CirclesFour },
  { to: '/brand/layout', label: 'Layout', icon: Ruler },
  { to: '/brand/components', label: 'Components', icon: Stack },
  { to: '/brand/tokens', label: 'Tokens', icon: ListChecks },
  { to: '/brand/versions', label: 'Versions', icon: GitBranch },
];

const DETECTED = {
  website: 'acme.com',
  scanDate: 'Just now',
  pagesAnalyzed: 18,
  assetsFound: 24,
  confidence: 94,
  flagged: 2,
  colors: [
    { name: 'Primary', hex: '#FF5F45', confidence: 98 },
    { name: 'Secondary', hex: '#FF8A5B', confidence: 96 },
    { name: 'Accent', hex: '#F2B84B', confidence: 95 },
    { name: 'Dark', hex: '#1A1918', confidence: 99 },
    { name: 'Light', hex: '#FAFAF9', confidence: 97 },
  ],
  fonts: [
    { name: 'Manrope', role: 'Headings', confidence: 99 },
    { name: 'IBM Plex Mono', role: 'Code', confidence: 97 },
    { name: 'Inter', role: 'Body', confidence: 95 },
  ],
  logos: [
    { name: 'Primary mark', type: 'SVG', confidence: 99 },
    { name: 'Wordmark dark', type: 'SVG', confidence: 96 },
    { name: 'Icon only', type: 'PNG', confidence: 94 },
  ],
};

export default function BrandReviewPage() {
  const router = useRouter();
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => {
      router.push('/brand');
    }, 1500);
  };

  if (approved) {
    return (
      <div className="space-y-5">
        <div className="sub-nav overflow-x-auto">
          {subNav.map((item) => (
            <Link key={item.to} href={item.to} className={cn('sub-nav-item', item.to === '/brand/scan' && 'active')}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="dash-card max-w-[480px] mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[#16A34A]" weight="bold" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight mb-2">
            Brand identity ready
          </h2>
          <p className="text-[13px] text-[#8A8A85] mb-6 max-w-[320px] mx-auto">
            You can now export the system or analyze creative assets against it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/scans/new" className="btn-primary">
              <MagnifyingGlass className="h-4 w-4" weight="bold" /> Create first report
            </Link>
            <Link href="/brand" className="btn-secondary">
              Explore brand identity
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="sub-nav overflow-x-auto">
        {subNav.map((item) => (
          <Link key={item.to} href={item.to} className={cn('sub-nav-item', item.to === '/brand/scan' && 'active')}>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/brand/scan" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#8A8A85]" weight="bold" />
          </Link>
          <div>
            <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Brand identity detected</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <Globe className="h-3.5 w-3.5 text-[#8A8A85]" weight="bold" />
              <span className="text-[12px] text-[#8A8A85]">{DETECTED.website}</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">{DETECTED.scanDate}</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">{DETECTED.pagesAnalyzed} pages</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">{DETECTED.assetsFound} assets</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-[12px]">
            <ArrowClockwise className="h-3.5 w-3.5" weight="bold" /> Rescan
          </button>
          <button className="btn-ghost text-[12px]">
            <Download className="h-3.5 w-3.5" weight="bold" /> Export preview
          </button>
          <button className="btn-ghost text-[12px]">
            <PencilSimple className="h-3.5 w-3.5" weight="bold" /> Edit name
          </button>
        </div>
      </div>

      {/* Confidence Summary */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <div className="dash-card-title">Confidence summary</div>
          <span className="text-[14px] font-bold text-[#16A34A]">{DETECTED.confidence}%</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Colors', count: DETECTED.colors.length, icon: Palette, color: '#FF5F45' },
            { label: 'Fonts', count: DETECTED.fonts.length, icon: TextAa, color: '#FF8A5B' },
            { label: 'Logos', count: DETECTED.logos.length, icon: CirclesFour, color: '#F2B84B' },
            { label: 'Flagged', count: DETECTED.flagged, icon: Warning, color: '#D97706' },
          ].map((card) => (
            <div key={card.label} className="flex items-center gap-3 p-3 rounded-lg border border-[#F0F0EE]">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="h-4 w-4" style={{ color: card.color }} weight="bold" />
              </div>
              <div>
                <div className="text-[18px] font-bold text-[#1A1918]">{card.count}</div>
                <div className="text-[11px] text-[#8A8A85]">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Colors */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#FF5F45]/10 flex items-center justify-center">
              <Palette className="h-4 w-4 text-[#FF5F45]" weight="bold" />
            </div>
            <div className="dash-card-title">Colors detected</div>
          </div>
          <Link href="/brand/colors" className="btn-ghost text-[12px]">
            View all →
          </Link>
        </div>
        <div className="space-y-1.5">
          {DETECTED.colors.map((c) => (
            <div key={c.hex} className="color-swatch">
              <div className="color-swatch-preview" style={{ backgroundColor: c.hex }} />
              <div className="color-swatch-info">
                <div className="color-swatch-name">{c.name}</div>
                <div className="color-swatch-hex">{c.hex}</div>
              </div>
              <span className="text-[11px] text-[#16A34A] font-medium">{c.confidence}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Typography */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#FF8A5B]/10 flex items-center justify-center">
              <TextAa className="h-4 w-4 text-[#FF8A5B]" weight="bold" />
            </div>
            <div className="dash-card-title">Typography detected</div>
          </div>
          <Link href="/brand/typography" className="btn-ghost text-[12px]">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {DETECTED.fonts.map((f) => (
            <div key={f.name} className="type-specimen">
              <div className="flex items-center justify-between mb-1">
                <span className="type-specimen-name">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8A8A85]">{f.role}</span>
                  <span className="text-[11px] text-[#16A34A] font-medium">{f.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Logos */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#F2B84B]/10 flex items-center justify-center">
              <CirclesFour className="h-4 w-4 text-[#F2B84B]" weight="bold" />
            </div>
            <div className="dash-card-title">Logos detected</div>
          </div>
          <Link href="/brand/assets" className="btn-ghost text-[12px]">
            View all →
          </Link>
        </div>
        <div className="space-y-1.5">
          {DETECTED.logos.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-[#F0F0EE]">
              <div className="w-9 h-9 rounded-md bg-[#F5F5F3] flex items-center justify-center">
                <CirclesFour className="h-4 w-4 text-[#8A8A85]" weight="bold" />
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-medium text-[#3D3D3A]">{l.name}</div>
                <div className="text-[11px] text-[#8A8A85]">{l.type}</div>
              </div>
              <span className="text-[11px] text-[#16A34A] font-medium">{l.confidence}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Actions */}
      <div className="dash-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="dash-card-title">Ready to approve?</div>
            <div className="text-[12px] text-[#8A8A85] mt-0.5">
              You can review flagged items or approve the identity as-is.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/brand/scan" className="btn-secondary text-[12px]">
              <ArrowClockwise className="h-3.5 w-3.5" weight="bold" /> Rescan
            </Link>
            <Link href="/brand" className="btn-secondary text-[12px]">
              Review flagged items
            </Link>
            <button onClick={handleApprove} className="btn-primary text-[12px]">
              <CheckCircle className="h-3.5 w-3.5" weight="bold" /> Approve identity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
