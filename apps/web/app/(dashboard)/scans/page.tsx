'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Lock,
  MagnifyingGlass,
  Fingerprint,
  TrendUp,
  CheckCircle,
  Warning,
  WarningCircle,
  ArrowRight,
  Clock,
  Funnel,
  Sliders,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const REPORTS = [
  {
    id: 'rpt-1',
    name: 'Homepage redesign v3',
    brand: 'seocontent.ai',
    channel: 'Website',
    score: 92,
    issues: 2,
    status: 'approved',
    createdBy: 'Sajibur',
    date: '2 hours ago',
  },
  {
    id: 'rpt-2',
    name: 'Q3 social campaign',
    brand: 'seocontent.ai',
    channel: 'Instagram',
    score: 64,
    issues: 7,
    status: 'needs_review',
    createdBy: 'Sajibur',
    date: '1 day ago',
  },
  {
    id: 'rpt-3',
    name: 'Product page audit',
    brand: 'seocontent.ai',
    channel: 'Website',
    score: 78,
    issues: 4,
    status: 'needs_review',
    createdBy: 'Sajibur',
    date: '3 days ago',
  },
  {
    id: 'rpt-4',
    name: 'Email newsletter banner',
    brand: 'seocontent.ai',
    channel: 'Email',
    score: 88,
    issues: 1,
    status: 'approved',
    createdBy: 'Sajibur',
    date: '5 days ago',
  },
  {
    id: 'rpt-5',
    name: 'LinkedIn ad creative',
    brand: 'seocontent.ai',
    channel: 'LinkedIn',
    score: 71,
    issues: 5,
    status: 'changes_requested',
    createdBy: 'Sajibur',
    date: '1 week ago',
  },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'active' },
  needs_review: { label: 'Needs review', className: 'pending' },
  changes_requested: { label: 'Changes requested', className: 'error' },
  processing: { label: 'Processing', className: 'neutral' },
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? '#16A34A' : s >= 60 ? '#D97706' : '#DC2626';

export default function ReportsPage() {
  const [hasIdentity] = useState(true);
  const [search, setSearch] = useState('');

  const filtered = REPORTS.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!hasIdentity) {
    return (
      <div className="space-y-5">
        <div className="dash-card">
          <div className="empty-state">
            <div className="empty-state-icon bg-[#FF5F45]/10">
              <Lock className="h-6 w-6 text-[#FF5F45]" weight="bold" />
            </div>
            <div className="empty-state-title">Brand identity required</div>
            <div className="empty-state-desc">
              Create and approve a brand identity before analyzing creative assets.
            </div>
            <Link href="/brand" className="btn-primary">
              <Fingerprint className="h-4 w-4" weight="bold" />
              Create brand identity
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1918] tracking-tight">Creative reports</h1>
          <p className="text-[13px] text-[#8A8A85] mt-1">
            Upload a creative asset and compare it with your approved brand identity.
          </p>
        </div>
        <Link href="/scans/new" className="btn-primary">
          <Plus className="h-4 w-4" weight="bold" />
          New report
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Reports this month', value: '12', icon: FileText, color: '#FF5F45', change: '+3' },
          { label: 'Average score', value: '79', icon: TrendUp, color: '#16A34A', change: '+4' },
          { label: 'Open issues', value: '8', icon: WarningCircle, color: '#D97706', change: '-2' },
          { label: 'Approved assets', value: '7', icon: CheckCircle, color: '#16A34A', change: '+1' },
        ].map((card) => (
          <div key={card.label} className="dash-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="h-3.5 w-3.5" style={{ color: card.color }} weight="bold" />
              </div>
              <span className="text-[12px] text-[#8A8A85]">{card.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="metric-value text-[24px]">{card.value}</div>
              <span className="metric-change positive text-[11px]">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="dash-card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#F5F5F3]">
          <div className="text-[13px] font-semibold text-[#1A1918]">Recent reports</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="input-compact pl-8 h-8 text-[12px] w-48"
              />
            </div>
            <button className="btn-ghost text-[12px]">
              <Funnel className="h-3.5 w-3.5" weight="bold" /> Filter
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Channel</th>
              <th>Score</th>
              <th>Issues</th>
              <th>Status</th>
              <th>Created by</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => {
              const status = STATUS_MAP[report.status];
              return (
                <tr key={report.id}>
                  <td>
                    <Link href={`/scans/${report.id}`} className="text-[13px] font-medium text-[#1A1918] hover:text-[#FF5F45] transition-colors">
                      {report.name}
                    </Link>
                    <div className="text-[11px] text-[#8A8A85]">{report.brand}</div>
                  </td>
                  <td>
                    <span className="text-[12px] text-[#3D3D3A]">{report.channel}</span>
                  </td>
                  <td>
                    <span className="text-[14px] font-bold" style={{ color: SCORE_COLOR(report.score) }}>
                      {report.score}
                    </span>
                  </td>
                  <td>
                    <span className={cn(
                      'text-[12px] font-medium',
                      report.issues > 5 ? 'text-[#DC2626]' : report.issues > 2 ? 'text-[#D97706]' : 'text-[#8A8A85]'
                    )}>
                      {report.issues}
                    </span>
                  </td>
                  <td>
                    <span className={cn('status-badge text-[10px]', status.className)}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <span className="text-[12px] text-[#8A8A85]">{report.createdBy}</span>
                  </td>
                  <td>
                    <span className="text-[12px] text-[#8A8A85]">{report.date}</span>
                  </td>
                  <td>
                    <Link href={`/scans/${report.id}`} className="p-1 hover:bg-[#F5F5F3] rounded inline-flex">
                      <ArrowRight className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
