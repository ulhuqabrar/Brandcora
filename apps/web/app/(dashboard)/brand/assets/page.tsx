'use client';

import Link from 'next/link';
import {
  CirclesFour,
  Download,
  PencilSimple,
  Plus,
  Eye,
} from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';

const ASSETS = [
  { name: 'Primary mark', type: 'SVG', size: '—', pages: 12, bg: 'white' },
  { name: 'Wordmark dark', type: 'SVG', size: '—', pages: 8, bg: '#1A1918' },
  { name: 'Wordmark light', type: 'SVG', size: '—', pages: 3, bg: '#FAFAF9' },
  { name: 'Icon only', type: 'PNG', size: '240×240', pages: 15, bg: 'white' },
  { name: 'Favicon', type: 'ICO', size: '32×32', pages: 18, bg: '#F5F5F3' },
  { name: 'App icon', type: 'PNG', size: '1024×1024', pages: 0, bg: '#F5F5F3' },
];

export default function AssetsPage() {
  return (
    <div className="space-y-5">
      <BrandSubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Assets</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{ASSETS.length} logo and icon variants</p>
        </div>
        <button className="btn-primary text-[12px]">
          <Plus className="h-3.5 w-3.5" weight="bold" /> Upload asset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {ASSETS.map((asset, i) => (
          <div key={i} className="dash-card">
            <div
              className="h-32 rounded-lg mb-3 flex items-center justify-center"
              style={{ backgroundColor: asset.bg }}
            >
              <CirclesFour className="h-10 w-10 text-[#C4C4BF]" weight="bold" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">{asset.name}</div>
                <div className="text-[11px] text-[#8A8A85]">{asset.type} · {asset.size}</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#C4C4BF]">{asset.pages}p</span>
                <button className="p-1 hover:bg-[#F5F5F3] rounded" title="View">
                  <Eye className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                </button>
                <button className="p-1 hover:bg-[#F5F5F3] rounded" title="Download">
                  <Download className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
