'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';

interface Scan {
  id: string;
  scanType: string;
  status: string;
  overallScore: number | null;
  platform: string | null;
  sourceUrl: string | null;
  createdAt: string;
  brandProfile: { name: string };
}

function getScans(): Scan[] {
  const scans: Scan[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('scan-')) {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        scans.push({
          id: data.id,
          scanType: data.scanType,
          status: data.status,
          overallScore: data.overallScore,
          platform: data.platform,
          sourceUrl: data.sourceUrl,
          createdAt: data.createdAt,
          brandProfile: data.brandProfile,
        });
      } catch { /* ignore */ }
    }
  }
  return scans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function ReportHistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setScans(getScans());
  }, []);

  const filtered = filter === 'all' ? scans : scans.filter(s => s.scanType === filter);

  function getScoreColor(score: number | null): string {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Report History</h1>
          <p className="text-muted-foreground mt-1">View all your brand check reports.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gradient-accent text-white shadow-glass">
            <Link href="/scans/new-social"><Plus className="mr-1.5 h-4 w-4" weight="bold" />New social check</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/scans/new-website">New website check</Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'social', 'website'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              filter === f
                ? 'gradient-accent text-white shadow-glass'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-strong rounded-2xl p-8 shadow-glass">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <MagnifyingGlass className="h-8 w-8 text-primary" weight="bold" />
            </div>
            <h3 className="text-lg font-semibold">No reports yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Run your first brand check to see reports here.
            </p>
            <div className="flex gap-3 mt-4">
              <Button asChild className="gradient-accent text-white shadow-glass">
                <Link href="/scans/new-social">Social check</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/scans/new-website">Website check</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((scan) => (
            <Link key={scan.id} href={`/scans/${scan.id}`}>
              <div className="glass-strong rounded-2xl p-5 shadow-glass hover:bg-gradient-to-r hover:from-[#FF5F45]/10 hover:via-[#FF8A5B]/10 hover:to-[#F2B84B]/10 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      (scan.overallScore ?? 0) >= 80 ? 'bg-green-500/10' :
                      (scan.overallScore ?? 0) >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    }`}>
                      <span className={`text-xl font-extrabold ${getScoreColor(scan.overallScore)}`}>
                        {scan.overallScore ?? '—'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{scan.brandProfile.name}</p>
                        <Badge variant={scan.scanType === 'social' ? 'default' : 'secondary'}>{scan.scanType}</Badge>
                        {scan.platform && <Badge variant="outline">{scan.platform}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {scan.sourceUrl || 'Uploaded design'} · {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={scan.status === 'completed' ? 'default' : 'destructive'}>{scan.status}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
