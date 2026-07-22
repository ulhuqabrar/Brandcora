import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Palette,
  TextT,
  Image,
  Square,
  ArrowsOut,
  CheckCircle,
  Spinner,
  Warning,
  ArrowRight,
  Link as LinkIcon,
} from '@phosphor-icons/react';

interface ColorInfo { hex: string; role: string; confidence: 'high' | 'medium' | 'low'; count: number; }
interface FontInfo { family: string; role: string; confidence: 'high' | 'medium' | 'low'; source: string; }
interface LogoInfo { url: string; type: string; confidence: 'high' | 'medium' | 'low'; location: string; }

interface ExtractedBrand {
  brandName: string;
  websiteUrl: string;
  logos: LogoInfo[];
  colors: ColorInfo[];
  fonts: FontInfo[];
  buttonStyles: {
    primary: { bg: string; text: string; radius: string; padding: string; confidence: string };
    secondary: { bg: string; text: string; radius: string; padding: string; confidence: string };
  };
  spacing: { scale: string[]; confidence: string };
  borderRadius: string;
  shadows: string[];
  containerWidths: string[];
  visualStyle: string;
  iconStyle: string;
  imageStyle: string;
}

const PROGRESS_STEPS = [
  { key: 'validating', label: 'Validating website' },
  { key: 'fetching', label: 'Opening homepage' },
  { key: 'logos', label: 'Finding logos' },
  { key: 'colors', label: 'Detecting colors' },
  { key: 'typography', label: 'Detecting typography' },
  { key: 'components', label: 'Analyzing buttons and components' },
  { key: 'building', label: 'Building brand profile' },
  { key: 'done', label: 'Extraction complete' },
];

function ConfidenceBadge({ level }: { level: string }) {
  if (level === 'high') return <Badge className="bg-green-100 text-green-800 text-xs">High</Badge>;
  if (level === 'medium') return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>;
  return <Badge className="bg-red-100 text-red-800 text-xs">Low</Badge>;
}

