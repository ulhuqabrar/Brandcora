'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, Upload, Shield, Lock, Eye, FileJson, Layers, Palette, Type, Square, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView(0.1);
  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── Logo Mark ─── */
function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5F45" />
          <stop offset="48%" stopColor="#FF8A5B" />
          <stop offset="100%" stopColor="#F2B84B" />
        </linearGradient>
      </defs>
      {/* Top row */}
      <circle cx="7" cy="7" r="4" fill="url(#logoGrad)" />
      <rect x="14" y="2" width="5" height="16" rx="2.5" fill="url(#logoGrad)" />
      <rect x="22" y="2" width="5" height="20" rx="2.5" fill="url(#logoGrad)" />
      <rect x="30" y="2" width="5" height="16" rx="2.5" fill="url(#logoGrad)" />
      <rect x="38" y="6" width="5" height="10" rx="2.5" fill="url(#logoGrad)" />
      {/* Bottom row */}
      <rect x="7" y="22" width="5" height="18" rx="2.5" fill="url(#logoGrad)" />
      <rect x="14" y="22" width="5" height="14" rx="2.5" fill="url(#logoGrad)" />
      <circle cx="25" cy="38" r="4" fill="url(#logoGrad)" />
      <circle cx="33" cy="38" r="4" fill="url(#logoGrad)" />
      <rect x="40" y="28" width="5" height="12" rx="2.5" fill="url(#logoGrad)" />
    </svg>
  );
}

