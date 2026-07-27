'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Download, Check, ChevronRight, Upload, Shield, Lock, Eye, FileJson, Layers, Palette, Type, Ruler, Square, MousePointer, Search, ArrowUpRight } from 'lucide-react';

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
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5F45" />
          <stop offset="48%" stopColor="#FF8A5B" />
          <stop offset="100%" stopColor="#F2B84B" />
        </linearGradient>
      </defs>
      <rect x="4" y="12" width="4" height="4" rx="1" fill="url(#logoGrad)" />
      <rect x="10" y="6" width="4" height="16" rx="1" fill="url(#logoGrad)" />
      <rect x="16" y="4" width="4" height="20" rx="1" fill="url(#logoGrad)" />
      <rect x="22" y="8" width="4" height="14" rx="1" fill="url(#logoGrad)" />
      <rect x="28" y="14" width="4" height="6" rx="1" fill="url(#logoGrad)" />
    </svg>
  );
}

/* ─── URL Input Component ─── */
function URLInput({ size = 'large', onSubmit }: { size?: 'large' | 'default'; onSubmit?: (url: string) => void }) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onSubmit) onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${size === 'large' ? 'w-full max-w-xl' : 'w-full max-w-md'}`}>
      <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
        focused
          ? 'border-brand-orange/40 shadow-[0_0_0_4px_rgba(255,95,69,0.08)] bg-white'
          : 'border-border-strong bg-white/80 hover:border-border-strong/80'
      } ${size === 'large' ? 'px-5 py-4' : 'px-4 py-3'}`}>
        <Search className={`${size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} text-foreground-muted shrink-0`} />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="https://yourbrand.com"
          className={`flex-1 bg-transparent border-none outline-none ml-3 font-mono ${
            size === 'large' ? 'text-base' : 'text-sm'
          } text-foreground placeholder:text-foreground-subtle`}
        />
        <button
          type="submit"
          className={`shrink-0 gradient-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5 ${
            size === 'large' ? 'px-6 py-2.5 text-sm' : 'px-4 py-2 text-xs'
          }`}
        >
          Analyze brand
        </button>
      </div>
    </form>
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
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 transition-all duration-500">
        <nav className={`flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border border-black/[0.04] shadow-[0_2px_20px_rgba(0,0,0,0.04)]'
            : 'bg-transparent'
        }`}>
          <Link href="/" className="flex items-center gap-3">
            <LogoMark className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight text-graphite">Brandcora</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['How it works', 'Extraction', 'Validation', 'Developers'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-300">
              Sign in
            </Link>
            <Link href="/auth"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-accent hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5">
              Scan a website
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const [scanPhase, setScanPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanPhase(p => (p < 5 ? p + 1 : p));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grain" style={{ background: 'linear-gradient(180deg, #FAF8F5 0%, #F0EBF5 40%, #FAF8F5 100%)' }}>
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-60 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.08) 0%, rgba(242,184,75,0.04) 50%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 md:px-12 lg:px-16 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="animate-fade-up">
              <span className="section-label">Brand Intelligence Platform</span>
            </div>

            <h1 className="animate-fade-up-delay-1">
              <span className="block text-display font-extrabold text-graphite leading-[0.92]">
                Turn any website
              </span>
              <span className="block text-display font-extrabold leading-[0.92]">
                into a complete
              </span>
              <span className="block text-display font-extrabold leading-[0.92]">
                <span className="gradient-text">brand system.</span>
              </span>
            </h1>

            <p className="animate-fade-up-delay-2 text-lg text-foreground-secondary max-w-md leading-relaxed">
              Paste a website URL and automatically discover its logos, colors, typography, icons, spacing, radius, components, and design tokens. Export as JSON, then validate every new creative asset against it.
            </p>

            <div className="animate-fade-up-delay-3">
              <URLInput size="large" onSubmit={() => {}} />
              <p className="mt-3 text-xs text-foreground-muted font-mono">No setup required. Start with any public website.</p>
            </div>
          </div>

          {/* Right: Scanning visualization */}
          <div className="lg:col-span-7 animate-fade-up-delay-2">
            <div className="relative">
              {/* Browser frame */}
              <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-elevated bg-white">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-warm-offwhite border-b border-border/40">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F5F]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <div className="flex-1 mx-4 px-3 py-1.5 rounded-lg bg-white border border-border/40 text-xs font-mono text-foreground-muted text-center">
                    yourbrand.com
                  </div>
                </div>

                {/* Website preview with scan overlay */}
                <div className="relative aspect-[16/10] bg-white overflow-hidden">
                  {/* Simulated website content */}
                  <div className="absolute inset-0 p-6 space-y-4">
                    {/* Nav */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-graphite" />
                        <div className="h-3 w-20 rounded bg-graphite/20" />
                      </div>
                      <div className="flex gap-3">
                        <div className="h-2 w-12 rounded bg-graphite/10" />
                        <div className="h-2 w-12 rounded bg-graphite/10" />
                        <div className="h-2 w-12 rounded bg-graphite/10" />
                      </div>
                    </div>

                    {/* Hero area */}
                    <div className="space-y-2 pt-4">
                      <div className="h-5 w-48 rounded bg-graphite/15" />
                      <div className="h-5 w-36 rounded bg-graphite/10" />
                      <div className="h-2 w-64 rounded bg-graphite/8 mt-2" />
                      <div className="h-2 w-48 rounded bg-graphite/6" />
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
                          <div className="h-12 rounded bg-lavender-soft" />
                          <div className="h-2 w-full rounded bg-graphite/8" />
                          <div className="h-2 w-2/3 rounded bg-graphite/6" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scanning line */}
                  <div className="scan-line" />

                  {/* Detection regions */}
                  {scanPhase >= 1 && (
                    <div className="scan-region" style={{ top: '8%', left: '4%', width: '25%', height: '12%' }}>
                      <span className="scan-label">Logo detected</span>
                    </div>
                  )}
                  {scanPhase >= 2 && (
                    <div className="scan-region" style={{ top: '28%', left: '4%', width: '50%', height: '18%' }}>
                      <span className="scan-label">Typeface identified</span>
                    </div>
                  )}
                  {scanPhase >= 3 && (
                    <div className="scan-region" style={{ top: '20%', right: '4%', width: '30%', height: '10%' }}>
                      <span className="scan-label">14 color tokens</span>
                    </div>
                  )}
                  {scanPhase >= 4 && (
                    <div className="scan-region" style={{ top: '56%', left: '4%', width: '92%', height: '36%' }}>
                      <span className="scan-label">32 spacing tokens</span>
                    </div>
                  )}
                  {scanPhase >= 5 && (
                    <div className="scan-region" style={{ top: '56%', left: '4%', width: '28%', height: '36%' }}>
                      <span className="scan-label">8 radius values</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted tokens floating beside */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 space-y-2 hidden xl:block">
                {[
                  { label: 'Colors', count: '14', color: '#FF5F45' },
                  { label: 'Fonts', count: '3', color: '#FF8A5B' },
                  { label: 'Spacing', count: '32', color: '#F2B84B' },
                  { label: 'Icons', count: '46', color: '#6B5CE7' },
                ].map((token, i) => (
                  <div key={token.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-border/40 shadow-soft"
                    style={{ animationDelay: `${i * 0.2}s` }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.color }} />
                    <span className="text-xs font-mono text-foreground-muted">{token.label}</span>
                    <span className="text-xs font-bold text-graphite">{token.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Live Scanning Section ─── */
function ScanningSection() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { num: '01', title: 'Brand assets', desc: 'Logos, marks, wordmarks, favicon, illustrations', detail: 'Primary logo, secondary variations, monogram, light/dark versions' },
    { num: '02', title: 'Color system', desc: 'Primary, secondary, semantic, gradient tokens', detail: 'Usage frequency, contrast pairs, gradient definitions' },
    { num: '03', title: 'Typography', desc: 'Font families, weights, sizes, line heights', detail: 'Heading hierarchy, body styles, letter spacing, transforms' },
    { num: '04', title: 'Interface tokens', desc: 'Spacing, radius, shadows, borders', detail: 'Padding, margins, grid gaps, container widths' },
    { num: '05', title: 'Components', desc: 'Buttons, forms, cards, navigation patterns', detail: 'Reusable interface elements with consistent styling' },
    { num: '06', title: 'Layout behavior', desc: 'Grid systems, breakpoints, alignment patterns', detail: 'Responsive columns, container widths, alignment logic' },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white border-y border-border/50">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <span className="section-label">From website to brand system in seconds</span>
          <h2 className="mt-4 text-section font-bold text-graphite max-w-2xl">
            The platform analyzes the visible design language across your website and transforms recurring decisions into structured brand data.
          </h2>
        </RevealSection>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Website preview */}
          <RevealSection className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-warm-offwhite aspect-[4/3]">
              <div className="absolute inset-0 construction-grid opacity-50" />
              {/* Simulated detected elements */}
              <div className="absolute inset-0 p-8">
                <div className="space-y-6">
                  {/* Logo detection */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-accent" />
                    <div className="scan-region !relative !top-auto !left-auto" style={{ width: 80, height: 12 }}>
                      <span className="scan-label">Logo</span>
                    </div>
                  </div>

                  {/* Color detection */}
                  <div className="flex gap-2">
                    {['#FF5F45', '#FF8A5B', '#F2B84B', '#1A1918', '#6B5CE7'].map((c, i) => (
                      <div key={c} className="relative">
                        <div className="w-10 h-10 rounded-lg border border-border/40" style={{ backgroundColor: c }} />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-foreground-muted whitespace-nowrap">{c}</span>
                      </div>
                    ))}
                  </div>

                  {/* Typography detection */}
                  <div className="space-y-2 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-40 rounded bg-graphite/15" />
                      <span className="text-[9px] font-mono text-brand-orange">Display / 72px / 0.95</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-32 rounded bg-graphite/10" />
                      <span className="text-[9px] font-mono text-brand-orange">Heading / 48px / 1.05</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-56 rounded bg-graphite/8" />
                      <span className="text-[9px] font-mono text-brand-orange">Body / 18px / 1.5</span>
                    </div>
                  </div>

                  {/* Spacing detection */}
                  <div className="flex items-center gap-1 pt-2">
                    {[8, 16, 24, 32, 48, 64].map(v => (
                      <div key={v} className="flex flex-col items-center">
                        <div className="w-8 rounded bg-brand-orange/10" style={{ height: v / 2 }} />
                        <span className="text-[7px] font-mono text-foreground-muted mt-1">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scan line */}
              <div className="scan-line" style={{ animationDuration: '4s' }} />
            </div>
          </RevealSection>

          {/* Right: Steps */}
          <RevealSection delay={0.2} className="lg:col-span-5">
            <div className="space-y-1">
              {steps.map((step, i) => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    activeStep === i
                      ? 'bg-warm-offwhite border border-border/40'
                      : 'hover:bg-warm-offwhite/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`text-xs font-mono mt-0.5 ${activeStep === i ? 'text-brand-orange' : 'text-foreground-muted'}`}>
                      {step.num}
                    </span>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold ${activeStep === i ? 'text-graphite' : 'text-foreground-secondary'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-foreground-muted mt-1">{step.desc}</p>
                      {activeStep === i && (
                        <p className="text-xs text-foreground-secondary mt-2 leading-relaxed">{step.detail}</p>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-0.5 transition-transform ${activeStep === i ? 'text-brand-orange rotate-90' : 'text-foreground-subtle'}`} />
                  </div>
                </button>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
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
    { role: 'Display', sample: 'Brand Intelligence', font: 'Manrope', weight: '800', size: '72px', lh: '0.95' },
    { role: 'Heading 01', sample: 'Extracted System', font: 'Manrope', weight: '700', size: '48px', lh: '1.05' },
    { role: 'Body', sample: 'The platform analyzes visible design language across your website.', font: 'Manrope', weight: '400', size: '18px', lh: '1.5' },
    { role: 'Label', sample: 'DESIGN TOKEN', font: 'IBM Plex Mono', weight: '500', size: '12px', lh: '1.4' },
  ];

  return (
    <section id="extraction" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <span className="section-label">Extracted Brand System</span>
              <h2 className="mt-4 text-section font-bold text-graphite">
                Every visual decision,<br />
                <span className="text-foreground-muted">organized and named.</span>
              </h2>
            </div>
            <Link href="/auth" className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-graphite transition-colors">
              View full extraction <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </RevealSection>

        {/* Color System */}
        <RevealSection>
          <div className="mb-16">
            <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">Color System</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {colors.map((c, i) => (
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

        {/* Typography System */}
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
                    <span className="text-[9px] font-mono text-foreground-muted px-2 py-0.5 rounded bg-warm-offwhite">{t.font}</span>
                    <span className="text-[9px] font-mono text-foreground-muted px-2 py-0.5 rounded bg-warm-offwhite">{t.weight}</span>
                    <span className="text-[9px] font-mono text-foreground-muted px-2 py-0.5 rounded bg-warm-offwhite">{t.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Spacing & Radius */}
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

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <RevealSection>
            <span className="section-label text-white/40">Developer-Ready</span>
            <h2 className="mt-4 text-editorial font-bold text-white leading-tight">
              Every visual decision,<br />
              converted into <span className="gradient-text">usable data.</span>
            </h2>
            <p className="mt-6 text-lg text-white/50 max-w-md leading-relaxed">
              Export extracted brand systems as structured JSON. Connect to design tools, style guides, and development workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {['Export JSON', 'Copy tokens', 'Send to Figma', 'Connect API'].map(action => (
                <button key={action} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white/70 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all duration-300">
                  {action === 'Export JSON' && <FileJson className="w-3.5 h-3.5" />}
                  {action === 'Copy tokens' && <Copy className="w-3.5 h-3.5" />}
                  {action === 'Send to Figma' && <Layers className="w-3.5 h-3.5" />}
                  {action === 'Connect API' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {action}
                </button>
              ))}
            </div>
          </RevealSection>

          <RevealSection delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F5F]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27CA40]/60" />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 ml-2">brand-tokens.json</span>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/40" />}
                  <span className="text-[9px] font-mono text-white/40">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* JSON content */}
              <pre className="p-5 text-[11px] font-mono leading-relaxed overflow-x-auto">
                <code>
                  {jsonExample.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-white/15 w-6 text-right mr-4 select-none">{i + 1}</span>
                      <span dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
                          .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
                          .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
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
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <span className="section-label">Brand Library</span>
          <h2 className="mt-4 text-section font-bold text-graphite">
            One source of truth for<br />
            <span className="text-foreground-muted">your visual identity.</span>
          </h2>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="mt-12 rounded-2xl overflow-hidden border border-border/40 bg-white shadow-soft">
            {/* Library tabs */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-border/30 overflow-x-auto">
              {['Overview', 'Logos', 'Colors', 'Typography', 'Icons', 'Components', 'Tokens'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-graphite text-white'
                      : 'text-foreground-muted hover:text-foreground hover:bg-warm-offwhite'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Library content */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand overview card */}
                <div className="md:col-span-2 rounded-xl bg-warm-offwhite border border-border/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-graphite">Brand Overview</h3>
                    <span className="text-[9px] font-mono text-foreground-muted px-2 py-0.5 rounded bg-white border border-border/30">Last scanned 2h ago</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Logos', value: '6', icon: Square },
                      { label: 'Colors', value: '14', icon: Palette },
                      { label: 'Fonts', value: '3', icon: Type },
                      { label: 'Tokens', value: '128', icon: Layers },
                    ].map(stat => (
                      <div key={stat.label} className="p-3 rounded-lg bg-white border border-border/30">
                        <stat.icon className="w-4 h-4 text-brand-orange mb-2" />
                        <p className="text-xl font-bold text-graphite">{stat.value}</p>
                        <p className="text-[10px] text-foreground-muted">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Version history */}
                <div className="rounded-xl bg-warm-offwhite border border-border/30 p-6">
                  <h3 className="text-sm font-bold text-graphite mb-4">Version History</h3>
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
                </div>
              </div>

              {/* Multi-brand switcher */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider">Workspaces</span>
                {['Brandcora', 'Client A', 'Client B'].map((brand, i) => (
                  <button key={brand} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    i === 0 ? 'gradient-accent text-white' : 'bg-warm-offwhite text-foreground-muted hover:text-foreground border border-border/30'
                  }`}>
                    {brand}
                  </button>
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
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <span className="section-label">Brand Validation</span>
          <h2 className="mt-4 text-section font-bold text-graphite max-w-2xl">
            Check every creative before it goes live.
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary max-w-xl leading-relaxed">
            Upload a social post, campaign visual, advertisement, presentation, or marketing asset. The platform compares it with your stored identity and highlights anything off-brand.
          </p>
        </RevealSection>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Upload / Preview area */}
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
                  {/* Simulated uploaded creative */}
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

                  {/* Validation annotations */}
                  {annotations.map((a, i) => (
                    <div key={i} className="validation-annotation" style={{
                      top: a.top, left: a.left, right: a.right,
                      borderColor: a.color,
                      animationDelay: `${i * 0.3}s`,
                    }}>
                      <span style={{ color: a.color }}>{a.text}</span>
                    </div>
                  ))}

                  {/* Scan overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="scan-line" style={{ animationDuration: '2s' }} />
                  </div>
                </>
              )}
            </div>
          </RevealSection>

          {/* Validation report */}
          <RevealSection delay={0.2}>
            <div className="space-y-6">
              {/* Score */}
              <div className="rounded-xl bg-warm-offwhite border border-border/30 p-6">
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-extrabold gradient-text">86</span>
                  <span className="text-lg text-foreground-muted mb-1">/ 100</span>
                </div>
                <p className="text-sm font-medium text-graphite">Brand alignment score</p>
                <p className="text-xs text-foreground-muted mt-1">Minor inconsistencies detected</p>
              </div>

              {/* Category scores */}
              <div className="rounded-xl bg-warm-offwhite border border-border/30 p-6 space-y-4">
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
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                          cat.score >= 90 ? 'bg-green-50 text-green-700' :
                          cat.score >= 75 ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>{cat.status}</span>
                      </div>
                    </div>
                    <div className="score-bar">
                      <div className="score-bar-fill" style={{ width: `${cat.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="rounded-xl bg-warm-offwhite border border-border/30 p-6">
                <h4 className="text-sm font-bold text-graphite mb-3">Recommendations</h4>
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
                <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-accent hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300">
                  Apply suggested corrections
                </button>
              </div>
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
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="text-center mb-16">
            <span className="section-label">How It Works</span>
            <h2 className="mt-4 text-section font-bold text-graphite">
              From discovery to validation in seven steps.
            </h2>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="relative">
            {/* Connecting gradient line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 hidden md:block" style={{
              background: 'linear-gradient(90deg, #FF5F45, #FF8A5B, #F2B84B, #FF5F45, #FF8A5B, #F2B84B, #FF5F45)',
            }} />

            <div className="grid grid-cols-2 md:grid-cols-7 gap-6 md:gap-4">
              {steps.map((step, i) => (
                <div key={step.num} className="relative text-center">
                  <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-white border border-border/40 shadow-soft flex items-center justify-center mb-4">
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
    {
      title: 'Brand Teams',
      desc: 'Maintain one authoritative identity system. Every stakeholder accesses the same verified brand data.',
      tag: 'Identity',
    },
    {
      title: 'Marketing Teams',
      desc: 'Check campaign graphics before publication. No more guessing whether colors or fonts are correct.',
      tag: 'Campaigns',
    },
    {
      title: 'Agencies',
      desc: 'Extract and manage brand systems across multiple clients from a single workspace.',
      tag: 'Multi-client',
    },
    {
      title: 'Developers',
      desc: 'Export structured tokens and JSON for implementation. Design-to-code without translation errors.',
      tag: 'Tokens',
    },
    {
      title: 'Social Teams',
      desc: 'Validate daily content without waiting for manual design reviews. Instant brand compliance.',
      tag: 'Content',
    },
    {
      title: 'Product Teams',
      desc: 'Compare website implementation with established design rules. Catch drift early.',
      tag: 'Quality',
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-warm-offwhite">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="max-w-2xl mb-16">
            <span className="section-label">Use Cases</span>
            <h2 className="mt-4 text-section font-bold text-graphite">
              Built for every team responsible<br />
              <span className="text-foreground-muted">for the brand.</span>
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc, i) => (
            <RevealSection key={uc.title} delay={i * 0.06}>
              <div className="group p-6 rounded-2xl bg-white border border-border/30 hover:border-brand-orange/20 hover:shadow-soft transition-all duration-300 cursor-pointer h-full">
                <span className="text-[9px] font-mono text-brand-orange uppercase tracking-wider">{uc.tag}</span>
                <h3 className="text-base font-bold text-graphite mt-2">{uc.title}</h3>
                <p className="text-sm text-foreground-muted mt-2 leading-relaxed">{uc.desc}</p>
              </div>
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
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="section-label">Security &amp; Control</span>
              <h2 className="mt-4 text-section font-bold text-graphite">
                Your brand systems remain organized inside private workspaces with configurable team access.
              </h2>
              <p className="mt-6 text-base text-foreground-secondary leading-relaxed">
                Controlled access. Private brand libraries. Secure asset storage. Version history. Data deletion. Enterprise workspace options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <RevealSection key={f.title} delay={i * 0.1}>
                  <div className="p-5 rounded-xl bg-white border border-border/30">
                    <f.icon className="w-5 h-5 text-brand-orange mb-3" />
                    <h3 className="text-sm font-bold text-graphite">{f.title}</h3>
                    <p className="text-xs text-foreground-muted mt-1">{f.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Final CTA Section ─── */
function FinalCTA() {
  return (
    <section className="py-24 md:py-40 relative overflow-hidden grain" style={{ background: 'linear-gradient(180deg, #FAF8F5 0%, #F0EBF5 50%, #FAF8F5 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.1) 0%, rgba(242,184,75,0.05) 40%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 text-center">
        <RevealSection>
          <h2 className="text-editorial font-bold text-graphite leading-tight max-w-3xl mx-auto">
            Discover the brand system<br />
            <span className="gradient-text">already inside your website.</span>
          </h2>
          <p className="mt-6 text-lg text-foreground-secondary max-w-lg mx-auto leading-relaxed">
            Paste a URL to extract your visual identity, organize your design tokens, and validate every creative asset against one consistent system.
          </p>
          <div className="mt-10 flex justify-center">
            <URLInput size="large" onSubmit={() => {}} />
          </div>
          <p className="mt-3 text-xs text-foreground-muted font-mono">No credit card required. Start with any public website.</p>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1A1918 0%, #141312 100%)' }}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 pt-20 pb-12">
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
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm text-white/40 hover:text-white/70 transition-colors">Sign in</Link>
            <Link href="/auth" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-graphite bg-white/90 hover:bg-white transition-all duration-300">
              Scan a website <ArrowRight className="w-3 h-3" />
            </Link>
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
        <ScanningSection />
        <BrandSystemSection />
        <TokenSection />
        <LibrarySection />
        <ValidationSection />
        <WorkflowSection />
        <UseCasesSection />
        <SecuritySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