export function BrandExtractPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [result, setResult] = useState<ExtractedBrand | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!url) return;
    setExtracting(true);
    setError(null);
    setResult(null);
    setProgressIndex(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgressIndex(prev => {
        if (prev < PROGRESS_STEPS.length - 2) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      const res = await fetch('/api/v1/brand-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      clearInterval(progressInterval);

      if (!data.success) {
        throw new Error(data.error || 'Extraction failed');
      }

      setProgressIndex(PROGRESS_STEPS.length - 1);

      // Save to localStorage for the brand profile page
      localStorage.setItem('extracted-brand', JSON.stringify(data.data));

      setTimeout(() => {
        setResult(data.data);
        setExtracting(false);
      }, 800);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
      setExtracting(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Brand Identity Extracted</h1>
            <p className="text-muted-foreground mt-1">Review and save your extracted brand profile.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { localStorage.setItem('brand-profile-data', JSON.stringify(result)); navigate('/brand'); }} className="gradient-accent text-white shadow-glass">
              <CheckCircle className="mr-1.5 h-4 w-4" weight="bold" />
              Save & Continue
            </Button>
            <Button variant="outline" onClick={() => { setResult(null); setUrl(''); }}>
              Extract another
            </Button>
          </div>
        </div>

        {/* Brand name + URL */}
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Globe className="h-6 w-6 text-primary-foreground" weight="bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{result.brandName}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <LinkIcon className="h-3 w-3" weight="bold" />
                {result.websiteUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Visual summary */}
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-2">Visual Summary</h3>
          <p className="text-muted-foreground leading-relaxed">{result.visualStyle}</p>
        </div>

        {/* Logos */}
        {result.logos.length > 0 && (
          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" weight="bold" />
                Logos
              </h3>
              <span className="text-sm text-muted-foreground">{result.logos.length} found</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {result.logos.map((logo, i) => (
                <div key={i} className="rounded-xl border p-4 bg-white flex flex-col items-center gap-2">
                  <img src={logo.url} alt={logo.type} className="h-16 w-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{logo.type}</span>
                    <ConfidenceBadge level={logo.confidence} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" weight="bold" />
              Color Palette
            </h3>
            <span className="text-sm text-muted-foreground">{result.colors.length} colors</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {result.colors.map((color, i) => (
              <div key={i} className="rounded-xl border bg-white overflow-hidden">
                <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase text-muted-foreground">{color.role}</span>
                    <ConfidenceBadge level={color.confidence} />
                  </div>
                  <span className="text-sm font-mono font-medium">{color.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TextT className="h-5 w-5 text-primary" weight="bold" />
              Typography
            </h3>
            <span className="text-sm text-muted-foreground">{result.fonts.length} fonts</span>
          </div>
          {result.fonts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fonts detected.</p>
          ) : (
            <div className="space-y-2">
              {result.fonts.map((font, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border p-3 bg-white">
                  <div>
                    <p className="font-medium">{font.family}</p>
                    <p className="text-xs text-muted-foreground">{font.role} · {font.source}</p>
                  </div>
                  <ConfidenceBadge level={font.confidence} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Component styles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Square className="h-5 w-5 text-primary" weight="bold" />
              Buttons
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl border p-3 bg-white">
                <p className="text-xs text-muted-foreground mb-1">Primary</p>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: result.buttonStyles.primary.bg }} />
                  <span className="text-xs font-mono">{result.buttonStyles.primary.bg}</span>
                  <ConfidenceBadge level={result.buttonStyles.primary.confidence} />
                </div>
              </div>
              <div className="rounded-xl border p-3 bg-white">
                <p className="text-xs text-muted-foreground mb-1">Secondary</p>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border" style={{ borderColor: result.buttonStyles.secondary.text }} />
                  <span className="text-xs font-mono">{result.buttonStyles.secondary.text}</span>
                  <ConfidenceBadge level={result.buttonStyles.secondary.confidence} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ArrowsOut className="h-5 w-5 text-primary" weight="bold" />
              Layout
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-xl border p-3 bg-white">
                <span className="text-muted-foreground">Border radius</span>
                <span className="font-mono font-medium">{result.borderRadius}</span>
              </div>
              <div className="flex justify-between rounded-xl border p-3 bg-white">
                <span className="text-muted-foreground">Container</span>
                <span className="font-mono font-medium">{result.containerWidths[0] || '1200px'}</span>
              </div>
              <div className="flex justify-between rounded-xl border p-3 bg-white">
                <span className="text-muted-foreground">Icon style</span>
                <span className="text-xs">{result.iconStyle}</span>
              </div>
              <div className="flex justify-between rounded-xl border p-3 bg-white">
                <span className="text-muted-foreground">Image style</span>
                <span className="text-xs">{result.imageStyle}</span>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Spinner className="h-5 w-5 text-primary" weight="bold" />
              Spacing
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3 bg-white">
                <span className="text-muted-foreground">Scale</span>
                <ConfidenceBadge level={result.spacing.confidence} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.spacing.scale.map((s, i) => (
                  <span key={i} className="rounded-lg bg-muted px-2 py-1 text-xs font-mono">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Low confidence warning */}
        {result.colors.some(c => c.confidence === 'low') && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
            <Warning className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" weight="fill" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Some items have low confidence</p>
              <p className="text-sm text-yellow-700 mt-1">
                We extracted your brand identity but some items may need review. You can edit all values from the brand profile page.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => { localStorage.setItem('brand-profile-data', JSON.stringify(result)); navigate('/brand'); }} className="gradient-accent text-white shadow-glass">
            Save & Go to Brand Profile
          </Button>
          <Button variant="outline" onClick={() => { setResult(null); setUrl(''); }}>
            Extract another URL
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Extract Brand Identity</h1>
        <p className="text-muted-foreground mt-1">
          Enter your website URL and Brand Guard will automatically detect your brand.
        </p>
      </div>

      {/* Input card */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Website URL</h3>
            <p className="text-sm text-muted-foreground">Enter a public website URL to analyze</p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              className="bg-white text-base py-5"
              disabled={extracting}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 p-4 text-destructive text-sm font-medium">{error}</div>
          )}

          <Button
            onClick={handleExtract}
            disabled={!url || extracting}
            className="gradient-accent text-white shadow-glass"
          >
            {extracting ? 'Extracting...' : 'Extract Brand Identity'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {extracting && (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">Extraction in progress</h3>
          <div className="space-y-3">
            {PROGRESS_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-3">
                {i < progressIndex ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" weight="fill" />
                ) : i === progressIndex ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0" />
                )}
                <span className={`text-sm ${i <= progressIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What will be extracted */}
      {!extracting && (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">What will be extracted</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {['Brand name', 'Primary & alternate logos', 'Favicon', 'Primary, secondary, accent colors', 'Background & text colors', 'Heading & body fonts', 'Font weights & sizes', 'Button styles', 'Card & input styles', 'Border radius & shadows', 'Spacing patterns', 'Container widths', 'Icon style', 'Image style', 'Visual brand summary'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" weight="fill" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
