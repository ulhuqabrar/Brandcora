'use client';

import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  ArrowsClockwise,
  ArrowUUpLeft,
  Download,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { BrandSubNav } from '@/components/brand-sub-nav';

const VERSIONS = [
  {
    version: 'v2',
    date: '2 hours ago',
    source: 'seocontent.ai',
    changes: 3,
    approvedBy: 'Sajibur',
    status: 'active',
    details: [
      { type: 'color', change: 'Primary color updated #E85D40 → #FF5F45' },
      { type: 'logo', change: 'Logo lockup repositioned centered → left' },
      { type: 'token', change: 'Added 2 new spacing tokens' },
    ],
  },
  {
    version: 'v1',
    date: '1 week ago',
    source: 'seocontent.ai',
    changes: 12,
    approvedBy: 'Sajibur',
    status: 'archived',
    details: [
      { type: 'color', change: 'Initial color palette detected (11 colors)' },
      { type: 'font', change: 'Typography system extracted (3 families)' },
      { type: 'logo', change: 'Logo assets extracted (6 variants)' },
    ],
  },
];

export default function VersionsPage() {
  return (
    <div className="space-y-5">
      <BrandSubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Version History</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{VERSIONS.length} versions recorded</p>
        </div>
      </div>

      <div className="space-y-3">
        {VERSIONS.map((v, i) => (
          <div key={v.version} className="dash-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-[14px] font-bold',
                  v.status === 'active' ? 'bg-[#FF5F45] text-white' : 'bg-[#F5F5F3] text-[#8A8A85]'
                )}>
                  {v.version}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#1A1918]">Version {v.version}</span>
                    {v.status === 'active' && (
                      <span className="status-badge active text-[10px]">
                        <span className="status-dot active" /> Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[12px] text-[#8A8A85]">{v.date}</span>
                    <span className="text-[12px] text-[#8A8A85]">Source: {v.source}</span>
                    <span className="text-[12px] text-[#8A8A85]">{v.changes} changes</span>
                    <span className="text-[12px] text-[#8A8A85]">by {v.approvedBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-[12px]">
                  <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" /> Compare
                </button>
                {v.status !== 'active' && (
                  <button className="btn-ghost text-[12px]">
                    <ArrowUUpLeft className="h-3.5 w-3.5" weight="bold" /> Restore
                  </button>
                )}
                <button className="btn-ghost text-[12px]">
                  <Download className="h-3.5 w-3.5" weight="bold" /> Export
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              {v.details.map((d, j) => (
                <div key={j} className="flex items-center gap-2 py-1.5 border-t border-[#F5F5F3]">
                  <span className="text-[10px] font-medium text-[#8A8A85] uppercase bg-[#F5F5F3] px-1.5 py-0.5 rounded w-12 text-center">
                    {d.type}
                  </span>
                  <span className="text-[12px] text-[#3D3D3A]">{d.change}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
