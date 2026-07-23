'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Palette,
  TextT,
  Image,
  Spinner,
  Warning,
  Lightning,
  CaretRight,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import { Header } from '@/components/layout/header';

const PROGRESS_STEPS = [
  { key: 'validating', label: 'Validating website' },
  { key: 'fetching', label: 'Opening homepage' },
  { key: 'logos', label: 'Finding logos' },
  { key: 'colors', label: 'Detecting colors and gradients' },
  { key: 'typography', label: 'Detecting typography' },
  { key: 'components', label: 'Analyzing components' },
  { key: 'gradients', label: 'Analyzing gradients and visual treatments' },
  { key: 'building', label: 'Building brand profile' },
  { key: 'done', label: 'Extraction complete' },
];

const EXTRACTED_COLORS = [
  { hex: '#61CE70', name: 'Green', role: 'Primary' },
  { hex: '#11281A', name: 'Forest', role: 'Dark' },
  { hex: '#FFFFFF', name: 'White', role: 'Surface' },
  { hex: '#F5F5F5', name: 'Light Gray', role: 'Background' },
  { hex: '#333333', name: 'Charcoal', role: 'Text' },
  { hex: '#2D6A4F', name: 'Emerald', role: 'Accent' },
];

const EXTRACTED_GRADIENTS = [
  {
    type: 'linear',
    angle: 135,
    stops: [
      { colorHex: '#61CE70', position: '0%' },
      { colorHex: '#2D6A4F', position: '100%' },
    ],
    role: 'primary',
    usageCount: 8,
  },
  {
    type: 'linear',
    angle: 90,
    stops: [
      { colorHex: '#11281A', position: '0%' },
      { colorHex: '#333333', position: '100%' },
    ],
    role: 'hero-background',
    usageCount: 3,
  },
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AnimatedNumber({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.5);

  useEffect(() => {
    if (!visible) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, value, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!url) return;
    setExtracting(true);
    setError(null);
    setProgressIndex(0);

    const progressInterval = setInterval(() => {
      setProgressIndex(prev => {
        if (prev < PROGRESS_STEPS.length - 2) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      const res = await apiFetch('/api/v1/brand-extract', {
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
      localStorage.setItem('brand-profile-data', JSON.stringify(data.data));

      setTimeout(() => {
        router.push('/brand');
      }, 800);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Extraction failed');
      setExtracting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 min-h-[calc(100vh-4rem)] items-center py-16 lg:py-0">
            <div className="max-w-xl">
              <h1 className="text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem] font-bold tracking-[-0.03em] text-foreground mb-6 text-balance leading-[1.05] animate-fade-up-delay-1">
                Keep every design{' '}
                <span className="gradient-text">on-brand</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground-secondary leading-relaxed mb-10 max-w-md animate-fade-up-delay-2">
                Extract your brand identity from any website — colors, fonts, logos, spacing. Then check every design against it automatically.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-lg animate-fade-up-delay-3">
                <Input
                  type="url"
                  placeholder="Enter your website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-13 px-5 text-base bg-surface border-border text-foreground placeholder:text-foreground-muted"
                  disabled={extracting}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                />
                <Button
                  onClick={handleExtract}
                  disabled={!url || extracting}
                  className="gradient-accent text-white h-13 px-7 shrink-0"
                >
                  {extracting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin" weight="bold" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      Extract my brand
                      <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <div className="mt-4 max-w-lg rounded-xl bg-destructive/10 p-3 text-destructive text-sm font-medium text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Product Scene */}
            <div className="relative">
              <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background-warm/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground-muted/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground-muted/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground-muted/20" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-background rounded-md h-7 flex items-center px-3 border border-border">
                      <span className="text-xs font-mono text-foreground-muted">seocontent.ai</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-3.5 w-3.5 text-foreground-muted" weight="bold" />
                    <span className="text-xs font-mono text-foreground-muted">seocontent.ai</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-600 font-medium">Extracted</span>
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-3">Colors</p>
                    <div className="flex gap-2">
                      {EXTRACTED_COLORS.map((c) => (
                        <div key={c.hex} className="group relative">
                          <div className="token-swatch transition-transform group-hover:scale-110" style={{ backgroundColor: c.hex }} />
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-foreground text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap">{c.hex}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-3">Typography</p>
                    <div className="space-y-2">
                      <div className="bg-background rounded-xl p-3 border border-border">
                        <p className="text-base font-bold text-foreground" style={{ fontFamily: 'Outfit, system-ui' }}>Outfit Display</p>
                        <p className="text-xs text-foreground-muted mt-0.5">Heading - Outfit - 700</p>
                      </div>
                      <div className="bg-background rounded-xl p-3 border border-border">
                        <p className="text-sm text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>Inter Body Text</p>
                        <p className="text-xs text-foreground-muted mt-0.5">Body - Inter - 400</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-xl p-3 border border-border">
                      <p className="section-label mb-2">Logo</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-[#61CE70] flex items-center justify-center text-white text-[10px] font-bold">S</div>
                        <div>
                          <p className="text-xs font-medium text-foreground">Primary</p>
                          <p className="text-[10px] text-foreground-muted font-mono">High confidence</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border">
                      <p className="section-label mb-2">Gradients</p>
                      <div className="space-y-1.5">
                        {EXTRACTED_GRADIENTS.map((g, i) => (
                          <div key={i} className="h-5 rounded" style={{
                            background: `linear-gradient(${g.angle}deg, ${g.stops.map(s => `${s.colorHex} ${s.position}`).join(', ')})`
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 top-1/3 hidden lg:block">
                <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-soft">
                  <p className="text-[10px] font-mono text-foreground-muted">confidence</p>
                  <p className="text-sm font-bold text-foreground">97.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extraction progress overlay */}
      {extracting && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface rounded-2xl border border-border shadow-elevated p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4">
                <Spinner className="h-6 w-6 text-white animate-spin" weight="bold" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Extracting brand</h3>
              <p className="text-sm text-foreground-muted mt-1">Analyzing your website...</p>
            </div>
            <div className="space-y-2.5">
              {PROGRESS_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center gap-3">
                  {i < progressIndex ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" weight="fill" />
                  ) : i === progressIndex ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                  )}
                  <span className={`text-sm ${i <= progressIndex ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Problem */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-background-warm">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-6 text-balance leading-tight tracking-[-0.02em]">
                Brand drift happens silently
              </h2>
              <p className="text-foreground-secondary leading-relaxed mb-4">
                Teams update websites, create marketing materials, and publish content — but nobody checks if it matches the brand guide. Colors shift, fonts change, logos get misused.
              </p>
              <p className="text-foreground-secondary leading-relaxed">
                By the time someone notices, the brand has drifted across dozens of touchpoints. Manual review takes hours. Most issues slip through.
              </p>
            </div>
            <div className="relative">
              <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="section-label">Brand check</p>
                    <span className="text-xs font-mono text-red-500 font-medium">3 issues found</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-background rounded-xl border border-red-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Warning className="h-4 w-4 text-red-500" weight="fill" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Wrong color in hero section</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-[#4CAF50] border border-border" />
                              <span className="text-xs font-mono text-foreground-muted">#4CAF50</span>
                            </div>
                            <CaretRight className="h-3 w-3 text-foreground-muted" />
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-[#61CE70] border border-border" />
                              <span className="text-xs font-mono text-foreground-muted">#61CE70</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl border border-red-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Warning className="h-4 w-4 text-red-500" weight="fill" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Wrong typeface detected</p>
                          <p className="text-xs text-foreground-muted mt-1">
                            <span className="font-mono">Arial</span> used — should be <span className="font-mono">Outfit</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl border border-yellow-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Warning className="h-4 w-4 text-yellow-600" weight="fill" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Logo below minimum size</p>
                          <p className="text-xs text-foreground-muted mt-1 font-mono">
                            60px width → minimum 120px
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Extract */}
      <section id="extraction" className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 text-balance leading-tight tracking-[-0.02em]">
              Your brand, decoded
            </h2>
            <p className="text-lg text-foreground-secondary leading-relaxed">
              Every element of your visual identity — identified, measured, and cataloged from a single URL.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Palette className="h-5 w-5 text-primary" weight="bold" />}
              title="Colors"
              count="6 detected"
              content={
                <div className="flex gap-2 mb-4">
                  {['#61CE70', '#11281A', '#FFFFFF', '#F5F5F5', '#333333', '#2D6A4F'].map((hex) => (
                    <div key={hex} className="token-swatch" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              }
              details={
                <>
                  <DetailRow label="primary" value="#61CE70" />
                  <DetailRow label="dark" value="#11281A" />
                </>
              }
            />
            <FeatureCard
              icon={<TextT className="h-5 w-5 text-primary" weight="bold" />}
              title="Typography"
              count="4 fonts found"
              content={
                <div className="space-y-2">
                  <div className="bg-background rounded-xl p-3 border border-border">
                    <p className="text-base font-bold text-foreground" style={{ fontFamily: 'Outfit, system-ui' }}>Outfit Display</p>
                    <p className="text-xs text-foreground-muted mt-0.5">Heading · Weight 700</p>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-border">
                    <p className="text-sm text-foreground" style={{ fontFamily: 'Inter, system-ui' }}>Inter Regular</p>
                    <p className="text-xs text-foreground-muted mt-0.5">Body · Weight 400</p>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-border">
                    <p className="text-sm text-foreground" style={{ fontFamily: 'Roboto, system-ui' }}>Roboto</p>
                    <p className="text-xs text-foreground-muted mt-0.5">UI · Weight 400</p>
                  </div>
                </div>
              }
            />
            <FeatureCard
              icon={<Image className="h-5 w-5 text-primary" weight="bold" />}
              title="Logos & Components"
              count="6 variants"
              content={
                <div className="space-y-2">
                  <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between">
                    <span className="text-sm text-foreground">Primary logo</span>
                    <span className="text-xs font-mono text-green-600">High</span>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between">
                    <span className="text-sm text-foreground">Favicon</span>
                    <span className="text-xs font-mono text-green-600">High</span>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between">
                    <span className="text-sm text-foreground">CTA buttons</span>
                    <span className="text-xs font-mono text-foreground-muted">3 variants</span>
                  </div>
                  <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between">
                    <span className="text-sm text-foreground">Card styles</span>
                    <span className="text-xs font-mono text-foreground-muted">4 tokens</span>
                  </div>
                </div>
              }
            />
            <FeatureCard
              icon={<Lightning className="h-5 w-5 text-primary" weight="bold" />}
              title="Gradients"
              count="2 detected"
              content={
                <div className="space-y-2">
                  {EXTRACTED_GRADIENTS.map((g, i) => (
                    <div key={i} className="bg-background rounded-xl p-3 border border-border">
                      <div className="h-6 rounded mb-2" style={{
                        background: `linear-gradient(${g.angle}deg, ${g.stops.map(s => `${s.colorHex} ${s.position}`).join(', ')})`
                      }} />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-foreground capitalize">{g.role}</span>
                        <span className="text-[10px] font-mono text-foreground-muted">{g.type} · {g.angle}deg</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 px-6 lg:px-8 bg-background-warm">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 text-balance leading-tight tracking-[-0.02em]">
              Three steps to brand consistency
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste your URL', desc: 'Enter any website. Brandcora opens it and begins extracting your visual identity.', icon: <Globe className="h-5 w-5 text-white" weight="bold" /> },
              { step: '02', title: 'We analyze every pixel', desc: 'Colors, fonts, logos, spacing, shadows, buttons — everything is detected and cataloged.', icon: <Lightning className="h-5 w-5 text-white" weight="bold" /> },
              { step: '03', title: 'Your brand profile emerges', desc: 'A complete brand specification with exact values, ready to check against any design.', icon: <CheckCircle className="h-5 w-5 text-white" weight="bold" /> },
            ].map((item) => (
              <div key={item.step}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-soft mb-5">
                  {item.icon}
                </div>
                <div className="section-label mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 text-balance leading-tight tracking-[-0.02em]">
              See exactly what changes
            </h2>
            <p className="text-lg text-foreground-secondary leading-relaxed">
              Brandcora doesn't just find problems — it gives you the exact fix.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="section-label">Current design</span>
              </div>
              <div className="space-y-3">
                <CompareRow label="Color">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded bg-[#4CAF50] border border-border" />
                    <div>
                      <p className="text-sm font-mono text-foreground">#4CAF50</p>
                      <p className="text-xs text-foreground-muted">Wrong green</p>
                    </div>
                  </div>
                </CompareRow>
                <CompareRow label="Font">
                  <div className="flex items-center gap-3">
                    <p className="text-base text-foreground" style={{ fontFamily: 'Arial, sans-serif' }}>Arial</p>
                    <div>
                      <p className="text-sm text-foreground">Wrong typeface</p>
                      <p className="text-xs text-foreground-muted">Should be Outfit</p>
                    </div>
                  </div>
                </CompareRow>
                <CompareRow label="Logo">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded bg-foreground-muted/20 flex items-center justify-center text-xs text-foreground-muted">60</div>
                    <div>
                      <p className="text-sm text-foreground">60px width</p>
                      <p className="text-xs text-foreground-muted">Below minimum</p>
                    </div>
                  </div>
                </CompareRow>
              </div>
            </div>
            <div className="bg-surface rounded-2xl border border-primary/20 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="section-label">Recommended</span>
              </div>
              <div className="space-y-3">
                <CompareRow label="Color">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded bg-[#61CE70] border border-border" />
                    <div>
                      <p className="text-sm font-mono text-foreground">#61CE70</p>
                      <p className="text-xs text-primary">Brand green</p>
                    </div>
                  </div>
                </CompareRow>
                <CompareRow label="Font">
                  <div className="flex items-center gap-3">
                    <p className="text-base text-foreground" style={{ fontFamily: 'Outfit, system-ui' }}>Outfit</p>
                    <div>
                      <p className="text-sm text-foreground">Brand typeface</p>
                      <p className="text-xs text-primary">Weights: 400-700</p>
                    </div>
                  </div>
                </CompareRow>
                <CompareRow label="Logo">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded bg-[#61CE70] flex items-center justify-center text-xs text-white font-bold">S</div>
                    <div>
                      <p className="text-sm text-foreground">120px width</p>
                      <p className="text-xs text-primary">Meets minimum</p>
                    </div>
                  </div>
                </CompareRow>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Score — White Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-6 text-balance leading-tight tracking-[-0.02em]">
                Measured, not guessed
              </h2>
              <p className="text-lg leading-relaxed text-foreground-secondary">
                A weighted score across every dimension of brand compliance. Colors, fonts, logos, spacing, contrast, gradients — all quantified.
              </p>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-8">
              <div className="flex items-center gap-8 mb-8">
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full gradient-accent shrink-0">
                  <span className="text-5xl font-bold text-white">
                    <AnimatedNumber value={91} />
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Brand Match Score</h3>
                  <p className="text-sm mt-1 text-foreground-muted">Weighted across 8 dimensions</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Color consistency', score: 94, weight: '25%' },
                  { label: 'Font usage', score: 88, weight: '20%' },
                  { label: 'Logo compliance', score: 92, weight: '15%' },
                  { label: 'Spacing consistency', score: 85, weight: '10%' },
                  { label: 'Text contrast', score: 90, weight: '10%' },
                  { label: 'Component styles', score: 87, weight: '10%' },
                  { label: 'Accessibility', score: 82, weight: '5%' },
                  { label: 'Gradient consistency', score: 93, weight: '5%' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground-secondary">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-foreground-muted">{item.weight}</span>
                        <span className="text-sm font-bold text-foreground">{item.score}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-accent" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-[800px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 text-balance leading-tight tracking-[-0.02em]">
              Simple, transparent
            </h2>
            <p className="text-lg text-foreground-secondary">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface rounded-2xl border border-border p-8">
              <h3 className="text-lg font-bold text-foreground mb-1">Free</h3>
              <p className="text-sm text-foreground-muted mb-5">For trying out Brand Guard</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-foreground-muted">forever</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {['1 brand profile', '3 social checks/month', '1 website scan/month', 'Basic scores'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" weight="fill" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button variant="outline" className="w-full border-border text-foreground">Get started</Button>
              </Link>
            </div>
            <div className="bg-surface rounded-2xl border border-primary/30 p-8 relative">
              <div className="absolute -top-3 left-8">
                <span className="gradient-accent text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-lg font-bold gradient-text mb-1">Pro</h3>
              <p className="text-sm text-foreground-muted mb-5">For agencies and power users</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">$5</span>
                <span className="text-foreground-muted">/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {['Unlimited brand profiles', 'Unlimited social checks', 'Unlimited website scans', 'Full reports', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" weight="fill" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full gradient-accent text-white">Start free trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-background-warm">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance leading-tight tracking-[-0.02em]">
            Extract your brand now
          </h2>
          <p className="text-lg text-foreground-secondary mb-10">
            See what's really inside your website.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto mb-6">
            <Input
              type="url"
              placeholder="https://yoursite.com"
              className="flex-1 h-13 px-5 text-base bg-surface border-border text-foreground placeholder:text-foreground-muted"
            />
            <Button className="gradient-accent text-white h-13 px-7 shrink-0">
              Analyze now
              <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-foreground-muted">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
              Free analysis
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
              No signup required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
              Instant results
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-warm">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Brandcora" className="h-7 w-auto" />
              </Link>
              <p className="text-sm text-foreground-secondary leading-relaxed max-w-[240px]">
                Extract your brand identity from any website and keep every design on-brand.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#extraction" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-foreground-muted">
              &copy; {new Date().getFullYear()} Brandcora. All rights reserved.
            </span>
            <div className="flex items-center gap-5">
              <a href="#" className="text-foreground-muted hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-foreground-muted hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-foreground-muted hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, count, content, details }: {
  icon: React.ReactNode;
  title: string;
  count: string;
  content?: React.ReactNode;
  details?: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 group hover:shadow-soft transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          <p className="text-xs text-foreground-muted">{count}</p>
        </div>
      </div>
      {content}
      {details && (
        <div className="space-y-1.5 text-xs font-mono text-foreground-muted mt-3">{details}</div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-background rounded-xl border border-border p-4">
      <p className="text-xs text-foreground-muted mb-2">{label}</p>
      {children}
    </div>
  );
}
