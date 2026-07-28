'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  ArrowLeft,
  CheckCircle,
  X,
  Warning,
  Spinner,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const SCAN_STAGES: Record<string, string> = {
  queued: 'Queued',
  connecting: 'Connecting to website',
  crawling: 'Discovering pages',
  extracting_assets: 'Detecting visual assets',
  extracting_colors: 'Extracting colors',
  extracting_typography: 'Extracting typography',
  extracting_layout: 'Analyzing layout and spacing',
  extracting_components: 'Detecting components',
  generating_tokens: 'Building design tokens',
  saving_results: 'Saving results',
  completed: 'Scan complete',
  completed_with_warnings: 'Scan complete with warnings',
  failed: 'Scan failed',
  cancelled: 'Scan cancelled',
};

const STAGE_ORDER = [
  'queued', 'connecting', 'crawling', 'extracting_assets',
  'extracting_colors', 'extracting_typography', 'extracting_layout',
  'extracting_components', 'generating_tokens', 'saving_results',
  'completed', 'completed_with_warnings', 'failed', 'cancelled',
];

interface ScanData {
  id: string;
  status: string;
  progress: number;
  currentStage: string | null;
  pagesDiscovered: number;
  pagesAnalyzed: number;
  warnings: string[];
  errorCode: string | null;
  errorMessage: string | null;
  overallScore: number | null;
  createdAt: string;
  completedAt: string | null;
}

function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) return '';
  if (!/^(https?|ftp):\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) return '';
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(parsed.hostname)) return '';
    return parsed.href;
  } catch {
    return '';
  }
}

