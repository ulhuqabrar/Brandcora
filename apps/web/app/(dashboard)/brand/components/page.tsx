'use client';

import Link from 'next/link';
import {
  ArrowRight,
} from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';

const COMPONENTS = [
  {
    name: 'Primary button',
    usage: 18,
    preview: (
      <button className="h-9 px-4 rounded-lg bg-[#1A1918] text-white text-[13px] font-semibold">
        Button
      </button>
    ),
  },
  {
    name: 'Secondary button',
    usage: 12,
    preview: (
      <button className="h-9 px-4 rounded-lg bg-white border border-[#E8E8E6] text-[#3D3D3A] text-[13px] font-medium">
        Button
      </button>
    ),
  },
  {
    name: 'Input field',
    usage: 8,
    preview: (
      <input
        type="text"
        placeholder="Placeholder"
        className="h-9 px-3 rounded-lg border border-[#E8E8E6] text-[13px] w-32"
        readOnly
      />
    ),
  },
  {
    name: 'Card',
    usage: 15,
    preview: (
      <div className="w-24 h-16 rounded-lg border border-[#ECECEA] bg-white p-2">
        <div className="w-8 h-1.5 bg-[#F5F5F3] rounded mb-1.5" />
        <div className="w-16 h-1 bg-[#F0F0EE] rounded" />
      </div>
    ),
  },
  {
    name: 'Badge',
    usage: 6,
    preview: (
      <span className="px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] text-[11px] font-semibold">
        Active
      </span>
    ),
  },
  {
    name: 'Avatar',
    usage: 4,
    preview: (
      <div className="w-8 h-8 rounded-full bg-[#1A1918] text-white flex items-center justify-center text-[11px] font-bold">
        AB
      </div>
    ),
  },
];

export default function ComponentsPage() {
  return (
    <div className="space-y-5">
      <BrandSubNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Components</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{COMPONENTS.length} detected component patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COMPONENTS.map((comp) => (
          <div key={comp.name} className="dash-card">
            <div className="h-24 rounded-lg bg-[#FAFAF9] mb-3 flex items-center justify-center">
              {comp.preview}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-medium text-[#1A1918]">{comp.name}</div>
              <span className="text-[11px] text-[#8A8A85]">{comp.usage}×</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
