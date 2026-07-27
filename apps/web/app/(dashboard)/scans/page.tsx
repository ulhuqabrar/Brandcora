'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Lock,
  Fingerprint,
  TrendUp,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Spinner,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

interface ScanItem {
  id: string;
  status: string;
  overallScore: number | null;
  sourceUrl: string | null;
  sourceFileUrl: string | null;
  scanType: string;
  platform: string | null;
  createdAt: string;
  issues: Array<{ id: string }>;
  scores: Array<{ category: string; score: number }>;
  brandProfile?: { name: string } | null;
}

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    apiFetch(`/api/v1/scans?page=${page}&limit=20`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setScans(d.data.scans || []);
          setTotal(d.data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = scans.filter(s => {
    if (!search) return true;
    const hostname = s.sourceUrl ? (() => {
      try { return new URL(s.sourceUrl).hostname.replace('www.', ''); }
      catch { return s.sourceUrl; }
    })() : '';
    return hostname.toLowerCase().includes(search.toLowerCase()) ||
           s.scanType.toLowerCase().includes(search.toLowerCase());
  });

  const completedScans = scans.filter(s => s.status === 'completed' || s.status === 'completed_with_warnings');
  const avgScore = completedScans.length > 0
    ? Math.round(completedScans.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completedScans.length)
    : 0;
  const totalIssues = scans.reduce((sum, s) => sum + (s.issues?.length ?? 0), 0);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="dash-card flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-[#FF5F45] animate-spin" weight="bold" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1918] tracking-tight">Scans</h1>
          <p className="text-[13px] text-[#8A8A85] mt-1">
            Website and social media brand consistency scans.
          </p>
        </div>
        <Link href="/scans/new" className="btn-primary">
          <Plus className="h-4 w-4" weight="bold" />
          New scan
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total scans', value: total.toString(), icon: FileText, color: '#FF5F45' },
          { label: 'Average score', value: avgScore.toString(), icon: TrendUp, color: '#16A34A' },
          { label: 'Open issues', value: totalIssues.toString(), icon: WarningCircle, color: '#D97706' },
          { label: 'Completed', value: completedScans.length.toString(), icon: CheckCircle, color: '#16A34A' },
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

      {/* Scans Table */}
      <div className="dash-card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#F5F5F3]">
          <div className="text-[13px] font-semibold text-[#1A1918]">Recent scans</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scans..."
              className="input-compact h-8 text-[12px] w-48"
            />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Score</th>
              <th>Issues</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((scan) => {
              const hostname = scan.sourceUrl ? (() => {
                try { return new URL(scan.sourceUrl).hostname.replace('www.', ''); }
                catch { return scan.sourceUrl; }
              })() : scan.platform || 'Social';

              const scoreColor = (scan.overallScore ?? 0) >= 80 ? '#16A34A' :
                                 (scan.overallScore ?? 0) >= 60 ? '#D97706' : '#DC2626';

              return (
                <tr key={scan.id}>
                  <td>
                    <Link href={`/scans/${scan.id}`} className="text-[13px] font-medium text-[#1A1918] hover:text-[#FF5F45] transition-colors">
                      {hostname}
                    </Link>
                    <div className="text-[11px] text-[#8A8A85]">{scan.brandProfile?.name || 'Brand'}</div>
                  </td>
                  <td>
                    <span className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded',
                      scan.scanType === 'website' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    )}>
                      {scan.scanType}
                    </span>
                  </td>
                  <td>
                    {scan.overallScore != null ? (
                      <span className="text-[14px] font-bold" style={{ color: scoreColor }}>
                        {Math.round(scan.overallScore)}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#C4C4BF]">—</span>
                    )}
                  </td>
                  <td>
                    <span className={cn(
                      'text-[12px] font-medium',
                      (scan.issues?.length ?? 0) > 5 ? 'text-[#DC2626]' :
                      (scan.issues?.length ?? 0) > 2 ? 'text-[#D97706]' : 'text-[#8A8A85]'
                    )}>
                      {scan.issues?.length ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className={cn(
                      'status-badge text-[10px]',
                      scan.status === 'completed' ? 'active' :
                      scan.status === 'failed' ? 'error' : 'pending'
                    )}>
                      {scan.status === 'completed' ? 'Completed' :
                       scan.status === 'failed' ? 'Failed' :
                       scan.status === 'running' ? 'Running' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className="text-[12px] text-[#8A8A85]">
                      {getTimeAgo(new Date(scan.createdAt))}
                    </span>
                  </td>
                  <td>
                    <Link href={`/scans/${scan.id}`} className="p-1 hover:bg-[#F5F5F3] rounded inline-flex">
                      <ArrowRight className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[13px] text-[#8A8A85]">No scans found.</p>
          </div>
        )}
      </div>
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
