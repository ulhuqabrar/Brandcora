'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileImage,
  ArrowLeft,
  CheckCircle,
  MagnifyingGlass,
  X,
  Globe,
  Spinner,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const STAGES = [
  'Preparing asset',
  'Detecting content',
  'Comparing colors',
  'Comparing typography',
  'Checking logo usage',
  'Measuring spacing',
  'Calculating report',
];

export default function NewReportPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'website' | 'social'>('website');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (mode === 'website' && !url) return;
    if (mode === 'social' && !file) return;

    setIsProcessing(true);
    setError(null);
    setCurrentStage(0);

    try {
      let brandProfileId = localStorage.getItem('brand-profile-id');

      // Fallback: fetch from API if not in localStorage
      if (!brandProfileId) {
        const profileRes = await apiFetch('/api/v1/brand-profile');
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data?.id) {
          brandProfileId = profileData.data.id;
          localStorage.setItem('brand-profile-id', brandProfileId!);
        }
      }

      if (!brandProfileId) {
        throw new Error('No brand profile found. Please set up your brand profile first.');
      }

      if (mode === 'website') {
        // Website scan
        setCurrentStage(0);
        await new Promise(r => setTimeout(r, 300));

        setCurrentStage(1);
        const scanRes = await apiFetch('/api/v1/scans/website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandProfileId,
            url: url.startsWith('http') ? url : `https://${url}`,
          }),
        });
        const scanData = await scanRes.json();

        if (!scanData.success) {
          throw new Error(scanData.error || 'Scan failed');
        }

        setCurrentStage(6);
        await new Promise(r => setTimeout(r, 500));

        router.push(`/scans/${scanData.data.id}`);
      } else {
        // Social/image scan
        setCurrentStage(0);

        // Upload image
        const formData = new FormData();
        formData.append('file', file!);
        const uploadRes = await apiFetch('/api/v1/uploads/social-design', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Failed to upload image');
        }

        setCurrentStage(1);
        await new Promise(r => setTimeout(r, 300));

        setCurrentStage(2);
        const scanRes = await apiFetch('/api/v1/scans/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandProfileId,
            fileUrl: uploadData.data.fileUrl,
            platform: 'general',
          }),
        });
        const scanData = await scanRes.json();

        if (!scanData.success) {
          throw new Error(scanData.error || 'Scan failed');
        }

        setCurrentStage(6);
        await new Promise(r => setTimeout(r, 500));

        router.push(`/scans/${scanData.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-[560px] mx-auto space-y-6">
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FF5F45]/10 flex items-center justify-center">
                <Spinner className="h-4 w-4 text-[#FF5F45] animate-spin" weight="bold" />
              </div>
              <div className="dash-card-title">Analyzing brand compliance</div>
            </div>
          </div>

          <div className="space-y-1.5 mb-6">
            {STAGES.map((stage, i) => (
              <div key={i} className={cn('scan-stage', i === currentStage ? 'active' : i < currentStage ? 'completed' : '')}>
                <div className={cn('scan-stage-number', i < currentStage ? 'completed' : i === currentStage ? 'active' : 'pending')}>
                  {i < currentStage ? (
                    <CheckCircle className="h-4 w-4" weight="bold" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={cn(
                  'text-[13px]',
                  i === currentStage ? 'font-medium text-[#1A1918]' : i < currentStage ? 'text-[#16A34A]' : 'text-[#8A8A85]'
                )}>
                  {stage}
                </span>
              </div>
            ))}
          </div>

          <div className="progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button onClick={() => { setIsProcessing(false); setError(null); }} className="btn-ghost text-[12px] w-full justify-center">
            <X className="h-3.5 w-3.5" weight="bold" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/scans" className="p-1.5 hover:bg-[#F5F5F3] rounded-lg transition-colors">
          <ArrowLeft className="h-4 w-4 text-[#8A8A85]" weight="bold" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">New report</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">Check a website or creative asset against your brand identity</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Check type</div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('website')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
              mode === 'website'
                ? 'border-[#FF5F45] bg-[#FF5F45]/5 text-[#FF5F45]'
                : 'border-[#F0F0EE] text-[#8A8A85] hover:bg-[#F5F5F3]'
            )}
          >
            <Globe className="h-4 w-4" weight="bold" />
            <span className="text-[13px] font-medium">Website scan</span>
          </button>
          <button
            onClick={() => setMode('social')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
              mode === 'social'
                ? 'border-[#FF5F45] bg-[#FF5F45]/5 text-[#FF5F45]'
                : 'border-[#F0F0EE] text-[#8A8A85] hover:bg-[#F5F5F3]'
            )}
          >
            <FileImage className="h-4 w-4" weight="bold" />
            <span className="text-[13px] font-medium">Social/creative check</span>
          </button>
        </div>
      </div>

      {mode === 'website' ? (
        /* Website URL Input */
        <div className="dash-card">
          <div className="dash-card-title mb-3">Website URL</div>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Enter website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-compact"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Upload Zone */
        <div className="dash-card">
          <div className="dash-card-title mb-3">Creative asset</div>
          <label className="upload-zone block cursor-pointer">
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="sr-only"
            />
            {file ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#F5F5F3] flex items-center justify-center">
                  <FileImage className="h-6 w-6 text-[#8A8A85]" weight="bold" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-medium text-[#1A1918]">{file.name}</div>
                  <div className="text-[12px] text-[#8A8A85]">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[#C4C4BF] mx-auto mb-2" weight="bold" />
                <div className="text-[13px] font-medium text-[#3D3D3A]">Drop file or click to browse</div>
                <div className="text-[12px] text-[#8A8A85] mt-1">PNG, JPG, WebP up to 10MB</div>
              </>
            )}
          </label>
        </div>
      )}

      {/* Brand Identity Used */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Brand identity</div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#F0F0EE]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B] flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
              <defs>
                <linearGradient id="logoGradReport" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5F45" />
                  <stop offset="48%" stopColor="#FF8A5B" />
                  <stop offset="100%" stopColor="#F2B84B" />
                </linearGradient>
              </defs>
              <circle cx="7" cy="7" r="4" fill="url(#logoGradReport)" />
              <rect x="14" y="2" width="5" height="16" rx="2.5" fill="url(#logoGradReport)" />
              <rect x="22" y="2" width="5" height="20" rx="2.5" fill="url(#logoGradReport)" />
              <rect x="30" y="2" width="5" height="16" rx="2.5" fill="url(#logoGradReport)" />
              <rect x="38" y="6" width="5" height="10" rx="2.5" fill="url(#logoGradReport)" />
              <rect x="7" y="22" width="5" height="18" rx="2.5" fill="url(#logoGradReport)" />
              <rect x="14" y="22" width="5" height="14" rx="2.5" fill="url(#logoGradReport)" />
              <circle cx="25" cy="38" r="4" fill="url(#logoGradReport)" />
              <circle cx="33" cy="38" r="4" fill="url(#logoGradReport)" />
              <rect x="40" y="28" width="5" height="12" rx="2.5" fill="url(#logoGradReport)" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-medium text-[#1A1918]">seocontent.ai</div>
            <div className="text-[11px] text-[#8A8A85]">Approved · v2 · 12 tokens</div>
          </div>
          <span className="status-badge active text-[10px]">
            <CheckCircle className="h-3 w-3" weight="bold" /> Active
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Action */}
      <button
        onClick={handleAnalyze}
        disabled={(mode === 'website' && !url) || (mode === 'social' && !file)}
        className={cn(
          'w-full h-11 rounded-lg text-[14px] font-semibold transition-colors flex items-center justify-center gap-2',
          (mode === 'website' && url) || (mode === 'social' && file)
            ? 'bg-[#FF5F45] text-white hover:bg-[#E8533A]'
            : 'bg-[#F0F0EE] text-[#C4C4BF] cursor-not-allowed'
        )}
      >
        <MagnifyingGlass className="h-4 w-4" weight="bold" />
        Run brand check
      </button>
    </div>
  );
}
