'use client';

import { useState } from 'react';
import {
  Copy,
  PencilSimple,
  Spinner,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import { apiFetch } from '@/lib/api';
import { useBrandProfile } from '@/lib/brand-profile-context';

interface BrandColor {
  id: string;
  name: string;
  hexValue: string;
  role: string | null;
}

interface BrandGradient {
  id: string;
  name: string;
  originalValue: string;
  normalizedValue: string;
}

export default function ColorsPage() {
  const { profile, loading, refresh } = useBrandProfile();
  const [colors, setColors] = useState(profile?.colors || []);
  const [copied, setCopied] = useState(false);

  // Sync colors when profile loads
  if (profile && colors.length === 0 && profile.colors.length > 0) {
    setColors(profile.colors);
  }

  const gradients = profile?.gradients || [];

  const handleDeleteColor = async (id: string) => {
    try {
      await apiFetch(`/api/v1/brand-profile/colors/${id}`, { method: 'DELETE' });
      setColors(c => c.filter(x => x.id !== id));
    } catch { /* ignore */ }
  };

  const handleCopyCSS = () => {
    const css = colors.map(c => `  --color-${c.name.toLowerCase().replace(/\s+/g, '-')}: ${c.hexValue};`).join('\n');
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const grouped = colors.reduce((acc, c) => {
    const cat = c.role || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {} as Record<string, BrandColor[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Colors</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{colors.length} color tokens detected</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyCSS} className="btn-secondary text-[12px]">
            <Copy className="h-3.5 w-3.5" weight="bold" /> {copied ? 'Copied!' : 'Copy CSS'}
          </button>
        </div>
      </div>

      {colors.length === 0 ? (
        <div className="dash-card text-center py-8">
          <p className="text-[13px] text-[#8A8A85] mb-4">No colors detected yet.</p>
          <a href="/brand/scan" className="btn-primary text-[12px]">Run a scan</a>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catColors]) => (
          <div key={category} className="dash-card">
            <div className="dash-card-title mb-3 capitalize">{category}</div>
            <div className="grid grid-cols-2 gap-2">
              {catColors.map((c) => (
                <div key={c.id} className="color-swatch">
                  <div className="color-swatch-preview" style={{ backgroundColor: c.hexValue }} />
                  <div className="color-swatch-info">
                    <div className="color-swatch-name">{c.name}</div>
                    <div className="color-swatch-hex">{c.hexValue}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(c.hexValue)}
                    className="p-1 hover:bg-[#F5F5F3] rounded"
                    title="Copy"
                  >
                    <Copy className="h-3 w-3 text-[#C4C4BF]" weight="bold" />
                  </button>
                  <button
                    onClick={() => handleDeleteColor(c.id)}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash className="h-3 w-3 text-[#DC2626]" weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {gradients.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-title mb-3">Gradients</div>
          <div className="space-y-2">
            {gradients.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg border border-[#F0F0EE]">
                <div className="w-20 h-8 rounded-md" style={{ background: g.normalizedValue }} />
                <div className="flex-1">
                  <div className="text-[12px] font-medium text-[#3D3D3A]">{g.name}</div>
                  <div className="text-[11px] font-mono text-[#8A8A85] truncate">{g.originalValue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
