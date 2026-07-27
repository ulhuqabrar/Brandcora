'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share,
  ArrowClockwise,
  DotsThree,
  CheckCircle,
  Warning,
  WarningCircle,
  Palette,
  TextAa,
  CirclesFour,
  Ruler,
  Square,
  Eye,
  MagnifyingGlass,
  FileImage,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const REPORT = {
  id: 'rpt-2',
  name: 'Q3 social campaign',
  brand: 'seocontent.ai',
  channel: 'Instagram',
  score: 64,
  status: 'needs_review',
  createdBy: 'Sajibur',
  date: '1 day ago',
  assetUrl: null,
  categories: [
    { name: 'Logo usage', score: 85, issues: 0, status: 'pass' },
    { name: 'Color accuracy', score: 52, issues: 3, status: 'fail' },
    { name: 'Typography', score: 64, issues: 2, status: 'warn' },
    { name: 'Spacing', score: 71, issues: 1, status: 'warn' },
    { name: 'Radius', score: 90, issues: 0, status: 'pass' },
    { name: 'Contrast', score: 58, issues: 1, status: 'fail' },
  ],
  issues: [
    {
      id: 1,
      severity: 'critical',
      category: 'Color',
      title: 'Primary button uses wrong brand color',
      detected: '#E85D40',
      approved: '#FF5F45',
      location: 'Bottom CTA button',
      status: 'open',
    },
    {
      id: 2,
      severity: 'critical',
      category: 'Color',
      title: 'Background gradient mismatch',
      detected: 'linear-gradient(#FFF, #F5F5F5)',
      approved: 'linear-gradient(#FAF8F5, #F5F0EB)',
      location: 'Full background',
      status: 'open',
    },
    {
      id: 3,
      severity: 'critical',
      category: 'Color',
      title: 'Accent color deviation detected',
      detected: '#F0B840',
      approved: '#F2B84B',
      location: 'Highlight badge',
      status: 'open',
    },
    {
      id: 4,
      severity: 'important',
      category: 'Typography',
      title: 'Heading uses Arial instead of Manrope',
      detected: 'Arial Bold, 44px',
      approved: 'Manrope SemiBold, 48px',
      location: 'Main headline',
      status: 'open',
    },
    {
      id: 5,
      severity: 'important',
      category: 'Typography',
      title: 'Body text weight too light',
      detected: 'Inter Regular, 400',
      approved: 'Inter Medium, 500',
      location: 'Description text',
      status: 'open',
    },
    {
      id: 6,
      severity: 'minor',
      category: 'Spacing',
      title: 'Padding below minimum threshold',
      detected: '12px',
      approved: '16px',
      location: 'Card inner padding',
      status: 'open',
    },
    {
      id: 7,
      severity: 'minor',
      category: 'Contrast',
      title: 'Text contrast ratio below WCAG AA',
      detected: '3.2:1',
      approved: '4.5:1',
      location: 'Subtitle text',
      status: 'open',
    },
  ],
};

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: '#DC2626', label: 'Critical' },
  important: { color: '#D97706', label: 'Important' },
  minor: { color: '#3B82F6', label: 'Minor' },
  suggestion: { color: '#C4C4BF', label: 'Suggestion' },
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? '#16A34A' : s >= 60 ? '#D97706' : '#DC2626';

