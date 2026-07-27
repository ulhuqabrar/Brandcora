'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  ArrowLeft,
  CheckCircle,
  X,
  Globe,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { BrandSubNav } from '@/components/brand-sub-nav';

const STAGES = [
  'Connecting to website',
  'Discovering pages',
  'Reading styles',
  'Detecting visual assets',
  'Building design tokens',
  'Preparing brand profile',
];

export default function BrandScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [pagesAnalyzed, setPagesAnalyzed] = useState(0);
  const [totalPages] = useState(18);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsScanning(true);

    let stage = 0;
    let pages = 0;
    const interval = setInterval(() => {
      stage++;
      pages = Math.min(pages + 3, totalPages);
      setPagesAnalyzed(pages);
      if (stage >= STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          router.push('/brand/review');
        }, 1000);
      } else {
        setCurrentStage(stage);
      }
    }, 2500);
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-5">
      <BrandSubNav />

      {!isScanning ? (
        /* URL Submission Form */
        <div className="max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/brand" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
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
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C4C4BF]" weight="bold" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="input-compact pl-9"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!url || !isValidUrl(url)}
                className={cn(
                  'btn-primary',
                  (!url || !isValidUrl(url)) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <MagnifyingGlass className="h-4 w-4" weight="bold" />
                Analyze
              </button>
            </form>

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

          {/* Previous scan info */}
          <div className="dash-card mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-[#16A34A]/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-[#16A34A]" weight="bold" />
              </div>
              <div className="dash-card-title">Previous scan</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">seocontent.ai</div>
                <div className="text-[12px] text-[#8A8A85]">Scanned 2 hours ago · 18 pages · 24 assets</div>
              </div>
              <Link href="/brand/review" className="btn-ghost text-[12px]">
                View results →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Scan Progress */
        <div className="max-w-[560px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5">
              <div className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Scanning website</h2>
              <p className="text-[13px] text-[#8A8A85] mt-0.5">{url}</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="space-y-1.5 mb-5">
              {STAGES.map((stage, i) => (
                <div
                  key={i}
                  className={cn(
                    'scan-stage',
                    i < currentStage ? 'completed' : i === currentStage ? 'active' : ''
                  )}
                >
                  <div
                    className={cn(
                      'scan-stage-number',
                      i < currentStage ? 'completed' : i === currentStage ? 'active' : 'pending'
                    )}
                  >
                    {i < currentStage ? (
                      <CheckCircle className="h-4 w-4" weight="bold" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[13px]',
                      i === currentStage
                        ? 'font-medium text-[#1A1918]'
                        : i < currentStage
                        ? 'text-[#16A34A]'
                        : 'text-[#8A8A85]'
                    )}
                  >
                    {stage}
                  </span>
                  {i === currentStage && (
                    <span className="text-[11px] text-[#8A8A85] ml-auto">
                      {pagesAnalyzed} of {totalPages} pages
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="progress-bar mb-4">
              <div
                className="progress-bar-fill"
                style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8A85]">
                {currentStage < STAGES.length
                  ? `Stage ${currentStage + 1} of ${STAGES.length}`
                  : 'Scan complete'}
              </span>
              <button className="btn-ghost text-[12px]">
                <X className="h-3.5 w-3.5" weight="bold" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
