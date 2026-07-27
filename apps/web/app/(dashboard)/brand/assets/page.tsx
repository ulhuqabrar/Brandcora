'use client';

import { useState, useEffect } from 'react';
import {
  CirclesFour,
  Download,
  Plus,
  Eye,
  Trash,
  Spinner,
} from '@phosphor-icons/react';
import { BrandSubNav } from '@/components/brand-sub-nav';
import { apiFetch } from '@/lib/api';

interface BrandLogo {
  id: string;
  fileUrl: string;
  storageKey: string;
  logoType: string | null;
  backgroundType: string | null;
  width: number | null;
  height: number | null;
}

export default function AssetsPage() {
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/brand-profile')
      .then(r => r.json())
      .then(d => {
        if (d.success) setLogos(d.data.logos || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/v1/brand-profile/logos/${id}`, { method: 'DELETE' });
      setLogos(l => l.filter(x => x.id !== id));
    } catch { /* ignore */ }
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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Assets</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{logos.length} logo and icon variants</p>
        </div>
      </div>

      {logos.length === 0 ? (
        <div className="dash-card text-center py-8">
          <p className="text-[13px] text-[#8A8A85] mb-4">No logos uploaded yet.</p>
          <a href="/brand/extract" className="btn-primary text-[12px]">Extract from website</a>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {logos.map((logo) => (
            <div key={logo.id} className="dash-card">
              <div
                className="h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: logo.backgroundType === 'dark' ? '#1A1918' : '#FAFAF9' }}
              >
                <img src={logo.fileUrl} alt={logo.logoType || 'Logo'} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-[#1A1918]">{logo.logoType || 'Logo'}</div>
                  <div className="text-[11px] text-[#8A8A85]">
                    {logo.width && logo.height ? `${logo.width}×${logo.height}` : 'Unknown size'}
                    {logo.backgroundType ? ` · ${logo.backgroundType}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a href={logo.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[#F5F5F3] rounded" title="View">
                    <Eye className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                  </a>
                  <a href={logo.fileUrl} download className="p-1 hover:bg-[#F5F5F3] rounded" title="Download">
                    <Download className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                  </a>
                  <button onClick={() => handleDelete(logo.id)} className="p-1 hover:bg-red-50 rounded" title="Delete">
                    <Trash className="h-3.5 w-3.5 text-[#DC2626]" weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
