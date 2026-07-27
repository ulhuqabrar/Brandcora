'use client';

import Link from 'next/link';
import {
  Copy,
  PencilSimple,
} from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64];
const RADIUS = [
  { label: 'sm', value: '4px' },
  { label: 'md', value: '8px' },
  { label: 'lg', value: '12px' },
  { label: 'xl', value: '16px' },
  { label: '2xl', value: '24px' },
  { label: 'full', value: '9999px' },
];

const BORDERS = [
  { name: 'Default', value: '1px solid #E8E8E6', token: 'border.default' },
  { name: 'Strong', value: '1px solid #D8D8D5', token: 'border.strong' },
  { name: 'Focus ring', value: '2px solid #FF5F45', token: 'border.focus' },
];

const SHADOWS = [
  { name: 'Subtle', value: '0 1px 3px rgba(0,0,0,0.04)', token: 'shadow.sm' },
  { name: 'Medium', value: '0 4px 12px rgba(0,0,0,0.06)', token: 'shadow.md' },
  { name: 'Large', value: '0 8px 24px rgba(0,0,0,0.08)', token: 'shadow.lg' },
];

export default function LayoutPage() {
  return (
    <div className="space-y-5">
      <BrandSubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Layout</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">Spacing, radius, borders, and shadows</p>
        </div>
        <button className="btn-secondary text-[12px]">
          <Copy className="h-3.5 w-3.5" weight="bold" /> Copy all
        </button>
      </div>

      {/* Spacing */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Spacing scale</div>
        <div className="space-y-2">
          {SPACING.map((px) => (
            <div key={px} className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-[#8A8A85] w-8">{px}px</span>
              <div className="spacing-bar" style={{ width: `${Math.min(px * 3, 192)}px` }} />
              <span className="text-[11px] font-mono text-[#C4C4BF] ml-auto">spacing.{px <= 4 ? '1' : px <= 8 ? '2' : px <= 12 ? '3' : px <= 16 ? '4' : px <= 24 ? '6' : px <= 32 ? '8' : px <= 48 ? '12' : '16'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Border radius</div>
        <div className="flex gap-4">
          {RADIUS.map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <div className="radius-box" style={{ borderRadius: r.value }} />
              <div className="text-center">
                <div className="text-[11px] font-medium text-[#3D3D3A]">{r.label}</div>
                <div className="text-[10px] font-mono text-[#8A8A85]">{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Borders */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Borders</div>
        <div className="space-y-2">
          {BORDERS.map((b) => (
            <div key={b.name} className="flex items-center justify-between p-2 rounded-lg border border-[#F0F0EE]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-6 rounded" style={{ border: b.value }} />
                <span className="text-[12px] font-medium text-[#3D3D3A]">{b.name}</span>
              </div>
              <span className="text-[11px] font-mono text-[#8A8A85]">{b.token}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Shadows</div>
        <div className="flex gap-4">
          {SHADOWS.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div className="w-24 h-16 rounded-lg bg-white" style={{ boxShadow: s.value }} />
              <div className="text-center">
                <div className="text-[11px] font-medium text-[#3D3D3A]">{s.name}</div>
                <div className="text-[10px] font-mono text-[#8A8A85]">{s.token}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
