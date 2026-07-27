'use client';

import { useState, useEffect } from 'react';
import {
  Copy,
  Spinner,
} from '@phosphor-icons/react';
import { apiFetch } from '@/lib/api';

export default function LayoutPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/brand-profile')
      .then(r => r.json())
      .then(d => {
        if (d.success) setProfile(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const borderRadius = profile?.borderRadius ?? 8;
  const spacingPref = profile?.spacingPreference || 'comfortable';

  const SPACING = spacingPref === 'compact'
    ? [2, 4, 8, 12, 16, 24, 32, 48]
    : spacingPref === 'spacious'
    ? [4, 8, 16, 24, 32, 48, 64, 96]
    : [4, 8, 12, 16, 24, 32, 48, 64];

  const RADIUS = [
    { label: 'sm', value: `${Math.max(borderRadius / 2, 2)}px` },
    { label: 'md', value: `${borderRadius}px` },
    { label: 'lg', value: `${borderRadius * 1.5}px` },
    { label: 'xl', value: `${borderRadius * 2}px` },
  ];

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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Layout</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">Spacing, radius, borders, and shadows</p>
        </div>
      </div>

      {/* Spacing */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Spacing scale</div>
        <div className="space-y-2">
          {SPACING.map((px) => (
            <div key={px} className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-[#8A8A85] w-8">{px}px</span>
              <div className="spacing-bar" style={{ width: `${Math.min(px * 3, 192)}px` }} />
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
          {[
            { name: 'Default', value: '1px solid #E8E8E6', token: 'border.default' },
            { name: 'Strong', value: '1px solid #D8D8D5', token: 'border.strong' },
            { name: 'Focus ring', value: `2px solid #FF5F45`, token: 'border.focus' },
          ].map((b) => (
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
          {[
            { name: 'Subtle', value: '0 1px 3px rgba(0,0,0,0.04)', token: 'shadow.sm' },
            { name: 'Medium', value: '0 4px 12px rgba(0,0,0,0.06)', token: 'shadow.md' },
            { name: 'Large', value: '0 8px 24px rgba(0,0,0,0.08)', token: 'shadow.lg' },
          ].map((s) => (
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
