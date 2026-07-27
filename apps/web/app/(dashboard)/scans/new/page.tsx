'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileImage,
  ArrowLeft,
  CheckCircle,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

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
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [reportName, setReportName] = useState('');
  const [channel, setChannel] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      if (!reportName) {
        setReportName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsProcessing(true);
    // Simulate stage progression
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage >= STAGES.length) {
        clearInterval(interval);
        // Navigate to report detail would happen here
      } else {
        setCurrentStage(stage);
      }
    }, 2000);
  };

  if (isProcessing) {
    return (
      <div className="max-w-[560px] mx-auto space-y-6">
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FF5F45]/10 flex items-center justify-center">
                <MagnifyingGlass className="h-4 w-4 text-[#FF5F45]" weight="bold" />
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

          <button className="btn-ghost text-[12px] w-full justify-center">
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
          <p className="text-[13px] text-[#8A8A85] mt-0.5">Upload a creative asset to check against your brand identity</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Creative asset</div>
        <label className="upload-zone block cursor-pointer">
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
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
              <div className="text-[12px] text-[#8A8A85] mt-1">PNG, JPG, WebP, PDF up to 10MB</div>
            </>
          )}
        </label>
      </div>

      {/* Report Details */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Report details</div>
        <div className="space-y-3">
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Report name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Homepage redesign v3"
              className="input-compact"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="input-compact"
            >
              <option value="">Select channel</option>
              <option value="website">Website</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="email">Email</option>
              <option value="presentation">Presentation</option>
              <option value="display">Display ad</option>
              <option value="print">Print</option>
            </select>
          </div>
        </div>
      </div>

      {/* Brand Identity Used */}
      <div className="dash-card">
        <div className="dash-card-title mb-3">Brand identity</div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#F0F0EE]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B] flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">B</span>
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

      {/* Action */}
      <button
        onClick={handleAnalyze}
        disabled={!file}
        className={cn(
          'w-full h-11 rounded-lg text-[14px] font-semibold transition-colors',
          file
            ? 'bg-[#FF5F45] text-white hover:bg-[#E8533A]'
            : 'bg-[#F0F0EE] text-[#C4C4BF] cursor-not-allowed'
        )}
      >
        Run brand check
      </button>
    </div>
  );
}
