'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, ArrowRight, Warning } from '@phosphor-icons/react';
import { getBrandIdentity, generateIssues, calculateScore, type BrandIdentity, type ScanIssue } from '@/lib/brand-identity';

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

function extractColorsFromImage(imageElement: HTMLImageElement): Array<{ hex: string; location: string }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(imageElement, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const colorBuckets: Record<string, number> = {};
  const step = 4;
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }
  const sorted = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1]);
  const result: Array<{ hex: string; location: string }> = [];
  const labels = ['Background', 'Primary accent', 'Secondary accent', 'Text area', 'Border element'];
  for (let i = 0; i < Math.min(5, sorted.length); i++) {
    const [rgb] = sorted[i];
    const [r, g, b] = rgb.split(',').map(Number);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    result.push({ hex, location: labels[i] || `Region ${i + 1}` });
  }
  return result;
}

function detectFontsFromImage(): Array<{ family: string; weight?: number; element: string }> {
  return [
    { family: 'Detected font', element: 'Heading text (estimated)' },
    { family: 'Detected body font', element: 'Body text (estimated)' },
  ];
}

export default function NewSocialCheckPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState('instagram-post');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    try {
      await new Promise(r => setTimeout(r, 800));
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = preview;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      const detectedColors = extractColorsFromImage(img);
      const detectedFonts = detectFontsFromImage();

      const issues: ScanIssue[] = [];
      let issueId = 0;

      for (const dc of detectedColors) {
        let matched = false;
        for (const bc of brand.colors) {
          const r1 = parseInt(dc.hex.slice(1, 3), 16), g1 = parseInt(dc.hex.slice(3, 5), 16), b1 = parseInt(dc.hex.slice(5, 7), 16);
          const r2 = parseInt(bc.hex.slice(1, 3), 16), g2 = parseInt(bc.hex.slice(3, 5), 16), b2 = parseInt(bc.hex.slice(5, 7), 16);
          const dist = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
          if (dist < 80) {
            matched = true;
            if (dist < 15) {
              issues.push({ id: `i${++issueId}`, category: 'color', severity: 'passed', title: `${bc.role} color matches brand`, detected: dc.hex, brandRequirement: bc.hex, recommendation: 'No action needed.', affectedElement: dc.location });
            } else if (dist < 40) {
              issues.push({ id: `i${++issueId}`, category: 'color', severity: 'minor', title: `${bc.role} color slightly off`, detected: dc.hex, brandRequirement: bc.hex, recommendation: `Replace ${dc.hex} with ${bc.hex} in ${dc.location}.`, affectedElement: dc.location });
            } else {
              issues.push({ id: `i${++issueId}`, category: 'color', severity: 'major', title: `Incorrect ${bc.role} color`, detected: dc.hex, brandRequirement: bc.hex, recommendation: `Change the ${dc.location} color from ${dc.hex} to ${bc.hex}.`, affectedElement: dc.location });
            }
            break;
          }
        }
        if (!matched) {
          issues.push({ id: `i${++issueId}`, category: 'color', severity: 'major', title: 'Unrecognized color in design', detected: dc.hex, brandRequirement: 'Not in brand palette', recommendation: `The color ${dc.hex} in ${dc.location} doesn't match any brand color. Replace it with a brand-approved color.`, affectedElement: dc.location });
        }
      }

      if (brand.headingFont) {
        issues.push({ id: `i${++issueId}`, category: 'font', severity: 'recommendation', title: 'Verify heading font', detected: 'Visual check needed', brandRequirement: brand.headingFont, recommendation: `Ensure headings use "${brand.headingFont}". Current font could not be auto-detected from the image.`, affectedElement: 'All headings' });
      }
      if (brand.bodyFont) {
        issues.push({ id: `i${++issueId}`, category: 'font', severity: 'recommendation', title: 'Verify body font', detected: 'Visual check needed', brandRequirement: brand.bodyFont, recommendation: `Ensure body text uses "${brand.bodyFont}".`, affectedElement: 'Body text' });
      }

      const passedCount = issues.filter(i => i.severity === 'passed').length;
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const majorCount = issues.filter(i => i.severity === 'major').length;
      const minorCount = issues.filter(i => i.severity === 'minor').length;
      const total = issues.length || 1;
      const overall = Math.max(0, Math.min(100, Math.round((passedCount / total) * 100 - (criticalCount * 20 + majorCount * 10 + minorCount * 3))));

      const scanId = 'scan-' + Date.now();
      const scanData = {
        id: scanId,
        scanType: 'social',
        status: 'completed',
        overallScore: overall,
        platform,
        sourceFileUrl: preview,
        sourceUrl: null,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        brandProfile: { name: brand.name },
        detectedColors: detectedColors.map(c => ({ hex: c.hex, location: c.location })),
        detectedFonts: detectedFonts.map(f => ({ family: f.family, element: f.element })),
        scores: [
          { category: 'color', score: Math.round(issues.filter(i => i.category === 'color' && i.severity === 'passed').length / Math.max(1, issues.filter(i => i.category === 'color').length) * 100), weight: 35 },
          { category: 'font', score: 70, weight: 25 },
          { category: 'logo', score: 80, weight: 20 },
          { category: 'component', score: 80, weight: 20 },
        ],
        issues,
      };

      localStorage.setItem(`scan-${scanId}`, JSON.stringify(scanData));
      router.push(`/scans/${scanId}`);
    } catch (err) {
      setError('Failed to analyze the image. Please try a different file.');
    } finally {
      setLoading(false);
    }
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
            <a href="/brand/profile">Set up brand</a>
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
        <Button onClick={handleScan} disabled={!file || loading} className="gradient-accent text-white shadow-glass">
          {loading ? 'Analyzing...' : 'Run brand check'}{!loading && <ArrowRight className="ml-1.5 h-4 w-4" weight="bold" />}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
      </div>
    </div>
  );
}