/* ─── Navigation ─── */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 transition-all duration-500">
        <nav className={`flex items-center justify-between rounded-xl px-5 py-2.5 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border border-black/[0.04]'
            : 'bg-transparent'
        }`}>
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="w-7 h-7" />
            <span className="font-semibold text-base tracking-tight text-graphite">Brandcora</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {['How it works', 'Extraction', 'Validation', 'Developers'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-[13px] font-medium text-foreground-muted hover:text-foreground transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="gradient-accent text-white">
              <Link href="/auth">
                Scan a website
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const normalizeUrl = (input: string): string => {
    let v = input.trim();
    if (!v) return v;
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    try { new URL(v); } catch { return v; }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) {
      setError('Enter a website URL to continue.');
      return;
    }
    const normalized = normalizeUrl(url);
    try {
      new URL(normalized);
    } catch {
      setError('Enter a valid website address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setScanComplete(true);
    }, 2200);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: '#FAF8F5' }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left column — 5 cols */}
          <div className="lg:col-span-5 space-y-6 lg:pt-4">
            <Badge variant="secondary" className="text-[11px] font-medium px-3 py-1">
              Brand intelligence for creative teams
            </Badge>

            <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold text-graphite leading-[1.05] tracking-[-0.03em] max-w-[520px]">
              Turn your website into a usable brand system.
            </h1>

            <p className="text-[17px] text-foreground-secondary leading-[1.6] max-w-[480px]">
              Paste a website URL to identify its colors, typography, logos, icons, spacing, radius, and reusable design tokens. Store the identity, export it as JSON, and check future creative assets for brand consistency.
            </p>

            {/* URL form */}
            <form onSubmit={handleSubmit} className="max-w-[520px]">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  placeholder="https://yourwebsite.com"
                  disabled={loading}
                  aria-label="Website URL"
                  aria-describedby={error ? 'url-error' : undefined}
                  className={`h-12 text-[15px] ${error ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
className="shrink-0 h-12 px-6 gradient-accent text-white"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Analyzing…
                    </>
                  ) : (
                    'Analyze website'
                  )}
                </Button>
              </div>
              {error && (
                <p id="url-error" className="mt-2 text-[13px] text-red-600" role="alert">{error}</p>
              )}
            </form>

            <div className="flex items-center gap-4">
              <p className="text-[12px] text-foreground-muted flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-foreground-subtle" />
                No signup required for the initial scan.
              </p>
            </div>

            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground-secondary hover:text-graphite transition-colors duration-200 group">
              View sample report
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Right column — 7 cols: product visual */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F8F7F5] border-b border-border/40">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F5F]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#27CA40]" />
                </div>
                <div className="flex-1 mx-4 h-7 flex items-center justify-center rounded-md bg-white border border-border/40">
                  <svg className="w-3 h-3 mr-1.5 text-foreground-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span className="text-[11px] font-mono text-foreground-muted">seocontent.ai</span>
                </div>
                <div className="w-16" />
              </div>

              {/* Main content area */}
              <div className="flex min-h-[400px]">
                {/* Website preview — dark theme */}
                <div className="flex-1 relative bg-[#0D1117] p-6 space-y-4">
                  {/* SEOContent.ai nav */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)' }}>
                        <span className="text-[#0D1117] text-[11px] font-bold">S</span>
                      </div>
                      <span className="text-[11px] font-semibold text-white">seocontent</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-10 rounded-full bg-white/20" />
                      <div className="h-2 w-12 rounded-full bg-white/20" />
                      <div className="h-2 w-10 rounded-full bg-white/20" />
                      <div className="h-2 w-14 rounded-full bg-white/20" />
                      <div className="h-7 w-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)' }}>
                        <span className="text-[9px] font-semibold text-[#0D1117]">Get Started</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero headline area */}
                  <div className="pt-6 space-y-3">
                    <div className="h-5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #40EDC3, #7FFBA9)' }} />
                    <div className="space-y-2">
                      <div className="h-5 w-72 rounded bg-white/90" />
                      <div className="h-5 w-56 rounded bg-white/90" />
                    </div>
                    <div className="h-3 w-80 rounded-full bg-white/40 mt-2" />
                    <div className="h-3 w-56 rounded-full bg-white/30" />
                    <div className="flex gap-3 pt-3">
                      <div className="h-9 w-32 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)' }}>
                        <span className="text-[10px] font-semibold text-[#0D1117]">Get Started</span>
                      </div>
                      <div className="h-9 w-28 rounded-full border border-white/30 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-white/80">Join Discord</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature cards — SEOContent features */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    {[
                      { label: 'Bulk Content', icon: 'M4 4h16v2H4zm0 7h10v2H4zm0 7h16v2H4z' },
                      { label: 'Content Clusters', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
                      { label: 'Multi-Language', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
                    ].map((card, i) => (
                      <div key={i} className="rounded-xl border border-white/10 p-3 space-y-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(64,237,195,0.15), rgba(127,251,169,0.15))' }}>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="url(#featureGrad)" strokeWidth="1.5"><path d={card.icon}/></svg>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/15" />
                        <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-3 pt-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex-1 h-14 rounded-xl border border-white/10 flex items-center px-3 gap-2.5">
                        <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(64,237,195,0.12), rgba(127,251,169,0.12))' }} />
                        <div className="space-y-1">
                          <div className="h-2 w-16 rounded-full bg-white/15" />
                          <div className="h-1.5 w-10 rounded-full bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scan line */}
                  {!scanComplete && <div className="scan-line" style={{ animationDuration: '2.5s' }} />}
                </div>

                {/* Extraction panel */}
                <div className="hidden md:flex w-[210px] shrink-0 border-l border-border/40 bg-[#FAFAF9] flex-col">
                  <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Extracted</span>
                    <span className="text-[9px] font-mono text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-full">Live</span>
                  </div>

                  <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                    {/* Colors */}
                    <div>
                      <span className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">Colors</span>
                      <div className="mt-2.5 flex gap-1.5">
                        {['#0D1117','#40EDC3','#7FFBA9','#D3F89A','#FFFFFF'].map(c => (
                          <div key={c} className="w-6 h-6 rounded-lg border border-black/5 shadow-sm cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    </div>

                    {/* Typefaces */}
                    <div>
                      <span className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">Typefaces</span>
                      <div className="mt-2.5 space-y-1.5">
                        <div className="text-[12px] font-bold text-graphite leading-tight">Inter</div>
                        <div className="text-[10px] text-foreground-muted font-mono">DM Sans</div>
                      </div>
                    </div>

                    {/* Logo variants */}
                    <div>
                      <span className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">Logos</span>
                      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Full', bg: 'bg-white', border: true },
                          { label: 'Mark', bg: 'bg-[#40EDC3]', text: 'text-[#0D1117]' },
                          { label: 'Light', bg: 'bg-white', border: true },
                          { label: 'Dark', bg: 'bg-[#0D1117]', text: 'text-white' },
                        ].map(v => (
                          <div key={v.label} className={`h-9 rounded-lg ${v.bg} ${v.border ? 'border border-border/40' : ''} flex items-center justify-center`}>
                            <span className={`text-[9px] font-semibold ${v.text || 'text-foreground-muted'}`}>{v.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Spacing */}
                    <div>
                      <span className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">Spacing</span>
                      <div className="mt-2.5 flex items-end gap-1">
                        {[4,8,12,16,24,32,48,64].map(v => (
                          <div key={v} className="w-3.5 rounded-sm hover:opacity-80 transition-opacity" style={{ height: Math.min(v * 0.4, 32), background: 'linear-gradient(180deg, #40EDC3, #7FFBA9)' }} />
                        ))}
                      </div>
                    </div>

                    {/* Radius */}
                    <div>
                      <span className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">Radius</span>
                      <div className="mt-2.5 flex gap-1.5">
                        {[4,8,12,16].map(v => (
                          <div key={v} className="w-8 h-8 border bg-[#40EDC3]/5" style={{ borderRadius: v, borderColor: 'rgba(64,237,195,0.3)' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-border/30 bg-white/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-foreground-muted">96 tokens</span>
                      <span className="text-[9px] font-mono text-brand-orange font-semibold">Export JSON</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Taper ─── */
function TrustTaper() {
  const partners = [
    { name: 'Vercel', logo: 'V' },
    { name: 'Stripe', logo: 'S' },
    { name: 'Notion', logo: 'N' },
    { name: 'Figma', logo: 'F' },
    { name: 'Linear', logo: 'L' },
    { name: 'Supabase', logo: 'SB' },
  ];

  return (
    <section className="py-14 bg-white border-b border-border/50">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap">
          {partners.map(p => (
            <div key={p.name} className="flex items-center gap-2 opacity-30 hover:opacity-60 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-lg bg-graphite/8 flex items-center justify-center">
                <span className="text-[11px] font-bold text-graphite/60">{p.logo}</span>
              </div>
              <span className="text-[14px] font-semibold text-graphite/50 tracking-tight">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Extraction Section ─── */
function BrandExtractionSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const categories = [
    { num: '01', title: 'Brand assets', desc: 'Logos, marks, wordmarks, favicon, and illustrations' },
    { num: '02', title: 'Color system', desc: 'Primary, secondary, semantic, and gradient tokens' },
    { num: '03', title: 'Typography', desc: 'Font families, weights, sizes, and line heights' },
    { num: '04', title: 'Interface tokens', desc: 'Spacing, radius, shadows, and borders' },
    { num: '05', title: 'Components', desc: 'Buttons, forms, cards, and navigation patterns' },
    { num: '06', title: 'Layout behavior', desc: 'Grid systems, breakpoints, and alignment patterns' },
  ];

  useEffect(() => {
    if (prefersReducedMotion) {
      setScanPhase('done');
      return;
    }
    setScanPhase('scanning');
    const t = setTimeout(() => setScanPhase('done'), 1500);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (paused || scanPhase !== 'done' || prefersReducedMotion) return;
    timerRef.current = setInterval(() => {
      setActive(i => (i + 1) % 6);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, scanPhase, prefersReducedMotion]);

  function handleSelect(i: number) {
    setActive(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 12000);
  }

  const highlights: Record<number, { top: string; left: string; w: string; h: string; label: string }[]> = {
    0: [
      { top: '6%', left: '4%', w: '14%', h: '9%', label: 'Logo' },
      { top: '6%', left: '20%', w: '12%', h: '5%', label: 'Favicon' },
    ],
    1: [
      { top: '30%', left: '4%', w: '24%', h: '8%', label: 'Buttons' },
      { top: '42%', left: '4%', w: '18%', h: '6%', label: 'Links' },
      { top: '55%', left: '4%', w: '90%', h: '10%', label: 'Backgrounds' },
    ],
    2: [
      { top: '18%', left: '4%', w: '40%', h: '10%', label: 'Headings' },
      { top: '30%', left: '4%', w: '50%', h: '6%', label: 'Body text' },
      { top: '38%', left: '4%', w: '30%', h: '5%', label: 'Labels' },
    ],
    3: [
      { top: '55%', left: '4%', w: '90%', h: '14%', label: 'Spacing' },
      { top: '72%', left: '4%', w: '45%', h: '10%', label: 'Radius' },
      { top: '72%', left: '52%', w: '42%', h: '10%', label: 'Shadows' },
    ],
    4: [
      { top: '30%', left: '4%', w: '24%', h: '8%', label: 'Buttons' },
      { top: '42%', left: '4%', w: '40%', h: '10%', label: 'Cards' },
      { top: '6%', left: '4%', w: '90%', h: '8%', label: 'Navigation' },
    ],
    5: [
      { top: '4%', left: '4%', w: '92%', h: '88%', label: 'Grid' },
    ],
  };

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white border-y border-border/50">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        {/* Header */}
        <RevealSection>
          <Badge variant="secondary" className="text-[11px] font-medium px-3 py-1 mb-4">Brand extraction</Badge>
          <h2 className="text-section font-bold text-graphite max-w-2xl">
            From website to brand system in seconds.
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary max-w-xl leading-relaxed">
            The platform analyzes the visible design language across your website and transforms recurring decisions into structured brand data.
          </p>
        </RevealSection>

        {/* Two-column layout */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT: Website preview */}
          <RevealSection className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F8F7F5] border-b border-border/40">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F5F]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#27CA40]" />
                </div>
                <div className="flex-1 mx-4 h-7 flex items-center justify-center rounded-md bg-white border border-border/40">
                  <svg className="w-3 h-3 mr-1.5 text-foreground-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span className="text-[11px] font-mono text-foreground-muted">seocontent.ai</span>
                </div>
                <div className="w-16" />
              </div>

              {/* Website content */}
              <div className="relative bg-[#0D1117] min-h-[420px] p-6 space-y-4 overflow-hidden">
                {/* Nav */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)' }}>
                      <span className="text-[#0D1117] text-[11px] font-bold">S</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white">seocontent</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-10 rounded-full bg-white/20" />
                    <div className="h-2 w-12 rounded-full bg-white/20" />
                    <div className="h-2 w-10 rounded-full bg-white/20" />
                    <div className="h-7 w-20 rounded-full" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)' }} />
                  </div>
                </div>

                {/* Hero */}
                <div className="pt-4 space-y-3">
                  <div className="h-5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #40EDC3, #7FFBA9)' }} />
                  <div className="space-y-2">
                    <div className="h-5 w-72 rounded bg-white/90" />
                    <div className="h-5 w-56 rounded bg-white/90" />
                  </div>
                  <div className="h-3 w-80 rounded-full bg-white/40 mt-2" />
                  <div className="h-3 w-56 rounded-full bg-white/30" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-9 w-32 rounded-full" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)' }} />
                    <div className="h-9 w-28 rounded-full border border-white/30" />
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-3 gap-3 pt-3">
                  {[0,1,2].map(i => (
                    <div key={i} className="rounded-xl border border-white/10 p-3 space-y-2">
                      <div className="w-9 h-9 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(64,237,195,0.15), rgba(127,251,169,0.15))' }} />
                      <div className="h-2 w-full rounded-full bg-white/15" />
                      <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-3 pt-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="flex-1 h-14 rounded-xl border border-white/10 flex items-center px-3 gap-2.5">
                      <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(64,237,195,0.12), rgba(127,251,169,0.12))' }} />
                      <div className="space-y-1">
                        <div className="h-2 w-16 rounded-full bg-white/15" />
                        <div className="h-1.5 w-10 rounded-full bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="h-2 w-16 rounded-full bg-white/10" />
                    <div className="h-2 w-20 rounded-full bg-white/10" />
                    <div className="h-2 w-14 rounded-full bg-white/10" />
                  </div>
                  <div className="h-2 w-24 rounded-full bg-white/8" />
                </div>

                {/* Scan line */}
                {scanPhase === 'scanning' && <div className="scan-line" style={{ animationDuration: '2s' }} />}

                {/* Detection highlights */}
                <div className="absolute inset-0 pointer-events-none transition-all duration-700">
                  {(highlights[active] || []).map((h, i) => (
                    <div
                      key={`${active}-${i}`}
                      className="absolute border border-[#40EDC3]/60 rounded-md animate-[regionHighlight_0.6s_ease-out_forwards] opacity-0"
                      style={{ top: h.top, left: h.left, width: h.w, height: h.h, animationDelay: `${i * 150}ms` }}
                    >
                      <span className="absolute -top-5 left-0 text-[8px] font-mono text-[#40EDC3] bg-[#0D1117]/80 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {h.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Completion badge */}
                {scanPhase === 'done' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#40EDC3]/10 border border-[#40EDC3]/30 rounded-full px-2.5 py-1 animate-[fadeIn_0.4s_ease-out]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#40EDC3] animate-pulse" />
                    <span className="text-[9px] font-mono text-[#40EDC3]">Analyzing visible interface...</span>
                  </div>
                )}
              </div>
            </div>
          </RevealSection>

          {/* RIGHT: Category cards */}
          <RevealSection delay={0.15} className="lg:col-span-5">
            <div className="space-y-2">
              {categories.map((cat, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={cat.num}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
                      isActive
                        ? 'bg-warm-offwhite border-border/50 shadow-sm'
                        : 'border-transparent hover:bg-warm-offwhite/40 hover:border-border/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-[11px] font-mono mt-0.5 tabular-nums ${isActive ? 'text-brand-orange font-bold' : 'text-foreground-muted'}`}>
                        {cat.num}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold ${isActive ? 'text-graphite' : 'text-foreground-secondary'}`}>
                          {cat.title}
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">{cat.desc}</p>

                        {/* Expanded preview for active card */}
                        {isActive && (
                          <div className="mt-3 pt-3 border-t border-border/30 animate-[fadeIn_0.3s_ease-out]">
                            {i === 0 && <BrandAssetsPreview />}
                            {i === 1 && <ColorSystemPreview />}
                            {i === 2 && <TypographyPreview />}
                            {i === 3 && <InterfaceTokensPreview />}
                            {i === 4 && <ComponentsPreview />}
                            {i === 5 && <LayoutBehaviorPreview />}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-0.5 transition-transform duration-300 ${isActive ? 'text-brand-orange rotate-90' : 'text-foreground-subtle'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status bar */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-border/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((active + 1) / 6) * 100}%`,
                    background: 'linear-gradient(90deg, #FF5F45, #FF8A5B, #F2B84B)',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-foreground-muted tabular-nums">{active + 1}/6</span>
            </div>
            <p className="mt-3 text-[11px] text-foreground-muted">
              {scanPhase === 'done'
                ? 'Brand system generated — 6 categories organized from the visible website interface'
                : 'Scanning website design language...'}
            </p>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Category Previews ─── */
function BrandAssetsPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Primary', bg: 'bg-white', border: true },
        { label: 'Mark', bg: 'bg-[#40EDC3]', text: 'text-[#0D1117]' },
        { label: 'Light', bg: 'bg-white', border: true },
        { label: 'Dark', bg: 'bg-[#0D1117]', text: 'text-white' },
        { label: 'Favicon', bg: 'bg-white', border: true, small: true },
        { label: 'Wordmark', bg: 'bg-white', border: true },
      ].map(v => (
        <div key={v.label} className={`${v.small ? 'h-7' : 'h-9'} rounded-lg ${v.bg} ${v.border ? 'border border-border/40' : ''} flex items-center justify-center`}>
          <span className={`text-[8px] font-semibold ${v.text || 'text-foreground-muted'}`}>{v.label}</span>
        </div>
      ))}
    </div>
  );
}

function ColorSystemPreview() {
  const colors = [
    { hex: '#0D1117', name: 'surface.default' },
    { hex: '#40EDC3', name: 'brand.primary' },
    { hex: '#7FFBA9', name: 'brand.secondary' },
    { hex: '#D3F89A', name: 'brand.accent' },
    { hex: '#FFFFFF', name: 'text.primary' },
    { hex: '#1A2332', name: 'surface.elevated' },
  ];
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {colors.map(c => (
          <div key={c.hex} className="w-7 h-7 rounded-md border border-black/5 cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c.hex }} title={c.name} />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-4 rounded" style={{ background: 'linear-gradient(90deg, #40EDC3, #7FFBA9, #D3F89A)' }} />
        <div className="flex-1 h-4 rounded" style={{ background: 'linear-gradient(135deg, #0D1117, #1A2332)' }} />
      </div>
    </div>
  );
}

function TypographyPreview() {
  return (
    <div className="space-y-1.5">
      <div className="text-[14px] font-bold text-graphite leading-tight">Inter Bold — 24px</div>
      <div className="text-[11px] font-semibold text-graphite/70">Inter Semibold — 16px</div>
      <div className="text-[10px] text-foreground-secondary leading-relaxed">Inter Regular — 14px / 1.5 line height</div>
      <div className="text-[9px] font-mono text-foreground-muted">DM Sans — Labels & Captions</div>
    </div>
  );
}

function InterfaceTokensPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1">
        {[4,8,12,16,24,32,48].map(v => (
          <div key={v} className="w-3 rounded-sm" style={{ height: Math.min(v * 0.5, 24), background: 'linear-gradient(180deg, #40EDC3, #7FFBA9)' }} />
        ))}
      </div>
      <div className="flex gap-1.5">
        {[2,4,8,12].map(v => (
          <div key={v} className="w-7 h-7 border border-[#40EDC3]/30 bg-[#40EDC3]/5" style={{ borderRadius: v }} />
        ))}
      </div>
    </div>
  );
}