export default function BrandScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [previousScan, setPreviousScan] = useState<ScanData | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef(false);

  const fetchPreviousScan = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/scans/?limit=1&scanType=website');
      const data = await res.json();
      if (data.success && data.data.scans?.length > 0) {
        const scan = data.data.scans[0];
        if (scan.status === 'completed' || scan.status === 'completed_with_warnings') {
          setPreviousScan({
            id: scan.id,
            status: scan.status,
            progress: scan.progress || 100,
            currentStage: scan.currentStage,
            pagesDiscovered: scan.pagesDiscovered || 0,
            pagesAnalyzed: scan.pagesAnalyzed || 0,
            warnings: scan.warnings || [],
            errorCode: scan.errorCode,
            errorMessage: scan.errorMessage,
            overallScore: scan.overallScore,
            createdAt: scan.createdAt,
            completedAt: scan.completedAt,
          });
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchPreviousScan();
    return () => {
      abortRef.current = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPreviousScan]);

  const pollScan = useCallback((scanId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      if (abortRef.current) return;
      try {
        const res = await apiFetch(`/api/v1/scans/${scanId}`);
        const data = await res.json();
        if (!data.success) return;

        const scan = data.data;
        setScanData(prev => prev ? { ...prev, ...scan } : scan);

        if (scan.status === 'completed' || scan.status === 'completed_with_warnings') {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => {
            router.push(`/brand/review?scanId=${scanId}`);
          }, 1500);
        } else if (scan.status === 'failed' || scan.status === 'cancelled') {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* retry on next interval */ }
    }, 2000);
  }, [router]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalized = normalizeUrl(url);
    if (!normalized) {
      if (!url.trim()) {
        setError('Enter a website URL to start a scan.');
      } else {
        setError('Enter a valid public website address.');
      }
      return;
    }

    setIsScanning(true);
    setScanData(null);

    try {
      const res = await apiFetch('/api/v1/scans/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create scan');
      }

      const scan = data.data;
      setScanData({
        id: scan.id,
        status: scan.status,
        progress: scan.progress || 0,
        currentStage: scan.currentStage || 'queued',
        pagesDiscovered: scan.pagesDiscovered || 0,
        pagesAnalyzed: scan.pagesAnalyzed || 0,
        warnings: scan.warnings || [],
        errorCode: scan.errorCode,
        errorMessage: scan.errorMessage,
        overallScore: scan.overallScore,
        createdAt: scan.createdAt,
        completedAt: scan.completedAt,
      });

      if (scan.status !== 'completed' && scan.status !== 'completed_with_warnings' && scan.status !== 'failed') {
        pollScan(scan.id);
      } else if (scan.status === 'completed' || scan.status === 'completed_with_warnings') {
        setTimeout(() => {
          router.push(`/brand/review?scanId=${scan.id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start scan. Please try again.');
      setIsScanning(false);
    }
  };

  const handleCancel = async () => {
    if (!scanData) return;
    try {
      await apiFetch(`/api/v1/scans/${scanData.id}`, { method: 'DELETE' });
      if (pollRef.current) clearInterval(pollRef.current);
      setScanData(null);
      setIsScanning(false);
    } catch { /* ignore */ }
  };

  const currentStageIndex = scanData?.currentStage
    ? STAGE_ORDER.indexOf(scanData.currentStage)
    : 0;

  return (
    <div className="space-y-5">
      {!isScanning ? (
        <div className="max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4 text-[#8A8A85]" weight="bold" />
            </Link>
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Scan website</h2>
              <p className="text-[13px] text-[#8A8A85] mt-0.5">
                Enter your website URL to extract brand identity
              </p>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-title mb-4">Website URL</div>
            <form onSubmit={handleScan} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  placeholder="https://yourwebsite.com"
                  className="input-compact"
                />
              </div>
              <button
                type="submit"
                disabled={!url.trim()}
                className={cn(
                  'btn-primary',
                  !url.trim() && 'opacity-50 cursor-not-allowed'
                )}
              >
                <MagnifyingGlass className="h-4 w-4" weight="bold" />
                Analyze
              </button>
            </form>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-[13px] text-[#DC2626]">
                <Warning className="h-4 w-4 shrink-0" weight="fill" />
                {error}
              </div>
            )}

            <div className="mt-5 space-y-2">
              {[
                'Public website required',
                'Initial scan does not change the website',
                'Results can be reviewed before approval',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-[#8A8A85]">
                  <CheckCircle className="h-3 w-3 text-[#C4C4BF]" weight="bold" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {previousScan && (
            <div className="dash-card mt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-[#16A34A]/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-[#16A34A]" weight="bold" />
                </div>
                <div className="dash-card-title">Previous scan</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-[#1A1918]">{previousScan.id.slice(0, 12)}...</div>
                  <div className="text-[12px] text-[#8A8A85]">
                    {previousScan.pagesAnalyzed} pages analyzed
                    {previousScan.overallScore != null && ` · Score: ${previousScan.overallScore}`}
                  </div>
                </div>
                <Link href={`/brand/review?scanId=${previousScan.id}`} className="btn-ghost text-[12px]">
                  View results →
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5">
              <div className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Scanning website</h2>
              <p className="text-[13px] text-[#8A8A85] mt-0.5 truncate max-w-[400px]">{url}</p>
            </div>
          </div>

          <div className="dash-card">
            {scanData?.status === 'failed' && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
                {scanData.errorMessage || 'Scan failed. Please check the URL and try again.'}
              </div>
            )}

            <div className="space-y-1.5 mb-5">
              {Object.entries(SCAN_STAGES).filter(([key]) => !['completed', 'completed_with_warnings', 'failed', 'cancelled'].includes(key)).map(([key, label], i) => {
                const stageIdx = STAGE_ORDER.indexOf(key);
                const isCompleted = scanData && currentStageIndex > stageIdx;
                const isActive = scanData?.currentStage === key;

                return (
                  <div
                    key={key}
                    className={cn(
                      'scan-stage',
                      isCompleted ? 'completed' : isActive ? 'active' : ''
                    )}
                  >
                    <div
                      className={cn(
                        'scan-stage-number',
                        isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" weight="bold" />
                      ) : isActive ? (
                        <Spinner className="h-4 w-4 animate-spin" weight="bold" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[13px]',
                        isActive
                          ? 'font-medium text-[#1A1918]'
                          : isCompleted
                          ? 'text-[#16A34A]'
                          : 'text-[#8A8A85]'
                      )}
                    >
                      {label}
                    </span>
                    {isActive && scanData && (
                      <span className="text-[11px] text-[#8A8A85] ml-auto">
                        {scanData.pagesAnalyzed} of {scanData.pagesDiscovered || '?'} pages
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="progress-bar mb-4">
              <div
                className="progress-bar-fill"
                style={{ width: `${scanData?.progress || 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">
                {scanData?.progress || 0}% complete
                {scanData?.warnings && scanData.warnings.length > 0 && (
                  <span className="text-[#F59E0B] ml-2">
                    · {scanData.warnings.length} warning{scanData.warnings.length > 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <button onClick={handleCancel} className="btn-ghost text-[12px]">
                <X className="h-3.5 w-3.5" weight="bold" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
