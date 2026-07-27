'use client';

import { useState } from 'react';
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
  CheckCircle,
  Warning,
  ArrowRight,
  Clock,
  Globe,
  ArrowClockwise,
  Download,
  Link as LinkIcon,
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

export default function BrandIdentityPage() {
  const pathname = usePathname();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasIdentity, setHasIdentity] = useState(true);

  const isActive = (to: string) => {
    if (to === '/brand') return pathname === '/brand';
    return pathname.startsWith(to);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsScanning(true);
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation */}
      <div className="sub-nav overflow-x-auto">
        {subNav.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={cn('sub-nav-item', isActive(item.to) && 'active')}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* First-time user: URL submission */}
      {!hasIdentity && (
        <div className="dash-card max-w-[560px]">
          <div className="mb-5">
            <h2 className="text-[18px] font-bold text-[#1A1918] tracking-tight">Create your brand identity</h2>
            <p className="text-[13px] text-[#8A8A85] mt-1.5 leading-relaxed">
              Enter your website URL and Brandcora will identify its colors, typography, logos, icons, spacing, radius, and reusable design tokens.
            </p>
          </div>
          <form onSubmit={handleScan} className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="input-compact flex-1"
              required
            />
            <button type="submit" className="btn-primary">
              <MagnifyingGlass className="h-4 w-4" weight="bold" />
              Analyze
            </button>
          </form>
          <div className="mt-4 space-y-1.5">
            {[
              'Public website required',
              'Initial scan does not change the website',
              'Results can be reviewed before approval',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-[#8A8A85]">
                <CheckCircle className="h-3 w-3 text-[#C4C4BF]" weight="bold" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Progress */}
      {isScanning && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FF5F45]/10 flex items-center justify-center">
                <MagnifyingGlass className="h-4 w-4 text-[#FF5F45]" weight="bold" />
              </div>
              <div>
                <div className="dash-card-title">Scanning website</div>
                <div className="dash-card-subtitle">{url}</div>
              </div>
            </div>
            <button className="btn-ghost text-[12px]">Cancel</button>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'Connecting to website', status: 'completed' },
              { label: 'Discovering pages', status: 'completed' },
              { label: 'Reading styles', status: 'active' },
              { label: 'Detecting visual assets', status: 'pending' },
              { label: 'Building design tokens', status: 'pending' },
              { label: 'Preparing brand profile', status: 'pending' },
            ].map((stage, i) => (
              <div key={i} className={cn('scan-stage', stage.status)}>
                <div className={cn('scan-stage-number', stage.status)}>
                  {stage.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" weight="bold" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={cn(
                  'text-[13px]',
                  stage.status === 'active' ? 'font-medium text-[#1A1918]' : 'text-[#8A8A85]'
                )}>
                  {stage.label}
                </span>
                {stage.status === 'active' && (
                  <span className="text-[11px] text-[#8A8A85] ml-auto">12 of 18 pages</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Returning user: Brand Identity Overview */}
      {hasIdentity && !isScanning && (
        <>
          {/* Brand Summary */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 dash-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B] flex items-center justify-center">
                    <Fingerprint className="h-6 w-6 text-white" weight="bold" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#1A1918] tracking-tight">Acme Corp</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-3.5 w-3.5 text-[#8A8A85]" weight="bold" />
                      <span className="text-[12px] text-[#8A8A85] font-mono">acme.com</span>
                      <span className="status-badge active text-[10px]">
                        <span className="status-dot active" />
                        Approved
                      </span>
                      <span className="text-[11px] text-[#C4C4BF]">v2</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost text-[12px]">
                    <ArrowClockwise className="h-3.5 w-3.5" weight="bold" /> Rescan
                  </button>
                  <button className="btn-ghost text-[12px]">
                    <Download className="h-3.5 w-3.5" weight="bold" /> Export
                  </button>
                  <a href="#" className="btn-ghost text-[12px]">
                    <LinkIcon className="h-3.5 w-3.5" weight="bold" /> Visit
                  </a>
                </div>
              </div>
            </div>
            <div className="col-span-4 dash-card">
              <div className="text-[12px] text-[#8A8A85] mb-3">Last scan</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#8A8A85]" weight="bold" />
                <span className="text-[13px] font-medium text-[#1A1918]">2 hours ago</span>
              </div>
              <div className="text-[12px] text-[#8A8A85] mt-2">18 pages analyzed · 24 assets detected</div>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Colors', value: '12', icon: Palette, color: '#FF5F45' },
              { label: 'Fonts', value: '3', icon: TextAa, color: '#FF8A5B' },
              { label: 'Logos', value: '6', icon: CirclesFour, color: '#F2B84B' },
              { label: 'Tokens', value: '48', icon: ListChecks, color: '#1A1918' },
            ].map((card) => (
              <div key={card.label} className="dash-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                    <card.icon className="h-3.5 w-3.5" style={{ color: card.color }} weight="bold" />
                  </div>
                  <span className="text-[12px] text-[#8A8A85]">{card.label}</span>
                </div>
                <div className="metric-value text-[24px]">{card.value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
