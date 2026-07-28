'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  TrendUp,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Spinner,
  Globe,
  FileImage,
  MagnifyingGlass,
  Clock,
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

type FilterType = 'all' | 'website' | 'social';

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All scans' },
  { key: 'website', label: 'Website' },
  { key: 'social', label: 'Social' },
];

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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
    const matchesFilter = activeFilter === 'all' || s.scanType === activeFilter;
    if (!matchesFilter) return false;
    if (!search) return true;
    const hostname = s.sourceUrl ? (() => {
      try { return new URL(s.sourceUrl).hostname.replace('www.', ''); }
      catch { return s.sourceUrl; }
    })() : '';
    return hostname.toLowerCase().includes(search.toLowerCase()) ||
           s.scanType.toLowerCase().includes(search.toLowerCase()) ||
           (s.platform || '').toLowerCase().includes(search.toLowerCase());
  });

  const completedScans = scans.filter(s => s.status === 'completed' || s.status === 'completed_with_warnings');
  const avgScore = completedScans.length > 0
    ? Math.round(completedScans.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completedScans.length)
    : 0;
  const totalIssues = scans.reduce((sum, s) => sum + (s.issues?.length ?? 0), 0);

  const websiteCount = scans.filter(s => s.scanType === 'website').length;
  const socialCount = scans.filter(s => s.scanType === 'social').length;

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'all') return scans.length;
    if (filter === 'website') return websiteCount;
    return socialCount;
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

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Filter Tabs + Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[#F5F5F3] rounded-lg p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveFilter(tab.key); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
                activeFilter === tab.key
                  ? 'bg-white text-[#1A1918] shadow-sm'
                  : 'text-[#8A8A85] hover:text-[#3D3D3A]'
              )}
            >
              {tab.key === 'website' && <Globe className="h-3 w-3" weight="bold" />}
              {tab.key === 'social' && <FileImage className="h-3 w-3" weight="bold" />}
              {tab.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                activeFilter === tab.key
                  ? 'bg-[#FF5F45]/10 text-[#FF5F45]'
                  : 'bg-[#ECECEA] text-[#8A8A85]'
              )}>
                {getFilterCount(tab.key)}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans..."
            className="input-compact h-8 text-[12px] w-52 pl-8"
          />
        </div>
      </div>

      {/* Scan Cards Grid */}
      {filtered.length === 0 ? (
        <div className="dash-card flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-xl bg-[#F5F5F3] flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-[#C4C4BF]" weight="bold" />
          </div>
          <p className="text-[14px] font-medium text-[#3D3D3A] mb-1">No scans found</p>
          <p className="text-[12px] text-[#8A8A85] mb-4">
            {search ? 'Try a different search term' : 'Run your first brand consistency scan'}
          </p>
          {!search && (
            <Link href="/scans/new" className="btn-primary text-[12px]">
              <Plus className="h-3.5 w-3.5" weight="bold" />
              New scan
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((scan) => {
            const hostname = scan.sourceUrl ? (() => {
              try { return new URL(scan.sourceUrl).hostname.replace('www.', ''); }
              catch { return scan.sourceUrl; }
            })() : null;

            const scoreColor = (scan.overallScore ?? 0) >= 80 ? '#16A34A' :
                               (scan.overallScore ?? 0) >= 60 ? '#D97706' : '#DC2626';

            const issueCount = scan.issues?.length ?? 0;

            return (
              <Link
                key={scan.id}
                href={`/scans/${scan.id}`}
                className="dash-card group cursor-pointer hover:border-[#FF5F45]/30 hover:shadow-[0_2px_12px_rgba(255,95,69,0.08)] transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      scan.scanType === 'website' ? 'bg-blue-50' : 'bg-purple-50'
                    )}>
                      {scan.scanType === 'website' ? (
                        <Globe className="h-4 w-4 text-blue-600" weight="bold" />
                      ) : (
                        <FileImage className="h-4 w-4 text-purple-600" weight="bold" />
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
                      scan.scanType === 'website' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    )}>
                      {scan.scanType}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#C4C4BF] group-hover:text-[#FF5F45] group-hover:translate-x-0.5 transition-all" weight="bold" />
                </div>

                {/* Source */}
                <div className="mb-3">
                  {hostname ? (
                    <div className="text-[14px] font-semibold text-[#1A1918] truncate group-hover:text-[#FF5F45] transition-colors">
                      {hostname}
                    </div>
                  ) : (
                    <div className="text-[14px] font-semibold text-[#1A1918] truncate group-hover:text-[#FF5F45] transition-colors">
                      {scan.platform || 'Social Design'}
                    </div>
                  )}
                  {scan.brandProfile?.name && (
                    <div className="text-[11px] text-[#8A8A85] mt-0.5">{scan.brandProfile.name}</div>
                  )}
                </div>

                {/* Score + Stats Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F3]">
                  <div className="flex items-center gap-3">
                    {/* Score */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${scoreColor}12` }}>
                        <span className="text-[12px] font-bold" style={{ color: scoreColor }}>
                          {scan.overallScore != null ? Math.round(scan.overallScore) : '—'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#C4C4BF]">/100</span>
                    </div>
                    {/* Issues */}
                    <div className="flex items-center gap-1">
                      <WarningCircle className={cn(
                        'h-3.5 w-3.5',
                        issueCount > 5 ? 'text-[#DC2626]' : issueCount > 2 ? 'text-[#D97706]' : 'text-[#C4C4BF]'
                      )} weight="bold" />
                      <span className={cn(
                        'text-[11px] font-medium',
                        issueCount > 5 ? 'text-[#DC2626]' : issueCount > 2 ? 'text-[#D97706]' : 'text-[#8A8A85]'
                      )}>
                        {issueCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#C4C4BF]" weight="bold" />
                    <span className="text-[11px] text-[#8A8A85]">{getTimeAgo(new Date(scan.createdAt))}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  <span className={cn(
                    'status-badge text-[10px]',
                    scan.status === 'completed' ? 'active' :
                    scan.status === 'failed' ? 'error' : 'pending'
                  )}>
                    {scan.status === 'completed' ? 'Completed' :
                     scan.status === 'completed_with_warnings' ? 'Completed' :
                     scan.status === 'failed' ? 'Failed' :
                     scan.status === 'running' ? 'Running' : 'Pending'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-[12px] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[12px] text-[#8A8A85]">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={filtered.length < 20}
            className="btn-secondary text-[12px] disabled:opacity-40"
          >
            Next
          </button>
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
