'use client';

import { useState, useEffect } from 'react';
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
  Spinner,
  Plus,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { useBrandProfile } from '@/lib/brand-profile-context';

interface UsageData {
  socialChecks: { used: number; limit: number | null; remaining: number | null };
  websiteScans: { used: number; limit: number | null; remaining: number | null };
}

interface ScanItem {
  id: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
}

export default function BrandIdentityOverview() {
  const { profile, loading: profileLoading } = useBrandProfile();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usageRes, scansRes] = await Promise.all([
          apiFetch('/api/v1/usage'),
          apiFetch('/api/v1/scans?limit=5'),
        ]);

        const usageData = await usageRes.json();
        const scansData = await scansRes.json();

        if (usageData.success) setUsage(usageData.data);
        if (scansData.success) setScans(scansData.data.scans || []);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadingState = profileLoading || loading;

  if (loadingState) {
    return (
      <div className="space-y-6">
        <div className="dash-card flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-[#FF5F45] animate-spin" weight="bold" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="dash-card max-w-[480px] mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#FF5F45]/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-[#FF5F45]" weight="bold" />
          </div>
          <h2 className="text-[18px] font-bold text-[#1A1918] mb-2">Set up your brand</h2>
          <p className="text-[13px] text-[#8A8A85] mb-6">
            Scan your website or social page to auto-detect your brand identity.
          </p>
          <Link href="/brand/scan" className="btn-primary">
            <Palette className="h-4 w-4" weight="bold" /> Start a scan
          </Link>
        </div>
      </div>
    );
  }

  const colors = profile.colors || [];
  const fonts = profile.fonts || [];
  const logos = profile.logos || [];
  const gradients = profile.gradients || [];

  const socialUsed = usage?.socialChecks.used ?? 0;
  const socialLimit = usage?.socialChecks.limit ?? null;
  const scansUsed = usage?.websiteScans.used ?? 0;
  const scansLimit = usage?.websiteScans.limit ?? null;

  const completenessItems = [
    { label: 'Logo', done: logos.length > 0 },
    { label: 'Colors', done: colors.length > 0 },
    { label: 'Typography', done: fonts.length > 0 },
    { label: 'Gradients', done: gradients.length > 0 },
  ];
  const completedCount = completenessItems.filter(c => c.done).length;

  const lastScan = scans[0];
  const lastScanTime = lastScan
    ? getTimeAgo(new Date(lastScan.createdAt))
    : 'Never';

  return (
    <div className="space-y-6">
      {/* Top Row: Brand Profile / Scan Status / Identity Completeness */}
      <div className="grid grid-cols-12 gap-4">
        {/* Brand Profile (5 cols) */}
        <div className="col-span-5 dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Brand profile</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Brand</span>
              <span className="text-[13px] font-semibold text-[#1A1918]">{profile.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Status</span>
              <span className="status-badge active">
                <span className="status-dot active" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Colors</span>
              <span className="text-[13px] text-[#3D3D3A]">{colors.length} detected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Fonts</span>
              <span className="text-[13px] text-[#3D3D3A]">{fonts.length} detected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">Last scan</span>
              <span className="text-[13px] text-[#3D3D3A]">{lastScanTime}</span>
            </div>
          </div>
        </div>

        {/* Scan Status (3 cols) */}
        <div className="col-span-3 dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Usage</div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#8A8A85]">Website scans</span>
                <span className="text-[13px] font-semibold text-[#1A1918]">
                  {scansUsed} / {scansLimit ?? '∞'}
                </span>
              </div>
              {scansLimit !== null && scansLimit > 0 && (
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${Math.min((scansUsed / scansLimit) * 100, 100)}%` }} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#8A8A85]">Social checks</span>
                <span className="text-[13px] font-semibold text-[#1A1918]">
                  {socialUsed} / {socialLimit ?? '∞'}
                </span>
              </div>
              {socialLimit !== null && socialLimit > 0 && (
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${Math.min((socialUsed / socialLimit) * 100, 100)}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity Completeness (4 cols) */}
        <div className="col-span-4 dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Identity completeness</div>
            <span className="text-[12px] font-semibold text-[#3D3D3A]">{completedCount}/{completenessItems.length}</span>
          </div>
          <div className="space-y-0">
            {completenessItems.map((item) => (
              <div key={item.label} className="completeness-row">
                <span className="completeness-label">{item.label}</span>
                <span className={cn('completeness-status', item.done ? 'complete' : 'review')}>
                  {item.done ? (
                    <><CheckCircle className="h-3.5 w-3.5" weight="bold" /> Complete</>
                  ) : (
                    <><Warning className="h-3.5 w-3.5" weight="bold" /> Missing</>
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
          {colors.length === 0 ? (
            <p className="text-[13px] text-[#8A8A85] py-4">No colors detected yet.</p>
          ) : (
            <div className="space-y-1.5">
              {colors.slice(0, 5).map((c) => (
                <div key={c.id} className="color-swatch">
                  <div className="color-swatch-preview" style={{ backgroundColor: c.hexValue }} />
                  <div className="color-swatch-info">
                    <div className="color-swatch-name">{c.name}</div>
                    <div className="color-swatch-hex">{c.hexValue}</div>
                  </div>
                  {c.role && <span className="text-[11px] font-mono text-[#8A8A85]">{c.role}</span>}
                </div>
              ))}
            </div>
          )}
          {gradients.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider mb-2">Gradients</div>
              {gradients.slice(0, 2).map((g) => (
                <div key={g.id} className="h-8 rounded-lg mb-1.5" style={{ background: g.normalizedValue }} />
              ))}
            </div>
          )}
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
          {fonts.length === 0 ? (
            <p className="text-[13px] text-[#8A8A85] py-4">No fonts detected yet.</p>
          ) : (
            <div className="space-y-2">
              {fonts.slice(0, 3).map((f) => (
                <div key={f.id} className="type-specimen">
                  <div className="flex items-center justify-between mb-1">
                    <span className="type-specimen-name">{f.name}</span>
                    <span className="text-[11px] text-[#8A8A85]">{f.role || 'Body'}</span>
                  </div>
                  <div className="type-specimen-sample" style={{ fontFamily: f.family }}>
                    The quick brown fox jumps
                  </div>
                  <div className="type-specimen-meta">Weight {f.weight || 400}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Third Row: Logos / Spacing */}
      <div className="grid grid-cols-12 gap-4">
        {/* Logos & Assets (6 cols) */}
        <div className="col-span-6 dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#F2B84B]/10 flex items-center justify-center">
                <CirclesFour className="h-4 w-4 text-[#F2B84B]" weight="bold" />
              </div>
              <div className="dash-card-title">Logos &amp; assets</div>
            </div>
          </div>
          {logos.length === 0 ? (
            <p className="text-[13px] text-[#8A8A85] py-4">No logos uploaded yet.</p>
          ) : (
            <div className="space-y-1.5">
              {logos.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg border border-[#F0F0EE]">
                  <div className="w-9 h-9 rounded-md bg-[#F5F5F3] flex items-center justify-center overflow-hidden">
                    <img src={l.fileUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#3D3D3A] truncate">{l.logoType || 'Logo'}</div>
                    <div className="text-[11px] text-[#8A8A85]">
                      {l.width && l.height ? `${l.width}×${l.height}` : 'Unknown size'}
                      {l.backgroundType ? ` · ${l.backgroundType}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spacing & Radius (6 cols) */}
        <div className="col-span-6 dash-card">
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
              <div className="text-[13px] text-[#3D3D3A]">
                {profile.spacingPreference || 'Not configured'}
              </div>
            </div>
            <div className="border-t border-[#F5F5F3] pt-3">
              <div className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider mb-2">Radius</div>
              <div className="text-[13px] text-[#3D3D3A]">
                {profile.borderRadius != null ? `${profile.borderRadius}px` : 'Not configured'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      {scans.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Recent scans</div>
            <Link href="/scans" className="btn-ghost text-[12px]">
              View all <ArrowRight className="h-3 w-3" weight="bold" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/scans/${scan.id}`}
                className="flex items-center justify-between p-2 rounded-lg border border-[#F0F0EE] hover:bg-[#FAFAF9] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    scan.status === 'completed' ? 'bg-[#16A34A]' :
                    scan.status === 'failed' ? 'bg-[#DC2626]' : 'bg-[#F59E0B]'
                  )} />
                  <span className="text-[12px] text-[#3D3D3A]">{scan.id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-3">
                  {scan.overallScore != null && (
                    <span className="text-[12px] font-medium text-[#3D3D3A]">{Math.round(scan.overallScore)}%</span>
                  )}
                  <span className="text-[11px] text-[#8A8A85]">{getTimeAgo(new Date(scan.createdAt))}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