function ComponentsPreview() {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="h-7 px-3 rounded-lg text-[9px] font-semibold flex items-center" style={{ background: 'linear-gradient(135deg, #40EDC3, #7FFBA9)', color: '#0D1117' }}>Button</div>
        <div className="h-7 px-3 rounded-lg border border-white/20 text-[9px] font-medium flex items-center text-white/70">Outline</div>
        <div className="h-7 px-3 text-[9px] font-medium flex items-center text-[#40EDC3]">Text</div>
      </div>
      <div className="h-7 w-full rounded-lg border border-white/15 bg-white/5 flex items-center px-2.5">
        <span className="text-[8px] text-white/30">Input field</span>
      </div>
      <div className="h-5 w-24 rounded-full bg-white/10 flex items-center px-2">
        <span className="text-[7px] text-white/40">Badge</span>
      </div>
    </div>
  );
}

function LayoutBehaviorPreview() {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-8 rounded border border-[#40EDC3]/20 bg-[#40EDC3]/5" />
        ))}
      </div>
      <div className="flex gap-1">
        <div className="flex-[2] h-8 rounded border border-[#40EDC3]/20 bg-[#40EDC3]/5" />
        <div className="flex-1 h-8 rounded border border-[#40EDC3]/20 bg-[#40EDC3]/5" />
      </div>
      <div className="flex gap-1">
        <div className="h-8 w-12 rounded border border-[#40EDC3]/20 bg-[#40EDC3]/5" />
        <div className="h-8 flex-1 rounded border border-[#40EDC3]/20 bg-[#40EDC3]/5" />
        <div className="h-8 w-12 rounded border border-[#40EDC3]/20 bg-[#40EDC3]/5" />
      </div>
      <div className="flex gap-2 text-[8px] font-mono text-foreground-muted">
        <span>Desktop</span><span>·</span><span>Tablet</span><span>·</span><span>Mobile</span>
      </div>
    </div>
  );
}

