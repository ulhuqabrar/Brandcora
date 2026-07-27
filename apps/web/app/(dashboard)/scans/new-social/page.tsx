'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, ArrowRight, Warning, Spinner } from '@phosphor-icons/react';
import { getBrandIdentity, type BrandIdentity } from '@/lib/brand-identity';
import { apiFetch } from '@/lib/api';

const PLATFORMS = [
  { key: 'instagram-post', name: 'Instagram Post', size: '1080 × 1080' },
  { key: 'instagram-story', name: 'Instagram Story', size: '1080 × 1920' },
  { key: 'linkedin-post', name: 'LinkedIn Post', size: '1200 × 627' },
  { key: 'linkedin-banner', name: 'LinkedIn Banner', size: '1584 × 396' },
  { key: 'facebook-post', name: 'Facebook Post', size: '1200 × 630' },
  { key: 'youtube-thumbnail', name: 'YouTube Thumbnail', size: '1280 × 720' },
  { key: 'advertisement', name: 'Advertisement', size: '1080 × 1080' },
  { key: 'general', name: 'General', size: '1080 × 1080' },
];

const STAGES = [
  'Uploading design',
  'Extracting colors',
  'Comparing against brand',
  'Checking layout compliance',
  'Calculating scores',
];

export default function NewSocialCheckPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState('instagram-post');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const brand = getBrandIdentity();
  const hasBrand = brand.colors.length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
    }
  }

  function handleRemoveFile() {
    setFile(null);
    setPreview(null);
    setError(null);
  }

  async function handleScan() {
    if (!file || !preview) return;
    setLoading(true);
    setError(null);
    setCurrentStage(0);

    try {
      // Stage 1: Upload the image
      setCurrentStage(0);
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await apiFetch('/api/v1/uploads/social-design', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      const fileUrl = uploadData.data.fileUrl;

      // Stage 2-4: Run social check via backend
      setCurrentStage(1);
      await new Promise(r => setTimeout(r, 500)); // Small delay for UX

      const brandProfileId = localStorage.getItem('brand-profile-id');
      if (!brandProfileId) {
        throw new Error('No brand profile found. Please set up your brand profile first.');
      }

      setCurrentStage(2);
      const scanRes = await apiFetch('/api/v1/scans/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandProfileId,
          fileUrl,
          platform,
        }),
      });
      const scanData = await scanRes.json();

      if (!scanData.success) {
        throw new Error(scanData.error || 'Scan failed');
      }

      setCurrentStage(3);
      await new Promise(r => setTimeout(r, 500));

      setCurrentStage(4);
      await new Promise(r => setTimeout(r, 500));

      // Navigate to scan result
      router.push(`/scans/${scanData.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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
              <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${i === currentStage ? 'bg-[#FF5F45]/5' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium ${
                  i < currentStage ? 'bg-[#16A34A] text-white' :
                  i === currentStage ? 'bg-[#FF5F45] text-white animate-pulse' :
                  'bg-[#F0F0EE] text-[#8A8A85]'
                }`}>
                  {i < currentStage ? '✓' : i + 1}
                </div>
                <span className={`text-[13px] ${
                  i === currentStage ? 'font-medium text-[#1A1918]' :
                  i < currentStage ? 'text-[#16A34A]' :
                  'text-[#8A8A85]'
                }`}>
                  {stage}
                </span>
              </div>
            ))}
          </div>

          <div className="progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }} />
          </div>

          <button onClick={() => { setLoading(false); setError(null); }} className="btn-ghost text-[12px] w-full justify-center">
            <X className="h-3.5 w-3.5" weight="bold" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">New Social Check</h1>
        <p className="text-muted-foreground mt-1">Upload a design to compare against your brand identity.</p>
      </div>

      {!hasBrand && (
        <div className="glass-strong rounded-2xl p-4 shadow-glass border border-yellow-200 bg-yellow-50 flex items-start gap-3">
          <Warning className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="text-sm font-medium text-yellow-800">No brand identity found</p>
            <p className="text-xs text-yellow-700 mt-1">Set up your brand profile first so checks can compare against your approved colors, fonts, and styles.</p>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            <a href="/brand/extract">Extract brand</a>
          </Button>
        </div>
      )}

      {hasBrand && (
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <p className="text-sm font-medium mb-2">Brand colors being checked against:</p>
          <div className="flex flex-wrap gap-2">
            {brand.colors.map(c => (
              <div key={c.hex} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 bg-white text-xs">
                <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hex }} />
                <span className="font-medium capitalize">{c.role}</span>
                <span className="text-muted-foreground">{c.hex}</span>
              </div>
            ))}
          </div>
          {brand.headingFont && (
            <p className="text-xs text-muted-foreground mt-2">Heading: {brand.headingFont} · Body: {brand.bodyFont}</p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-1">Upload Design</h3>
          <p className="text-sm text-muted-foreground mb-4">PNG, JPG, or WebP files up to 10MB</p>
          {preview ? (
            <div className="relative rounded-xl border-2 border-dashed bg-white p-2">
              <img ref={imgRef} src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              <button onClick={handleRemoveFile} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
                <Upload className="h-7 w-7 text-primary" weight="bold" />
              </div>
              <span className="text-sm font-medium text-foreground">Click to upload</span>
              <span className="text-xs text-muted-foreground mt-1">or drag and drop</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            </label>
          )}
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>

        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-1">Platform</h3>
          <p className="text-sm text-muted-foreground mb-4">Select the target platform</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PLATFORMS.map(p => (
              <button key={p.key} onClick={() => setPlatform(p.key)} className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all duration-200 ${platform === p.key ? 'border-primary bg-primary/5 shadow-glass ring-1 ring-primary/20' : 'hover:bg-muted/50'}`}>
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{p.size}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleScan} disabled={!file || loading || !hasBrand} className="gradient-accent text-white shadow-glass">
          {loading ? 'Analyzing...' : 'Run brand check'}{!loading && <ArrowRight className="ml-1.5 h-4 w-4" weight="bold" />}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
      </div>
    </div>
  );
}
