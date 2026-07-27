'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowsClockwise,
  Download,
  CheckCircle,
  Warning,
  Spinner,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { BrandSubNav } from '@/components/brand-sub-nav';
import { apiFetch } from '@/lib/api';

interface ScanVersion {
  id: string;
  status: string;
  overallScore: number | null;
  sourceUrl: string | null;
  sourceFileUrl: string | null;
  scanType: string;
  createdAt: string;
  completedAt: string | null;
  issues: Array<{ category: string; title: string }>;
}

export default function VersionsPage() {
  const [versions, setVersions] = useState<ScanVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/scans?limit=20')
      .then(r => r.json())
      .then(d => {
        if (d.success) setVersions(d.data.scans || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Version History</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{versions.length} scans recorded</p>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="dash-card text-center py-8">
          <p className="text-[13px] text-[#8A8A85] mb-4">No scans yet.</p>
          <a href="/brand/scan" className="btn-primary text-[12px]">Run first scan</a>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v, i) => {
            const hostname = v.sourceUrl ? (() => {
              try { return new URL(v.sourceUrl).hostname.replace('www.', ''); }
              catch { return v.sourceUrl; }
            })() : 'Social upload';

            const colorCategories = [...new Set(v.issues.filter(i => i.category === 'colors').map(i => i.title))];
            const fontCategories = [...new Set(v.issues.filter(i => i.category === 'typography').map(i => i.title))];
            const logoCategories = [...new Set(v.issues.filter(i => i.category === 'logo').map(i => i.title))];

            return (
              <div key={v.id} className="dash-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-[14px] font-bold',
                      i === 0 ? 'bg-[#FF5F45] text-white' : 'bg-[#F5F5F3] text-[#8A8A85]'
                    )}>
                      v{versions.length - i}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-[#1A1918]">Version {versions.length - i}</span>
                        {i === 0 && (
                          <span className="status-badge active text-[10px]">
                            <span className="status-dot active" /> Latest
                          </span>
                        )}
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded',
                          v.status === 'completed' ? 'bg-green-50 text-[#16A34A]' :
                          v.status === 'failed' ? 'bg-red-50 text-[#DC2626]' : 'bg-yellow-50 text-[#F59E0B]'
                        )}>
                          {v.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[12px] text-[#8A8A85]">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[12px] text-[#8A8A85]">Source: {hostname}</span>
                        <span className="text-[12px] text-[#8A8A85]">{v.issues.length} issues</span>
                        {v.overallScore != null && (
                          <span className="text-[12px] font-medium text-[#3D3D3A]">{Math.round(v.overallScore)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/scans/${v.id}`} className="btn-ghost text-[12px]">
                      View <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                    </Link>
                  </div>
                </div>
                {(colorCategories.length > 0 || fontCategories.length > 0 || logoCategories.length > 0) && (
                  <div className="space-y-1.5">
                    {colorCategories.slice(0, 2).map((c, j) => (
                      <div key={`c${j}`} className="flex items-center gap-2 py-1.5 border-t border-[#F5F5F3]">
                        <span className="text-[10px] font-medium text-[#8A8A85] uppercase bg-[#FF5F45]/10 text-[#FF5F45] px-1.5 py-0.5 rounded w-12 text-center">
                          color
                        </span>
                        <span className="text-[12px] text-[#3D3D3A]">{c}</span>
                      </div>
                    ))}
                    {fontCategories.slice(0, 2).map((f, j) => (
                      <div key={`f${j}`} className="flex items-center gap-2 py-1.5 border-t border-[#F5F5F3]">
                        <span className="text-[10px] font-medium text-[#8A8A85] uppercase bg-[#FF8A5B]/10 text-[#FF8A5B] px-1.5 py-0.5 rounded w-12 text-center">
                          font
                        </span>
                        <span className="text-[12px] text-[#3D3D3A]">{f}</span>
                      </div>
                    ))}
                    {logoCategories.slice(0, 1).map((l, j) => (
                      <div key={`l${j}`} className="flex items-center gap-2 py-1.5 border-t border-[#F5F5F3]">
                        <span className="text-[10px] font-medium text-[#8A8A85] uppercase bg-[#F2B84B]/10 text-[#F2B84B] px-1.5 py-0.5 rounded w-12 text-center">
                          logo
                        </span>
                        <span className="text-[12px] text-[#3D3D3A]">{l}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
