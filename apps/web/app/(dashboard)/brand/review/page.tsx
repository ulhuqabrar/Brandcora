'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Warning,
  ArrowRight,
  ArrowClockwise,
  Download,
  Globe,
  MagnifyingGlass,
  Palette,
  TextAa,
  CirclesFour,
  Spinner,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

interface ScanIssue {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string | null;
}

interface ScanScore {
  id: string;
  category: string;
  score: number;
  weight: number;
}

interface ScanData {
  id: string;
  status: string;
  sourceUrl: string | null;
  overallScore: number | null;
  pagesAnalyzed: number;
  createdAt: string;
  completedAt: string | null;
  scores: ScanScore[];
  issues: ScanIssue[];
  pages: Array<{ id: string; url: string; pageTitle: string | null }>;
}

export default function BrandReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get('scanId');

  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const fetchScan = useCallback(async () => {
    if (!scanId) {
      setLoading(false);
      setError('No scan ID provided. Start a scan from the Scan tab.');
      return;
    }

    try {
      const res = await apiFetch(`/api/v1/scans/${scanId}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load scan');
      }

      setScan(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load scan data');
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  const handleApprove = async () => {
    if (!scan) return;
    setApproving(true);

    try {
      const res = await apiFetch(`/api/v1/brand-profile/approve-scan/${scan.id}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to approve');
      }

      setApproved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to approve brand identity');
    } finally {
      setApproving(false);
    }
  };

  const handleRescan = () => {
    router.push('/brand/scan');
  };

  const handleExport = async () => {
    if (!scan) return;
    try {
      const res = await apiFetch(`/api/v1/scans/${scan.id}`);
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brand-scan-${scan.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="dash-card max-w-[480px] mx-auto text-center py-12">
          <Spinner className="h-8 w-8 text-[#FF5F45] animate-spin mx-auto mb-4" weight="bold" />
          <p className="text-[13px] text-[#8A8A85]">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (error && !scan) {
    return (
      <div className="space-y-5">
        <div className="dash-card max-w-[480px] mx-auto text-center py-12">
          <Warning className="h-8 w-8 text-[#F59E0B] mx-auto mb-4" weight="fill" />
          <h2 className="text-[18px] font-bold text-[#1A1918] mb-2">No scan data</h2>
          <p className="text-[13px] text-[#8A8A85] mb-6">{error}</p>
          <Link href="/brand/scan" className="btn-primary">
            <MagnifyingGlass className="h-4 w-4" weight="bold" /> Start a scan
          </Link>
        </div>
      </div>
    );
  }

  if (approved) {
    return (
      <div className="space-y-5">
        <div className="dash-card max-w-[480px] mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[#16A34A]" weight="bold" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight mb-2">
            Brand identity ready
          </h2>
          <p className="text-[13px] text-[#8A8A85] mb-6 max-w-[320px] mx-auto">
            Your brand identity has been saved. You can now analyze creative assets against it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/scans/new" className="btn-primary">
              <MagnifyingGlass className="h-4 w-4" weight="bold" /> Create first report
            </Link>
              <Link href="/dashboard" className="btn-secondary">
              Explore brand identity
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hostname = scan?.sourceUrl ? (() => {
    try { return new URL(scan.sourceUrl).hostname.replace('www.', ''); }
    catch { return scan.sourceUrl; }
  })() : '';

  const colorIssues = scan?.issues.filter(i => i.category === 'colors') || [];
  const typographyIssues = scan?.issues.filter(i => i.category === 'typography') || [];
  const logoIssues = scan?.issues.filter(i => i.category === 'logo') || [];
  const componentIssues = scan?.issues.filter(i => i.category === 'components') || [];

  const overallScore = scan?.overallScore ?? 0;

  return (
    <div className="space-y-5">
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
              <span className="text-[12px] text-[#8A8A85]">{hostname}</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">{scan?.pages.length || 0} pages</span>
              {scan?.completedAt && (
                <>
                  <span className="text-[12px] text-[#8A8A85]">·</span>
                  <span className="text-[12px] text-[#8A8A85]">
                    {new Date(scan.completedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRescan} className="btn-ghost text-[12px]">
            <ArrowClockwise className="h-3.5 w-3.5" weight="bold" /> Rescan
          </button>
          <button onClick={handleExport} className="btn-ghost text-[12px]">
            <Download className="h-3.5 w-3.5" weight="bold" /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {/* Confidence Summary */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <div className="dash-card-title">Confidence summary</div>
          <span className={cn(
            'text-[14px] font-bold',
            overallScore >= 80 ? 'text-[#16A34A]' : overallScore >= 60 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
          )}>
            {overallScore}%
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Colors', count: colorIssues.length, icon: Palette, color: '#FF5F45' },
            { label: 'Fonts', count: typographyIssues.length, icon: TextAa, color: '#FF8A5B' },
            { label: 'Logos', count: logoIssues.length, icon: CirclesFour, color: '#F2B84B' },
            { label: 'Issues', count: scan?.issues.length || 0, icon: Warning, color: '#D97706' },
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
      {colorIssues.length > 0 && (
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
            {colorIssues.slice(0, 5).map((issue) => {
              const hexMatch = issue.description.match(/#[0-9A-Fa-f]{6}/);
              return (
                <div key={issue.id} className="color-swatch">
                  {hexMatch && <div className="color-swatch-preview" style={{ backgroundColor: hexMatch[0] }} />}
                  <div className="color-swatch-info">
                    <div className="color-swatch-name">{issue.title}</div>
                    <div className="color-swatch-hex">{hexMatch?.[0] || 'N/A'}</div>
                  </div>
                  <span className={cn(
                    'text-[11px] font-medium',
                    issue.severity === 'critical' ? 'text-[#DC2626]' :
                    issue.severity === 'major' ? 'text-[#F59E0B]' : 'text-[#16A34A]'
                  )}>
                    {issue.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detected Typography */}
      {typographyIssues.length > 0 && (
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
            {typographyIssues.slice(0, 3).map((issue) => (
              <div key={issue.id} className="type-specimen">
                <div className="flex items-center justify-between mb-1">
                  <span className="type-specimen-name">{issue.title}</span>
                  <span className={cn(
                    'text-[11px] font-medium',
                    issue.severity === 'major' ? 'text-[#F59E0B]' : 'text-[#16A34A]'
                  )}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-[12px] text-[#8A8A85]">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues List */}
      {scan?.issues && scan.issues.length > 0 && (
        <div className="dash-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#F59E0B]/10 flex items-center justify-center">
                <Warning className="h-4 w-4 text-[#F59E0B]" weight="bold" />
              </div>
              <div className="dash-card-title">Issues found</div>
            </div>
            <span className="text-[12px] text-[#8A8A85]">{scan.issues.length} issues</span>
          </div>
          <div className="space-y-2">
            {scan.issues.slice(0, 8).map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#F0F0EE]">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-1.5 shrink-0',
                  issue.severity === 'critical' ? 'bg-[#DC2626]' :
                  issue.severity === 'major' ? 'bg-[#F59E0B]' :
                  issue.severity === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#1A1918]">{issue.title}</div>
                  <div className="text-[12px] text-[#8A8A85] mt-0.5">{issue.description}</div>
                  {issue.recommendation && (
                    <div className="text-[11px] text-[#6B7280] mt-1">→ {issue.recommendation}</div>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium uppercase px-2 py-0.5 rounded',
                  issue.severity === 'critical' ? 'bg-red-50 text-[#DC2626]' :
                  issue.severity === 'major' ? 'bg-yellow-50 text-[#F59E0B]' :
                  issue.severity === 'warning' ? 'bg-yellow-50 text-[#F59E0B]' : 'bg-green-50 text-[#16A34A]'
                )}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <button
              onClick={handleApprove}
              disabled={approving}
              className="btn-primary text-[12px]"
            >
              {approving ? (
                <Spinner className="h-3.5 w-3.5 animate-spin" weight="bold" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" weight="bold" />
              )} Approve identity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