/* ─── Extracted Brand System Section ─── */
function BrandSystemSection() {
  const colors = [
    { name: 'brand.primary.500', hex: '#FF5F45', usage: '32%' },
    { name: 'brand.primary.400', hex: '#FF8A5B', usage: '18%' },
    { name: 'brand.accent.500', hex: '#F2B84B', usage: '12%' },
    { name: 'surface.neutral.900', hex: '#1A1918', usage: '24%' },
    { name: 'surface.neutral.100', hex: '#FAF8F5', usage: '8%' },
    { name: 'interactive.focus', hex: '#6B5CE7', usage: '6%' },
  ];

  const typeStyles = [
    { role: 'Display', sample: 'Brand System', font: 'Manrope', weight: '800', size: '72px', lh: '0.95' },
    { role: 'Heading 01', sample: 'Extracted Identity', font: 'Manrope', weight: '700', size: '48px', lh: '1.05' },
    { role: 'Body', sample: 'The platform analyzes visible design language across your website.', font: 'Manrope', weight: '400', size: '18px', lh: '1.5' },
    { role: 'Label', sample: 'DESIGN TOKEN', font: 'IBM Plex Mono', weight: '500', size: '12px', lh: '1.4' },
  ];

  return (
    <section id="extraction" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <h2 className="text-section font-bold text-graphite">
                Every visual decision,<br />
                <span className="text-foreground-muted">organized and named.</span>
              </h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">
                View full extraction <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="mb-16">
            <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">Color System</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {colors.map((c) => (
                <div key={c.name} className="token-card group">
                  <div className="aspect-[4/3] rounded-xl border border-border/40 overflow-hidden relative">
                    <div className="absolute inset-0" style={{ backgroundColor: c.hex }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/40 to-transparent">
                      <span className="text-[9px] font-mono text-white/80">{c.usage}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] font-mono text-foreground-muted truncate">{c.name}</p>
                  <p className="text-xs font-mono text-graphite">{c.hex}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="mb-16">
            <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">Typography</h3>
            <div className="space-y-6">
              {typeStyles.map((t) => (
                <div key={t.role} className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-6 py-4 border-b border-border/30">
                  <div className="md:w-32 shrink-0">
                    <span className="text-xs font-mono text-foreground-muted">{t.role}</span>
                  </div>
                  <div className="flex-1" style={{ fontSize: Math.min(parseInt(t.size), 48), fontWeight: t.weight, lineHeight: t.lh, fontFamily: t.font }}>
                    <span className="text-graphite">{t.sample}</span>
                  </div>
                  <div className="md:w-48 shrink-0 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[9px] font-mono px-2 py-0.5">{t.font}</Badge>
                    <Badge variant="secondary" className="text-[9px] font-mono px-2 py-0.5">{t.weight}</Badge>
                    <Badge variant="secondary" className="text-[9px] font-mono px-2 py-0.5">{t.size}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">Spacing Scale</h3>
              <div className="space-y-3">
                {[4, 8, 12, 16, 24, 32, 48, 64, 96].map(v => (
                  <div key={v} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-foreground-muted w-8 text-right">{v}</span>
                    <div className="h-3 rounded-sm bg-brand-orange/20" style={{ width: v * 1.5 }} />
                    <span className="text-[9px] font-mono text-foreground-subtle">{v}px</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">Radius System</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'radius.sm', value: '6px', radius: 6 },
                  { name: 'radius.md', value: '12px', radius: 12 },
                  { name: 'radius.lg', value: '24px', radius: 24 },
                  { name: 'radius.full', value: '999px', radius: 999 },
                ].map(r => (
                  <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-warm-offwhite border border-border/30">
                    <div className="w-12 h-12 border-2 border-brand-orange/40" style={{ borderRadius: r.radius }} />
                    <div>
                      <p className="text-[10px] font-mono text-foreground-muted">{r.name}</p>
                      <p className="text-xs font-mono text-graphite">{r.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Design Token / JSON Export Section ─── */
function TokenSection() {
  const [copied, setCopied] = useState(false);

  const jsonExample = `{
  "brand": {
    "colors": {
      "primary": "#FF5F45",
      "secondary": "#FF8A5B",
      "accent": "#F2B84B",
      "background": "#FAF8F5",
      "text": "#1A1918"
    },
    "typography": {
      "display": "Manrope",
      "body": "Manrope",
      "mono": "IBM Plex Mono"
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "32px",
      "xl": "64px"
    },
    "radius": {
      "sm": "6px",
      "md": "12px",
      "lg": "24px",
      "full": "999px"
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden grain" style={{ background: 'linear-gradient(180deg, #1A1918 0%, #242322 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <RevealSection>
            <h2 className="text-editorial font-bold text-white leading-tight">
              Every visual decision,<br />
              converted into <span className="gradient-text">usable data.</span>
            </h2>
            <p className="mt-6 text-lg text-white/50 max-w-md leading-relaxed">
              Export extracted brand systems as structured JSON. Connect to design tools, style guides, and development workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {['Export JSON', 'Copy tokens', 'Send to Figma', 'Connect API'].map(action => (
                <Button key={action} variant="outline" size="sm" className="text-white/70 bg-white/[0.06] border-white/[0.08] hover:bg-white/[0.1] hover:text-white">
                  {action === 'Export JSON' && <FileJson className="mr-1.5 h-3.5 w-3.5" />}
                  {action === 'Send to Figma' && <Layers className="mr-1.5 h-3.5 w-3.5" />}
                  {action === 'Connect API' && <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />}
                  {action}
                </Button>
              ))}
            </div>
          </RevealSection>

          <RevealSection delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F5F]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27CA40]/60" />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 ml-2">brand-tokens.json</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-white/40 hover:text-white/70 hover:bg-white/[0.1]">
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <span className="text-[10px]">⎘</span>}
                  <span className="ml-1 text-[9px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>

              <pre className="p-5 text-[11px] font-mono leading-relaxed overflow-x-auto">
                <code>
                  {jsonExample.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-white/15 w-6 text-right mr-4 select-none">{i + 1}</span>
                      <span dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
                          .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
                          .replace(/([{}])/g, '<span class="json-bracket">$1</span>')
                      }} />
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Library Section ─── */
function LibrarySection() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className="py-24 md:py-32 bg-warm-offwhite">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <h2 className="text-section font-bold text-graphite">
            One source of truth for<br />
            <span className="text-foreground-muted">your visual identity.</span>
          </h2>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="mt-12 rounded-2xl overflow-hidden border border-border/40 bg-white">
            <div className="flex items-center gap-1 px-4 py-3 border-b border-border/30 overflow-x-auto">
              {['Overview', 'Logos', 'Colors', 'Typography', 'Icons', 'Components', 'Tokens'].map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab.toLowerCase() ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={activeTab === tab.toLowerCase() ? '' : 'text-foreground-muted'}
                >
                  {tab}
                </Button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Brand Overview</CardTitle>
                      <Badge variant="outline" className="text-[9px] font-mono">Last scanned 2h ago</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Logos', value: '6', icon: Square },
                        { label: 'Colors', value: '14', icon: Palette },
                        { label: 'Fonts', value: '3', icon: Type },
                        { label: 'Tokens', value: '128', icon: Layers },
                      ].map(stat => (
                        <div key={stat.label} className="p-3 rounded-lg bg-warm-offwhite border border-border/30">
                          <stat.icon className="w-4 h-4 text-brand-orange mb-2" />
                          <p className="text-xl font-bold text-graphite">{stat.value}</p>
                          <p className="text-[10px] text-foreground-muted">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { version: 'v3.2', date: 'Today', changes: 'Updated primary color' },
                        { version: 'v3.1', date: '3 days ago', changes: 'Added icon set' },
                        { version: 'v3.0', date: '1 week ago', changes: 'Major brand refresh' },
                        { version: 'v2.4', date: '2 weeks ago', changes: 'Typography update' },
                      ].map(v => (
                        <div key={v.version} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-graphite">{v.version} <span className="font-normal text-foreground-muted">· {v.date}</span></p>
                            <p className="text-[10px] text-foreground-muted">{v.changes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider">Workspaces</span>
                {['Brandcora', 'Client A', 'Client B'].map((brand, i) => (
                  <Button
                    key={brand}
                    variant={i === 0 ? 'default' : 'outline'}
                    size="sm"
                    className={i === 0 ? 'gradient-accent text-white' : ''}
                  >
                    {brand}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Validation Workflow Section ─── */
function ValidationSection() {
  const [uploadState, setUploadState] = useState<'idle' | 'analyzing' | 'done'>('idle');

  const handleUpload = () => {
    setUploadState('analyzing');
    setTimeout(() => setUploadState('done'), 2000);
  };

  const annotations = [
    { top: '12%', left: '8%', text: 'Logo clear space too small', color: '#FF5F45' },
    { top: '35%', left: '50%', text: 'Font weight does not match', color: '#FF8A5B' },
    { top: '60%', right: '8%', text: 'Accent color outside palette', color: '#F2B84B' },
    { top: '78%', left: '8%', text: 'Radius should be 16px', color: '#6B5CE7' },
  ];

  return (
    <section id="validation" className="py-24 md:py-32 bg-white border-y border-border/50">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <h2 className="text-section font-bold text-graphite max-w-2xl">
            Check every creative before it goes live.
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary max-w-xl leading-relaxed">
            Upload a social post, campaign visual, advertisement, presentation, or marketing asset. The platform compares it with your stored identity and highlights anything off-brand.
          </p>
        </RevealSection>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <RevealSection>
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-warm-offwhite aspect-[4/3]">
              {uploadState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="upload-zone rounded-2xl p-12 text-center cursor-pointer" onClick={handleUpload}>
                    <Upload className="w-10 h-10 text-foreground-muted mx-auto mb-4" />
                    <p className="text-sm font-semibold text-graphite">Upload creative asset</p>
                    <p className="text-xs text-foreground-muted mt-1">PNG, JPG, PDF, or SVG</p>
                  </div>
                </div>
              )}

              {uploadState === 'analyzing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
                    <p className="mt-4 text-sm font-medium text-graphite">Analyzing brand alignment...</p>
                  </div>
                </div>
              )}

              {uploadState === 'done' && (
                <>
                  <div className="absolute inset-0 p-8">
                    <div className="w-full h-full rounded-xl bg-white border border-border/40 p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-graphite" />
                        <div className="h-3 w-24 rounded bg-graphite/15" />
                      </div>
                      <div className="h-32 rounded-lg bg-lavender-soft" />
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-graphite/10" />
                        <div className="h-3 w-1/2 rounded bg-graphite/6" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-24 rounded-lg gradient-accent" />
                        <div className="h-8 w-24 rounded-lg border border-border/40" />
                      </div>
                    </div>
                  </div>
                  {annotations.map((a, i) => (
                    <div key={i} className="validation-annotation" style={{
                      top: a.top, left: a.left, right: a.right,
                      borderColor: a.color,
                      animationDelay: `${i * 0.3}s`,
                    }}>
                      <span style={{ color: a.color }}>{a.text}</span>
                    </div>
                  ))}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="scan-line" style={{ animationDuration: '2s' }} />
                  </div>
                </>
              )}
            </div>
          </RevealSection>

          <RevealSection delay={0.2}>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-extrabold gradient-text">86</span>
                    <span className="text-lg text-foreground-muted mb-1">/ 100</span>
                  </div>
                  <p className="text-sm font-medium text-graphite">Brand alignment score</p>
                  <p className="text-xs text-foreground-muted mt-1">Minor inconsistencies detected</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  {[
                    { label: 'Logo', score: 100, status: 'On brand' },
                    { label: 'Color', score: 78, status: 'Minor issues' },
                    { label: 'Typography', score: 64, status: 'Needs review' },
                    { label: 'Spacing', score: 91, status: 'On brand' },
                    { label: 'Components', score: 88, status: 'On brand' },
                  ].map(cat => (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-graphite">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-foreground-muted">{cat.score}%</span>
                          <Badge variant={cat.score >= 90 ? 'default' : cat.score >= 75 ? 'secondary' : 'destructive'} className="text-[9px]">
                            {cat.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${cat.score}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Use approved display typeface for heading',
                      'Replace accent color with brand.primary.500',
                      'Increase logo clear space from 12px to 24px',
                      'Change card radius to approved 16px token',
                    ].map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-brand-orange mt-0.5 shrink-0" />
                        <span className="text-xs text-foreground-secondary">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gradient-accent text-white">
                    Apply suggested corrections
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Workflow Timeline Section ─── */
function WorkflowSection() {
  const steps = [
    { num: '01', label: 'Paste a website', desc: 'Enter any public URL' },
    { num: '02', label: 'Analyze the visual system', desc: 'AI-powered extraction' },
    { num: '03', label: 'Review extracted identity', desc: 'Organized brand data' },
    { num: '04', label: 'Export or store', desc: 'JSON, Figma, API' },
    { num: '05', label: 'Upload a creative', desc: 'Any marketing asset' },
    { num: '06', label: 'Validate consistency', desc: 'Automated brand check' },
    { num: '07', label: 'Share approval', desc: 'Team-ready reports' },
  ];

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <div className="text-center mb-16">
            <h2 className="text-section font-bold text-graphite">
              From discovery to validation in seven steps.
            </h2>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="relative">
            <div className="absolute top-8 left-0 right-0 h-0.5 hidden md:block" style={{
              background: 'linear-gradient(90deg, #FF5F45, #FF8A5B, #F2B84B, #FF5F45, #FF8A5B, #F2B84B, #FF5F45)',
            }} />
            <div className="grid grid-cols-2 md:grid-cols-7 gap-6 md:gap-4">
              {steps.map((step) => (
                <div key={step.num} className="relative text-center">
                  <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-white border border-border/40 flex items-center justify-center mb-4">
                    <span className="text-sm font-mono font-bold gradient-text">{step.num}</span>
                  </div>
                  <h3 className="text-xs font-bold text-graphite mb-1">{step.label}</h3>
                  <p className="text-[10px] text-foreground-muted">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Use Cases Section ─── */
function UseCasesSection() {
  const useCases = [
    { title: 'Brand Teams', desc: 'Maintain one authoritative identity system. Every stakeholder accesses the same verified brand data.', tag: 'Identity' },
    { title: 'Marketing Teams', desc: 'Check campaign graphics before publication. No more guessing whether colors or fonts are correct.', tag: 'Campaigns' },
    { title: 'Agencies', desc: 'Extract and manage brand systems across multiple clients from a single workspace.', tag: 'Multi-client' },
    { title: 'Developers', desc: 'Export structured tokens and JSON for implementation. Design-to-code without translation errors.', tag: 'Tokens' },
    { title: 'Social Teams', desc: 'Validate daily content without waiting for manual design reviews. Instant brand compliance.', tag: 'Content' },
    { title: 'Product Teams', desc: 'Compare website implementation with established design rules. Catch drift early.', tag: 'Quality' },
  ];

  return (
    <section className="py-24 md:py-32 bg-warm-offwhite">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <div className="max-w-2xl mb-16">
            <h2 className="text-section font-bold text-graphite">
              Built for every team responsible<br />
              <span className="text-foreground-muted">for the brand.</span>
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc, i) => (
            <RevealSection key={uc.title} delay={i * 0.06}>
              <Card className="h-full hover:border-brand-orange/20 transition-all duration-300 cursor-pointer">
                <CardContent className="pt-6">
                  <Badge variant="secondary" className="text-[9px] font-mono mb-2">{uc.tag}</Badge>
                  <h3 className="text-base font-bold text-graphite mt-2">{uc.title}</h3>
                  <p className="text-sm text-foreground-muted mt-2 leading-relaxed">{uc.desc}</p>
                </CardContent>
              </Card>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Security Section ─── */
function SecuritySection() {
  const features = [
    { icon: Lock, title: 'Private brand libraries', desc: 'Your data stays in your workspace' },
    { icon: Shield, title: 'Team permissions', desc: 'Configurable access control' },
    { icon: Eye, title: 'Version history', desc: 'Track every change over time' },
    { icon: Layers, title: 'Export control', desc: 'Manage who can export data' },
  ];

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-section font-bold text-graphite">
                Your brand systems remain organized inside private workspaces with configurable team access.
              </h2>
              <p className="mt-6 text-base text-foreground-secondary leading-relaxed">
                Controlled access. Private brand libraries. Secure asset storage. Version history. Data deletion. Enterprise workspace options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <RevealSection key={f.title} delay={i * 0.1}>
                  <Card>
                    <CardContent className="pt-6">
                      <f.icon className="w-5 h-5 text-brand-orange mb-3" />
                      <h3 className="text-sm font-bold text-graphite">{f.title}</h3>
                      <p className="text-xs text-foreground-muted mt-1">{f.desc}</p>
                    </CardContent>
                  </Card>
                </RevealSection>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Pricing Section ─── */
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Try Brandcora with no commitment.',
      features: [
        '1 brand profile',
        '3 website scans / month',
        '1 social check / month',
        'Basic extracted tokens',
        'JSON export',
      ],
      cta: 'Get started',
      href: '/register',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$5',
      period: '/ month',
      description: 'For teams that need consistent brand control.',
      features: [
        'Unlimited brand profiles',
        'Unlimited website scans',
        'Unlimited social checks',
        'Full design-token export',
        'Brand validation reports',
        '10 pages per scan',
        '90-day scan history',
        'Priority support',
      ],
      cta: 'Get unlimited access',
      href: '/pricing',
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-white border-y border-border/50">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <RevealSection>
          <div className="text-center mb-12">
            <h2 className="text-section font-bold text-graphite">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-lg text-foreground-secondary">
              Start free. Upgrade when you need more.
            </p>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-brand-orange/30' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <Badge className="gradient-accent text-white border-0 text-[10px] uppercase tracking-wider">Most popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-graphite">{plan.price}</span>
                    <span className="text-sm text-foreground-muted ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={`w-full ${plan.popular ? 'gradient-accent text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </RevealSection>

        <RevealSection>
          <p className="text-center text-sm text-foreground-muted mt-8">
            All paid plans include a 14-day free trial. No credit card required.
          </p>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Final CTA Section ─── */
function FinalCTA() {
  const [url, setUrl] = useState('');

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: '#FAF8F5' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.06) 0%, rgba(242,184,75,0.03) 40%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1280px] px-8 md:px-12 text-center">
        <RevealSection>
          <h2 className="text-editorial font-bold text-graphite leading-tight max-w-2xl mx-auto">
            Discover the brand system<br />
            <span className="gradient-text">already inside your website.</span>
          </h2>
          <p className="mt-5 text-lg text-foreground-secondary max-w-lg mx-auto leading-relaxed">
            Paste a URL to extract your visual identity, organize your design tokens, and validate every creative asset against one consistent system.
          </p>
          <div className="mt-8 flex justify-center">
            <form onSubmit={(e) => { e.preventDefault(); if (url.trim()) window.location.href = '/scans/new-website'; }} className="max-w-[520px] w-full">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="h-12 text-[15px]"
                />
                <Button type="submit" size="lg" className="shrink-0 h-12 px-6 gradient-accent text-white">
                  Analyze website
                </Button>
              </div>
            </form>
          </div>
          <p className="mt-3 text-[12px] text-foreground-muted">No credit card required. Start with any public website.</p>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1A1918 0%, #141312 100%)' }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 pt-20 pb-12">
        <div className="mb-16">
          <h2 className="text-[clamp(3rem,10vw,8rem)] font-extrabold text-white/5 leading-none tracking-tight">
            Brandcora
          </h2>
          <p className="mt-4 text-sm text-white/30 max-w-md">
            A brand intelligence platform that discovers, organizes, and validates a company&apos;s complete visual identity.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['How it works', 'Brand extraction', 'Brand validation', 'Pricing'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Developers</h4>
            <ul className="space-y-2.5">
              {['API documentation', 'JSON export', 'Webhooks', 'SDK'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About', 'Blog', 'Contact', 'Careers'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy policy', 'Terms of service', 'Security'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="w-6 h-6 opacity-60" />
            <span className="text-sm text-white/30">&copy; 2026 Brandcora. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white/70 hover:bg-transparent">
              <Link href="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-white/90 text-graphite hover:bg-white">
              <Link href="/auth">
                Scan a website <ArrowRight className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <TrustTaper />
        <BrandExtractionSection />
        <BrandSystemSection />
        <TokenSection />
        <LibrarySection />
        <ValidationSection />
        <WorkflowSection />
        <UseCasesSection />
        <SecuritySection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
