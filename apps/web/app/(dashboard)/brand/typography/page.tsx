'use client';

import { useState, useEffect } from 'react';
import {
  Copy,
  Spinner,
} from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';
import { apiFetch } from '@/lib/api';

interface BrandFont {
  id: string;
  name: string;
  family: string;
  role: string | null;
  weight: number | null;
  url: string | null;
}

export default function TypographyPage() {
  const [fonts, setFonts] = useState<BrandFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch('/api/v1/brand-profile')
      .then(r => r.json())
      .then(d => {
        if (d.success) setFonts(d.data.fonts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCSS = () => {
    const css = fonts.map(f => `  --font-${f.role || f.name.toLowerCase().replace(/\s+/g, '-')}: '${f.family}', sans-serif;`).join('\n');
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <BrandSubNav />
        <div className="dash-card flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-[#FF5F45] animate-spin" weight="bold" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <BrandSubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Typography</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{fonts.length} font families detected</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyCSS} className="btn-secondary text-[12px]">
            <Copy className="h-3.5 w-3.5" weight="bold" /> {copied ? 'Copied!' : 'Copy CSS'}
          </button>
        </div>
      </div>

      {fonts.length === 0 ? (
        <div className="dash-card text-center py-8">
          <p className="text-[13px] text-[#8A8A85] mb-4">No fonts detected yet.</p>
          <a href="/brand/scan" className="btn-primary text-[12px]">Run a scan</a>
        </div>
      ) : (
        fonts.map((font) => (
          <div key={font.id} className="dash-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[15px] font-semibold text-[#1A1918]">{font.name}</div>
                <div className="text-[12px] text-[#8A8A85]">{font.role || 'Body'} · Weight {font.weight || 400}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8A8A85] bg-[#F5F5F3] px-1.5 py-0.5 rounded">
                  {font.family}
                </span>
                {font.weight && (
                  <span className="text-[10px] font-mono text-[#8A8A85] bg-[#F5F5F3] px-1.5 py-0.5 rounded">
                    {font.weight}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-[#F0F0EE]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-[#8A8A85] uppercase tracking-wider">Preview</span>
                  <span className="text-[10px] font-mono text-[#C4C4BF]">{font.weight || 400}</span>
                </div>
                <div
                  style={{
                    fontFamily: font.family,
                    fontSize: '18px',
                    fontWeight: font.weight || 400,
                    lineHeight: '1.4',
                    color: '#1A1918',
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
