'use client';

import { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  CheckCircle,
  Warning,
  Spinner,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useBrandProfile } from '@/lib/brand-profile-context';

interface Token {
  name: string;
  value: string;
  preview: string;
  type: string;
  status: string;
}

export default function TokensPage() {
  const { profile, loading } = useBrandProfile();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const tokens = useMemo(() => {
    if (!profile) return [];
    const all: Token[] = [];

    (profile.colors || []).forEach((c: any) => {
      all.push({
        name: `color.${c.name.toLowerCase().replace(/\s+/g, '-')}`,
        value: c.hexValue,
        preview: c.hexValue,
        type: 'color',
        status: 'approved',
      });
    });

    (profile.fonts || []).forEach((f: any) => {
      all.push({
        name: `font.${f.role || f.name.toLowerCase().replace(/\s+/g, '-')}`,
        value: f.family,
        preview: '',
        type: 'font',
        status: 'approved',
      });
    });

    all.push({
      name: 'spacing.base',
      value: profile.spacingPreference || 'comfortable',
      preview: '',
      type: 'spacing',
      status: 'approved',
    });

    if (profile.borderRadius != null) {
      all.push({
        name: 'radius.default',
        value: `${profile.borderRadius}px`,
        preview: '',
        type: 'radius',
        status: 'approved',
      });
    }

    return all;
  }, [profile]);

  const filtered = tokens.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && t.type !== filter) return false;
    return true;
  });

  const handleExport = () => {
    const json: Record<string, any> = {};
    tokens.forEach(t => { json[t.name] = t.value; });
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-tokens.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    const lines = tokens.map(t => `  "${t.name}": "${t.value}"`);
    navigator.clipboard.writeText(`{\n${lines.join(',\n')}\n}`);
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Design Tokens</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">{tokens.length} tokens generated from your brand profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyAll} className="btn-secondary text-[12px]">
            <Copy className="h-3.5 w-3.5" weight="bold" /> Copy all
          </button>
          <button onClick={handleExport} className="btn-secondary text-[12px]">
            <Download className="h-3.5 w-3.5" weight="bold" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-[280px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="input-compact"
          />
        </div>
        <div className="flex items-center gap-1">
          {['color', 'font', 'spacing', 'radius'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? null : type)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors',
                filter === type
                  ? 'bg-[#1A1918] text-white'
                  : 'bg-[#F5F5F3] text-[#6B6B66] hover:bg-[#ECECEA]'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Token Table */}
      <div className="dash-card p-0 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((token) => (
              <tr key={token.name}>
                <td>
                  <span className="font-mono text-[12px] text-[#1A1918]">{token.name}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {token.preview && (
                      <div className="w-4 h-4 rounded border border-[#E8E8E6]" style={{ backgroundColor: token.preview }} />
                    )}
                    <span className="font-mono text-[12px] text-[#3D3D3A]">{token.value}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[11px] font-medium text-[#8A8A85] uppercase">{token.type}</span>
                </td>
                <td>
                  <span className="status-badge active text-[10px]">
                    <CheckCircle className="h-3 w-3" weight="bold" /> Approved
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => navigator.clipboard.writeText(`"${token.name}": "${token.value}"`)}
                    className="p-1 hover:bg-[#F5F5F3] rounded"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#C4C4BF]" weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
