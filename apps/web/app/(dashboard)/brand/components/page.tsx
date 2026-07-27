'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';
import { apiFetch } from '@/lib/api';

interface BrandColor {
  hexValue: string;
}

interface BrandFont {
  family: string;
}

export default function ComponentsPage() {
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [fonts, setFonts] = useState<BrandFont[]>([]);
  const [borderRadius, setBorderRadius] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/brand-profile')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setColors(d.data.colors || []);
          setFonts(d.data.fonts || []);
          setBorderRadius(d.data.borderRadius ?? 8);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const primaryColor = colors[0]?.hexValue || '#1A1918';
  const bodyFont = fonts.find(f => f.family.toLowerCase().includes('inter'))?.family || fonts[0]?.family || 'Inter';

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

  const components = [
    {
      name: 'Primary button',
      preview: (
        <button
          className="h-9 px-4 text-white text-[13px] font-semibold"
          style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}
        >
          Button
        </button>
      ),
    },
    {
      name: 'Secondary button',
      preview: (
        <button
          className="h-9 px-4 bg-white border border-[#E8E8E6] text-[#3D3D3A] text-[13px] font-medium"
          style={{ borderRadius: `${borderRadius}px` }}
        >
          Button
        </button>
      ),
    },
    {
      name: 'Input field',
      preview: (
        <input
          type="text"
          placeholder="Placeholder"
          className="h-9 px-3 border border-[#E8E8E6] text-[13px] w-32"
          style={{ fontFamily: bodyFont, borderRadius: `${borderRadius}px` }}
          readOnly
        />
      ),
    },
    {
      name: 'Card',
      preview: (
        <div
          className="w-24 h-16 border border-[#ECECEA] bg-white p-2"
          style={{ borderRadius: `${borderRadius}px` }}
        >
          <div className="w-8 h-1.5 bg-[#F5F5F3] rounded mb-1.5" style={{ borderRadius: `${borderRadius / 2}px` }} />
          <div className="w-16 h-1 bg-[#F0F0EE] rounded" style={{ borderRadius: `${borderRadius / 2}px` }} />
        </div>
      ),
    },
    {
      name: 'Badge',
      preview: (
        <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#16A34A] text-[11px] font-semibold" style={{ borderRadius: `${borderRadius / 2}px` }}>
          Active
        </span>
      ),
    },
    {
      name: 'Avatar',
      preview: (
        <div
          className="w-8 h-8 text-white flex items-center justify-center text-[11px] font-bold"
          style={{ backgroundColor: primaryColor, borderRadius: '50%' }}
        >
          AB
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <BrandSubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Components</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{components.length} component patterns derived from your brand</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {components.map((comp) => (
          <div key={comp.name} className="dash-card">
            <div className="h-24 rounded-lg bg-[#FAFAF9] mb-3 flex items-center justify-center">
              {comp.preview}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-medium text-[#1A1918]">{comp.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