export default function ReportDetailPage() {
  const params = useParams();
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [view, setView] = useState<'original' | 'annotated'>('annotated');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/scans" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#8A8A85]" weight="bold" />
          </Link>
          <div>
            <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">{REPORT.name}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[12px] text-[#8A8A85]">{REPORT.brand}</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">{REPORT.channel}</span>
              <span className="text-[12px] text-[#8A8A85]">·</span>
              <span className="text-[12px] text-[#8A8A85]">{REPORT.date}</span>
              <span className={cn('status-badge text-[10px]', REPORT.status === 'approved' ? 'active' : 'pending')}>
                {REPORT.status === 'approved' ? 'Approved' : 'Needs review'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-[12px]">
            <Download className="h-3.5 w-3.5" weight="bold" /> Export
          </button>
          <button className="btn-secondary text-[12px]">
            <Share className="h-3.5 w-3.5" weight="bold" /> Share
          </button>
          <button className="btn-secondary text-[12px]">
            <ArrowClockwise className="h-3.5 w-3.5" weight="bold" /> Reanalyze
          </button>
        </div>
      </div>

      {/* Main Content: Preview + Issues Panel */}
      <div className="grid grid-cols-12 gap-5">
        {/* Creative Preview (7 cols) */}
        <div className="col-span-7 dash-card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-[#F5F5F3]">
            <div className="flex items-center gap-1 bg-[#F5F5F3] rounded-lg p-0.5">
              <button
                onClick={() => setView('original')}
                className={cn('px-3 py-1 rounded-md text-[12px] font-medium transition-colors', view === 'original' ? 'bg-white text-[#1A1918] shadow-sm' : 'text-[#8A8A85]')}
              >
                Original
              </button>
              <button
                onClick={() => setView('annotated')}
                className={cn('px-3 py-1 rounded-md text-[12px] font-medium transition-colors', view === 'annotated' ? 'bg-white text-[#1A1918] shadow-sm' : 'text-[#8A8A85]')}
              >
                Annotated
              </button>
            </div>
          </div>
          <div className="relative bg-[#F5F5F3] aspect-[4/3] flex items-center justify-center">
            {/* Placeholder for creative preview */}
            <div className="text-center">
              <FileImage className="h-16 w-16 text-[#D8D8D5] mx-auto mb-3" weight="bold" />
              <span className="text-[13px] text-[#8A8A85]">Creative preview</span>
            </div>
            {/* Annotation markers */}
            {view === 'annotated' && REPORT.issues.map((issue, i) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                className={cn(
                  'annotation-marker',
                  selectedIssue === issue.id && 'ring-2 ring-offset-2 ring-[#FF5F45]'
                )}
                style={{
                  top: `${20 + (i * 12)}%`,
                  left: `${15 + (i * 10)}%`,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Report Panel (5 cols) */}
        <div className="col-span-5 space-y-4">
          {/* Score */}
          <div className="dash-card">
            <div className="text-[12px] text-[#8A8A85] mb-2">Brand alignment</div>
            <div className="flex items-end gap-2">
              <span className="score-large" style={{ color: SCORE_COLOR(REPORT.score) }}>
                {REPORT.score}
              </span>
              <span className="text-[14px] text-[#C4C4BF] mb-1">/100</span>
            </div>
            <div className="mt-3 space-y-2">
              {REPORT.categories.map((cat) => (
                <div key={cat.name} className="score-category">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#3D3D3A]">{cat.name}</span>
                    {cat.issues > 0 && (
                      <span className="text-[10px] font-medium text-[#8A8A85] bg-[#F5F5F3] px-1.5 py-0.5 rounded">
                        {cat.issues}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="score-bar">
                      <div className="score-bar-fill" style={{ width: `${cat.score}%`, backgroundColor: SCORE_COLOR(cat.score) }} />
                    </div>
                    <span className="text-[12px] font-semibold w-7 text-right" style={{ color: SCORE_COLOR(cat.score) }}>
                      {cat.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title">Issues ({REPORT.issues.length})</div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {REPORT.issues.map((issue, i) => {
                const sev = SEVERITY_CONFIG[issue.severity];
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className={cn(
                      'issue-row w-full text-left',
                      selectedIssue === issue.id && 'border-[#FF5F45] bg-[#FF5F45]/[0.02]'
                    )}
                  >
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
                      <div className="text-[11px] text-[#8A8A85]">
                        <span className="font-mono text-[#DC2626]">{issue.detected}</span>
                        {' → '}
                        <span className="font-mono text-[#16A34A]">{issue.approved}</span>
                      </div>
                      <div className="text-[11px] text-[#C4C4BF] mt-0.5">{issue.location}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
