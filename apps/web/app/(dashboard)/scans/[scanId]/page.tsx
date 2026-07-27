'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share,
  ArrowClockwise,
  CheckCircle,
  Warning,
  WarningCircle,
  Palette,
  TextAa,
  CirclesFour,
  FileImage,
  Spinner,
  Globe,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

interface ScanIssue {
  id: string;
  severity: string;
  category: string;
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
  overallScore: number | null;
  sourceUrl: string | null;
  sourceFileUrl: string | null;
  scanType: string;
  platform: string | null;
  createdAt: string;
  completedAt: string | null;
  issues: ScanIssue[];
  scores: ScanScore[];
  brandProfile?: { name: string } | null;
}

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: '#DC2626', label: 'Critical' },
  major: { color: '#D97706', label: 'Major' },
  warning: { color: '#D97706', label: 'Warning' },
  minor: { color: '#3B82F6', label: 'Minor' },
  suggestion: { color: '#C4C4BF', label: 'Suggestion' },
};

export default function ScanDetailPage() {
  const params = useParams();
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scanId) return;
    apiFetch(`/api/v1/scans/${scanId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setScan(d.data);
        else setError(d.error || 'Failed to load scan');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [scanId]);

  const handleExport = async () => {
    if (!scan) return;
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-${scan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="dash-card flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-[#FF5F45] animate-spin" weight="bold" />
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/scans" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#8A8A85]" weight="bold" />
          </Link>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Scan not found</h2>
        </div>
        <div className="dash-card text-center py-8">
          <p className="text-[13px] text-[#8A8A85] mb-4">{error || 'Scan not found'}</p>
          <Link href="/scans" className="btn-primary text-[12px]">Back to scans</Link>
        </div>
      </div>
    );
  }

  const hostname = scan.sourceUrl ? (() => {
    try { return new URL(scan.sourceUrl).hostname.replace('www.', ''); }
    catch { return scan.sourceUrl; }
  })() : scan.platform || 'Social';

  const scoreColor = (scan.overallScore ?? 0) >= 80 ? '#16A34A' :
                     (scan.overallScore ?? 0) >= 60 ? '#D97706' : '#DC2626';

  const colorIssues = scan.issues.filter(i => i.category === 'colors');
  const typographyIssues = scan.issues.filter(i => i.category === 'typography');
  const logoIssues = scan.issues.filter(i => i.category === 'logo');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/scans" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#8A8A85]" weight="bold" />
          </Link>
          <div>
            <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">{hostname}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <Globe className="h-3.5 w-3.5 text-[#8A8A85]" weight="bold" />
              <span className="text-[12px] text-[#8A8A85]">{scan.scanType}</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">
                {new Date(scan.createdAt).toLocaleDateString()}
              </span>
              <span className={cn('status-badge text-[10px]', scan.status === 'completed' ? 'active' : 'pending')}>
                {scan.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary text-[12px]">
            <Download className="h-3.5 w-3.5" weight="bold" /> Export
          </button>
          <Link href={`/brand/scan`} className="btn-secondary text-[12px]">
            <ArrowClockwise className="h-3.5 w-3.5" weight="bold" /> New scan
          </Link>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-12 gap-5">
        {/* Score Card (4 cols) */}
        <div className="col-span-4 dash-card">
          <div className="text-[12px] text-[#8A8A85] mb-2">Brand alignment</div>
          <div className="flex items-end gap-2">
            <span className="score-large" style={{ color: scoreColor }}>
              {scan.overallScore != null ? Math.round(scan.overallScore) : '—'}
            </span>
            {scan.overallScore != null && <span className="text-[14px] text-[#C4C4BF] mb-1">/100</span>}
          </div>
          <div className="mt-4 space-y-2">
            {scan.scores.map((s) => (
              <div key={s.id} className="score-category">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#3D3D3A]">{s.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="score-bar">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${s.score}%`,
                        backgroundColor: s.score >= 80 ? '#16A34A' : s.score >= 60 ? '#D97706' : '#DC2626',
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold w-7 text-right" style={{ color: s.score >= 80 ? '#16A34A' : s.score >= 60 ? '#D97706' : '#DC2626' }}>
                    {Math.round(s.score)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues Panel (8 cols) */}
        <div className="col-span-8 space-y-4">
          {/* Category Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Colors', count: colorIssues.length, icon: Palette, color: '#FF5F45' },
              { label: 'Typography', count: typographyIssues.length, icon: TextAa, color: '#FF8A5B' },
              { label: 'Logos', count: logoIssues.length, icon: CirclesFour, color: '#F2B84B' },
            ].map((cat) => (
              <div key={cat.label} className="dash-card">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                    <cat.icon className="h-3.5 w-3.5" style={{ color: cat.color }} weight="bold" />
                  </div>
                  <span className="text-[12px] font-medium text-[#3D3D3A]">{cat.label}</span>
                  <span className="ml-auto text-[13px] font-bold text-[#1A1918]">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Issues List */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title">Issues ({scan.issues.length})</div>
            </div>
            {scan.issues.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-[#16A34A] mx-auto mb-2" weight="bold" />
                <p className="text-[13px] text-[#8A8A85]">No issues found — brand is consistent!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {scan.issues.map((issue) => {
                  const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.minor;
                  return (
                    <div key={issue.id} className="issue-row">
                      <div className="issue-severity" style={{ backgroundColor: sev.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold uppercase" style={{ color: sev.color }}>
                            {sev.label}
                          </span>
                          <span className="text-[10px] text-[#C4C4BF]">·</span>
                          <span className="text-[10px] text-[#8A8A85]">{issue.category}</span>
                        </div>
                        <div className="text-[12px] font-medium text-[#1A1918] mb-1">{issue.title}</div>
                        <div className="text-[11px] text-[#8A8A85]">{issue.description}</div>
                        {issue.recommendation && (
                          <div className="text-[11px] text-[#6B7280] mt-1">→ {issue.recommendation}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
