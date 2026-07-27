'use client';

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Download, Eye, ArrowUpRight } from 'lucide-react';

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

/* ─── SVG Identity Assets ─── */
const identityAssets = [
  { name: 'Hexa Mark', path: 'M12 2l8.66 5v10L12 27 3.34 17V7z', category: 'Symbols' },
  { name: 'Circle Grid', path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12z', category: 'Geometric' },
  { name: 'Diamond Pulse', path: 'M12 2l6 6-6 6-6-6z M12 14l6 6-6 6-6-6z', category: 'Abstract' },
  { name: 'Wave Form', path: 'M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0', category: 'Organic' },
  { name: 'Cross Axis', path: 'M12 2v20M2 12h20', category: 'Interface' },
  { name: 'Star Burst', path: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z', category: 'Editorial' },
  { name: 'Arch Portal', path: 'M4 22V8a8 8 0 0116 0v14', category: 'Symbols' },
  { name: 'Dot Matrix', path: 'M4 4h4v4H4zm8 0h4v4h-4zm8 0h4v4h-4zM4 12h4v4H4zm8 0h4v4h-4zm8 0h4v4h-4zM4 20h4v4H4zm8 0h4v4h-4zm8 0h4v4h-4z', category: 'Pattern' },
  { name: 'Orbit Ring', path: 'M12 2a10 10 0 0110 10M12 2a10 10 0 00-10 10m10-10a5 5 0 015 5m-5-5a5 5 0 00-5 5', category: 'Interface' },
  { name: 'Flow Lines', path: 'M2 6c4 0 4 4 8 4s4-4 8-4 4 4 8 4M2 14c4 0 4 4 8 4s4-4 8-4 4 4 8 4', category: 'Organic' },
  { name: 'Stack Form', path: 'M4 4h16v4H4zm2 6h12v4H6zm2 6h8v4H8z', category: 'Modular' },
  { name: 'Compass Rose', path: 'M12 2l2 8-2-2-2 2zm0 20l-2-8 2 2 2-2zM2 12l8-2-2 2 2 2zm20 0l-8 2 2-2-2-2z', category: 'Editorial' },
];

/* ─── Specimen Canvas SVG ─── */
function SpecimenCanvas({ mousePos }: { mousePos: { x: number; y: number } }) {
  return (
    <svg viewBox="0 0 600 500" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5F45" />
          <stop offset="48%" stopColor="#FF8A5B" />
          <stop offset="100%" stopColor="#F2B84B" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,95,69,0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="softShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.08)" />
        </filter>
      </defs>

      {/* Construction grid */}
      <g opacity="0.15">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="#FF5F45" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="#FF5F45" strokeWidth="0.5" />
        ))}
      </g>

      {/* Glow */}
      <ellipse cx="340" cy="240" rx="200" ry="180" fill="url(#glowGrad)" />

      {/* Large anchor hexa mark */}
      <g transform={`translate(${260 + mousePos.x * 0.02}px, ${160 + mousePos.y * 0.02}px)`} filter="url(#softShadow)">
        <path d="M80 20l69.3 40v80L80 180l-69.3-40V60z" fill="url(#brandGrad)" opacity="0.9" />
        <path d="M80 20l69.3 40v80L80 180l-69.3-40V60z" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        {/* Construction lines on hexa */}
        <line x1="80" y1="20" x2="80" y2="180" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <line x1="10.7" y1="60" x2="149.3" y2="140" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <circle cx="80" cy="100" r="4" fill="white" opacity="0.4" />
        <circle cx="80" cy="20" r="3" fill="white" opacity="0.3" />
        <circle cx="149.3" cy="60" r="3" fill="white" opacity="0.3" />
        <circle cx="149.3" cy="140" r="3" fill="white" opacity="0.3" />
        <circle cx="80" cy="180" r="3" fill="white" opacity="0.3" />
        <circle cx="10.7" cy="140" r="3" fill="white" opacity="0.3" />
        <circle cx="10.7" cy="60" r="3" fill="white" opacity="0.3" />
      </g>

      {/* Orbiting circle */}
      <g transform={`translate(${380 + mousePos.x * 0.04}px, ${120 + mousePos.y * 0.03}px)`}>
        <circle cx="0" cy="0" r="32" fill="none" stroke="url(#brandGrad)" strokeWidth="1.5" opacity="0.6" />
        <circle cx="0" cy="0" r="4" fill="#FF5F45" opacity="0.8" />
        <text x="0" y="-42" textAnchor="middle" fill="#9F9086" fontSize="8" fontFamily="IBM Plex Mono" letterSpacing="0.1em">32px</text>
      </g>

      {/* Wave form */}
      <g transform={`translate(${60 + mousePos.x * 0.01}px, ${340 + mousePos.y * 0.015}px)`} opacity="0.5">
        <path d="M0 20 C20 0, 40 0, 60 20 S100 40, 120 20 S160 0, 180 20" stroke="url(#brandGrad)" strokeWidth="1.5" fill="none" />
        <path d="M0 20 C20 0, 40 0, 60 20 S100 40, 120 20 S160 0, 180 20" stroke="url(#brandGrad)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.3" transform="translate(0, 8)" />
      </g>

      {/* Small cross */}
      <g transform={`translate(${460 + mousePos.x * 0.05}px, ${300 + mousePos.y * 0.04}px)`} opacity="0.4">
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#1A1918" strokeWidth="1" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="#1A1918" strokeWidth="1" />
        <circle cx="0" cy="0" r="2" fill="#FF5F45" />
      </g>

      {/* Dot matrix 3x3 */}
      <g transform={`translate(${100 + mousePos.x * 0.03}px, ${120 + mousePos.y * 0.02}px)`} opacity="0.35">
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => (
            <circle key={`${row}-${col}`} cx={col * 16} cy={row * 16} r="3" fill="#1A1918" />
          ))
        )}
      </g>

      {/* Technical label */}
      <g transform={`translate(${300 + mousePos.x * 0.03}px, ${440 + mousePos.y * 0.02}px)`} opacity="0.5">
        <rect x="-40" y="-10" width="80" height="20" rx="4" fill="white" stroke="#E0D8D0" strokeWidth="0.5" />
        <text x="0" y="4" textAnchor="middle" fill="#9F9086" fontSize="8" fontFamily="IBM Plex Mono">12 × 12 grid</text>
      </g>

      {/* Bounding box with anchor points */}
      <g transform={`translate(${420 + mousePos.x * 0.02}px, ${60 + mousePos.y * 0.02}px)`} opacity="0.3">
        <rect x="0" y="0" width="80" height="80" rx="4" fill="none" stroke="#FF5F45" strokeWidth="0.5" strokeDasharray="4 2" />
        <line x1="0" y1="0" x2="80" y2="80" stroke="#FF5F45" strokeWidth="0.3" />
        <line x1="80" y1="0" x2="0" y2="80" stroke="#FF5F45" strokeWidth="0.3" />
        <circle cx="0" cy="0" r="3" fill="white" stroke="#FF5F45" strokeWidth="1" />
        <circle cx="80" cy="0" r="3" fill="white" stroke="#FF5F45" strokeWidth="1" />
        <circle cx="0" cy="80" r="3" fill="white" stroke="#FF5F45" strokeWidth="1" />
        <circle cx="80" cy="80" r="3" fill="white" stroke="#FF5F45" strokeWidth="1" />
      </g>

      {/* Stacked arch */}
      <g transform={`translate(${120 + mousePos.x * 0.025}px, ${240 + mousePos.y * 0.015}px)`} opacity="0.3">
        <path d="M0 40 A20 20 0 0140 40" fill="none" stroke="#1A1918" strokeWidth="1" />
        <path d="M4 40 A16 16 0 0136 40" fill="none" stroke="#FF5F45" strokeWidth="0.5" />
        <path d="M8 40 A12 12 0 0132 40" fill="none" stroke="#1A1918" strokeWidth="0.5" opacity="0.5" />
      </g>

      {/* Dimension line */}
      <g transform={`translate(${200 + mousePos.x * 0.02}px, ${80 + mousePos.y * 0.015}px)`} opacity="0.25">
        <line x1="0" y1="0" x2="100" y2="0" stroke="#1A1918" strokeWidth="0.5" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#1A1918" strokeWidth="0.5" />
        <line x1="100" y1="-4" x2="100" y2="4" stroke="#1A1918" strokeWidth="0.5" />
        <text x="50" y="-6" textAnchor="middle" fill="#9F9086" fontSize="7" fontFamily="IBM Plex Mono">240px</text>
      </g>
    </svg>
  );
}

/* ─── Brandcora Logo Mark ─── */
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
      <div className={`mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 transition-all duration-500`}>
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
            {['Toolkit', 'Collections', 'Use Cases', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-300">
              Pricing
            </Link>
            <Link href="/auth"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-accent hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5">
              Explore Assets
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width * 20,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height * 20,
    });
  }, []);

  return (
    <section ref={heroRef} onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden grain"
      style={{ background: 'linear-gradient(180deg, #FAF8F5 0%, #F0EBF5 40%, #FAF8F5 100%)' }}>

      {/* Atmospheric gradient glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-60 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.08) 0%, rgba(242,184,75,0.04) 50%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] rounded-full opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(200,180,230,0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 md:px-12 lg:px-16 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Editorial headline */}
          <div className="lg:col-span-5 space-y-8">
            <div className="animate-fade-up">
              <span className="section-label">Brand Identity Toolkit</span>
            </div>

            <h1 className="animate-fade-up-delay-1">
              <span className="block text-display font-extrabold text-graphite leading-[0.92]">
                Identity assets
              </span>
              <span className="block text-display font-extrabold leading-[0.92]">
                made to become
              </span>
              <span className="block text-display font-extrabold leading-[0.92]">
                your <span className="gradient-text italic">own.</span>
              </span>
            </h1>

            <p className="animate-fade-up-delay-2 text-lg text-foreground-secondary max-w-md leading-relaxed">
              A curated toolkit of adaptable SVG icons, symbols, patterns, and identity elements
              created for designers who care about every detail.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-up-delay-3">
              <Link href="/auth"
                className="btn-magnetic inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white gradient-accent hover:shadow-xl hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5">
                Explore the toolkit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#specimens"
                className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium text-foreground border border-border-strong hover:bg-surface-warm transition-all duration-300">
                View live specimens
              </a>
            </div>
          </div>

          {/* Right: Specimen canvas */}
          <div className="lg:col-span-7 animate-fade-up-delay-2">
            <div className="relative">
              <SpecimenCanvas mousePos={mousePos} />
              {/* Floating labels */}
              <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-border/50 text-xs font-mono text-foreground-muted">
                <span className="w-2 h-2 rounded-full bg-brand-orange" />
                Live canvas
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Specimen Strip ─── */
function SpecimenStrip() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { ref, visible } = useInView(0.1);

  return (
    <section id="specimens" ref={ref} className="py-24 md:py-32 bg-white border-y border-border/50">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <span className="section-label">Selected assets / 01</span>
          <h2 className="mt-4 text-section font-bold text-graphite max-w-2xl">
            Designed as individual objects. Built to work as a system.
          </h2>
        </RevealSection>

        <div className="mt-16 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {identityAssets.map((asset, i) => (
            <RevealSection key={asset.name} delay={i * 0.05}>
              <div
                className="specimen-item group relative aspect-square rounded-2xl bg-warm-offwhite border border-border/40 flex flex-col items-center justify-center cursor-pointer hover:shadow-elevated"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-500 group-hover:scale-110"
                  stroke="currentColor" strokeWidth="1" fill="none">
                  <path d={asset.path} className="stroke-foreground-secondary group-hover:stroke-graphite transition-colors" />
                </svg>
                {/* Hover overlay */}
                <div className="specimen-overlay absolute inset-0 rounded-2xl bg-graphite/90 flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-[10px] font-mono text-brand-orange mb-1">{asset.category}</span>
                  <span className="text-xs font-semibold text-white mb-3">{asset.name}</span>
                  <div className="flex gap-1.5">
                    <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors" title="Copy SVG">
                      <Copy className="w-3 h-3 text-white" />
                    </button>
                    <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors" title="Download">
                      <Download className="w-3 h-3 text-white" />
                    </button>
                    <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors" title="Preview">
                      <Eye className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Credibility Strip ─── */
function CredibilityStrip() {
  return (
    <section className="py-16 md:py-20 bg-warm-offwhite">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center md:text-left">
            <p className="text-xl md:text-2xl font-medium text-foreground-secondary max-w-lg">
              Made for <span className="text-graphite font-semibold">identity designers</span>, studios, creative teams, and independent makers.
            </p>
            <div className="flex items-center gap-8 md:gap-12">
              {[
                { value: '240+', label: 'Assets' },
                { value: '6', label: 'Collections' },
                { value: 'SVG', label: 'Native format' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs font-mono text-foreground-muted mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Collections Section ─── */
function CollectionsSection() {
  const collections = [
    { name: 'Geometric Symbols', count: 48, bg: 'bg-warm-offwhite', span: 'col-span-2 row-span-2', accent: 'brand-orange' },
    { name: 'Organic Forms', count: 36, bg: 'bg-lavender-soft', span: 'col-span-1 row-span-1' },
    { name: 'Interface Icons', count: 64, bg: 'bg-graphite', span: 'col-span-1 row-span-1', dark: true },
    { name: 'Editorial Marks', count: 24, bg: 'bg-warm-cream', span: 'col-span-1 row-span-1' },
    { name: 'Modular Patterns', count: 18, bg: 'bg-lavender-soft', span: 'col-span-1 row-span-1' },
    { name: 'Abstract Identity', count: 32, bg: 'bg-warm-offwhite', span: 'col-span-2 row-span-1' },
  ];

  return (
    <section id="collections" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <span className="section-label">Collections</span>
              <h2 className="mt-4 text-section font-bold text-graphite">
                One toolkit.<br />
                <span className="text-foreground-muted">Multiple visual languages.</span>
              </h2>
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-graphite transition-colors">
              View all collections <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[220px]">
          {collections.map((col, i) => (
            <RevealSection key={col.name} delay={i * 0.08}>
              <div className={`group relative ${col.bg} ${col.span} rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden cursor-pointer border border-border/30 hover:shadow-elevated transition-all duration-500`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {[0, 1, 2, 3, 4, 5].map(j => (
                      <g key={j} transform={`translate(${(j % 3) * 70 + 20}, ${Math.floor(j / 3) * 80 + 30})`}>
                        <circle cx="15" cy="15" r="12" fill="none" stroke={col.dark ? 'white' : '#1A1918'} strokeWidth="0.5" />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="flex gap-1.5 mb-3">
                    {Array.from({ length: Math.min(6, col.count) }).map((_, j) => (
                      <div key={j} className={`w-6 h-6 rounded-md ${col.dark ? 'bg-white/10' : 'bg-graphite/5'} flex items-center justify-center`}>
                        <div className={`w-3 h-3 rounded-sm ${col.dark ? 'bg-white/20' : 'bg-graphite/10'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <h3 className={`text-lg font-bold ${col.dark ? 'text-white' : 'text-graphite'}`}>{col.name}</h3>
                    <p className={`text-sm mt-1 ${col.dark ? 'text-white/60' : 'text-foreground-muted'}`}>{col.count} assets</p>
                  </div>
                  <div className={`p-2 rounded-xl ${col.dark ? 'bg-white/10 group-hover:bg-white/20' : 'bg-graphite/5 group-hover:bg-graphite/10'} transition-colors`}>
                    <ArrowRight className={`w-4 h-4 ${col.dark ? 'text-white' : 'text-graphite'} transition-transform group-hover:translate-x-0.5`} />
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Collection Panel (Dark) ─── */
function FeaturedCollectionPanel() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden grain" style={{ background: 'linear-gradient(180deg, #1A1918 0%, #242322 100%)' }}>
      {/* Gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <RevealSection>
            <span className="section-label text-white/40">Featured Collection</span>
            <h2 className="mt-4 text-editorial font-bold text-white leading-tight">
              Geometric <span className="gradient-text">Symbols</span>
            </h2>
            <p className="mt-6 text-lg text-white/60 max-w-md leading-relaxed">
              48 precision-crafted geometric symbols built on consistent construction principles.
              Each symbol works at every scale, in any color, across all media.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-graphite bg-white hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5">
                Explore collection <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-sm font-mono text-white/40">48 SVG &middot; Figma &middot; PNG</span>
            </div>
          </RevealSection>

          <RevealSection delay={0.2}>
            <div className="relative grid grid-cols-3 gap-4">
              {identityAssets.slice(0, 9).map((asset, i) => (
                <div key={asset.name}
                  className="aspect-square rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-300 group cursor-pointer"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" stroke="currentColor" strokeWidth="1" fill="none">
                    <path d={asset.path} className="stroke-white/40 group-hover:stroke-white/70 transition-colors" />
                  </svg>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Typographic Editorial Section ─── */
function EditorialSection() {
  return (
    <section className="py-24 md:py-40 bg-warm-offwhite overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <RevealSection className="lg:col-span-7">
            <h2 className="text-editorial font-bold text-graphite leading-[1.05]">
              More than an<br />
              icon library.
            </h2>
            <h2 className="mt-2 text-editorial font-bold text-graphite leading-[1.05]">
              A starting point for<br />
              <span className="font-serif italic font-normal text-foreground-secondary">complete identities.</span>
            </h2>
          </RevealSection>

          <RevealSection delay={0.2} className="lg:col-span-4 lg:col-start-9 flex flex-col justify-end">
            <p className="text-base text-foreground-secondary leading-relaxed">
              Every symbol in the toolkit is designed as a modular element of a larger visual language.
              Combine, recolor, resize, and remix. The system adapts to your brand, not the other way around.
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-graphite">
              <span className="w-8 h-[2px] gradient-accent rounded-full" />
              Built for professional use
            </div>
          </RevealSection>
        </div>

        {/* Floating SVG specimens entering from bottom */}
        <div className="relative mt-20 h-32 overflow-hidden">
          {identityAssets.slice(0, 5).map((asset, i) => (
            <div key={asset.name} className="absolute bottom-0 opacity-10"
              style={{ left: `${10 + i * 18}%`, transform: `translateY(${20 + (i % 3) * 15}px) rotate(${-5 + i * 3}deg)` }}>
              <svg viewBox="0 0 24 24" className="w-16 h-16 md:w-24 md:h-24" stroke="currentColor" strokeWidth="0.5" fill="none">
                <path d={asset.path} className="stroke-graphite" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Interactive Customization Section ─── */
function CustomizationSection() {
  const [strokeWeight, setStrokeWeight] = useState(1);
  const [cornerRadius, setCornerRadius] = useState(4);
  const [activeColor, setActiveColor] = useState('#FF5F45');
  const [copied, setCopied] = useState(false);

  const colors = ['#FF5F45', '#FF8A5B', '#F2B84B', '#1A1918', '#6B5CE7', '#38BDF8'];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 md:py-32 bg-white border-y border-border/50">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <span className="section-label">Customization</span>
          <h2 className="mt-4 text-section font-bold text-graphite">
            Make every asset your own.
          </h2>
        </RevealSection>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Preview */}
          <RevealSection className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-3xl bg-warm-offwhite border border-border/40 flex items-center justify-center overflow-hidden construction-grid">
              <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56 transition-all duration-500">
                <rect x="20" y="20" width="160" height="160" rx={cornerRadius}
                  fill="none" stroke={activeColor} strokeWidth={strokeWeight} />
                <circle cx="100" cy="100" r="40"
                  fill="none" stroke={activeColor} strokeWidth={strokeWeight} opacity="0.6" />
                <path d="M60 100 L100 60 L140 100 L100 140 Z"
                  fill="none" stroke={activeColor} strokeWidth={strokeWeight} opacity="0.4" />
              </svg>
              {/* Technical overlay */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-border/50 text-[10px] font-mono text-foreground-muted">
                stroke: {strokeWeight}px &middot; radius: {cornerRadius}px
              </div>
            </div>
          </RevealSection>

          {/* Controls */}
          <RevealSection delay={0.15} className="lg:col-span-5">
            <div className="space-y-8">
              {/* Stroke weight */}
              <div>
                <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider">Stroke Weight</label>
                <div className="mt-3 flex items-center gap-4">
                  <input type="range" min="0.5" max="3" step="0.5" value={strokeWeight}
                    onChange={e => setStrokeWeight(Number(e.target.value))}
                    className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-brand-orange" />
                  <span className="text-sm font-mono text-graphite w-8 text-right">{strokeWeight}px</span>
                </div>
              </div>

              {/* Corner radius */}
              <div>
                <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider">Corner Softness</label>
                <div className="mt-3 flex items-center gap-4">
                  <input type="range" min="0" max="24" step="2" value={cornerRadius}
                    onChange={e => setCornerRadius(Number(e.target.value))}
                    className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-brand-orange" />
                  <span className="text-sm font-mono text-graphite w-8 text-right">{cornerRadius}px</span>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="text-xs font-mono text-foreground-muted uppercase tracking-wider">Primary Color</label>
                <div className="mt-3 flex items-center gap-2.5">
                  {colors.map(color => (
                    <button key={color}
                      onClick={() => setActiveColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${activeColor === color ? 'border-graphite scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              {/* Copy SVG */}
              <button onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white gradient-accent hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy SVG
                  </>
                )}
              </button>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Use Cases Section ─── */
function UseCasesSection() {
  const useCases = [
    { title: 'Brand Identity', desc: 'Complete visual systems', icon: '◇' },
    { title: 'Packaging', desc: 'Label and box design', icon: '□' },
    { title: 'Editorial', desc: 'Print and digital media', icon: '△' },
    { title: 'Digital Products', desc: 'Apps and websites', icon: '○' },
    { title: 'Social Campaigns', desc: 'Campaign assets', icon: '☆' },
    { title: 'Presentations', desc: 'Slide and deck design', icon: '⬡' },
    { title: 'Environmental', desc: 'Signage and spaces', icon: '◆' },
    { title: 'Motion', desc: 'Animation systems', icon: '▲' },
  ];

  return (
    <section id="use-cases" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="max-w-2xl mb-16">
            <span className="section-label">Use Cases</span>
            <h2 className="mt-4 text-section font-bold text-graphite">
              One visual language,<br />
              <span className="text-foreground-muted">endless applications.</span>
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {useCases.map((uc, i) => (
            <RevealSection key={uc.title} delay={i * 0.06}>
              <div className="group relative p-6 rounded-2xl bg-warm-offwhite border border-border/30 hover:border-brand-orange/20 hover:shadow-soft transition-all duration-300 cursor-pointer">
                <div className="text-2xl text-brand-orange mb-4 opacity-60 group-hover:opacity-100 transition-opacity">{uc.icon}</div>
                <h3 className="text-sm font-bold text-graphite">{uc.title}</h3>
                <p className="text-xs text-foreground-muted mt-1">{uc.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Dark Feature Section ─── */
function DarkFeatureSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden grain" style={{ background: 'linear-gradient(180deg, #1A1918 0%, #1E1D1C 50%, #1A1918 100%)' }}>
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="max-w-3xl mb-16">
            <span className="section-label text-white/30">System Design</span>
            <h2 className="mt-4 text-section font-bold text-white leading-tight">
              Built for systems,<br />
              not isolated symbols.
            </h2>
            <p className="mt-6 text-lg text-white/50 max-w-lg leading-relaxed">
              Every asset connects. The toolkit is designed as a modular visual language where elements
              share proportions, weights, and construction logic.
            </p>
          </div>
        </RevealSection>

        {/* Connected system diagram */}
        <RevealSection delay={0.2}>
          <div className="relative py-16">
            <svg viewBox="0 0 1000 300" className="w-full" fill="none">
              {/* Connecting lines */}
              <line x1="120" y1="150" x2="300" y2="100" stroke="rgba(255,95,69,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="300" y1="100" x2="500" y2="150" stroke="rgba(255,95,69,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="500" y1="150" x2="700" y2="100" stroke="rgba(255,95,69,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="700" y1="100" x2="880" y2="150" stroke="rgba(255,95,69,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="300" y1="100" x2="300" y2="220" stroke="rgba(255,95,69,0.1)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="700" y1="100" x2="700" y2="220" stroke="rgba(255,95,69,0.1)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Nodes */}
              {[
                { x: 120, y: 150, r: 28, path: 'M12 2l8.66 5v10L12 27 3.34 17V7z' },
                { x: 300, y: 100, r: 24, path: 'M12 2a10 10 0 100 20 10 10 0 000-20z' },
                { x: 500, y: 150, r: 32, path: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z' },
                { x: 700, y: 100, r: 24, path: 'M4 4h16v4H4zm2 6h12v4H6zm2 6h8v4H8z' },
                { x: 880, y: 150, r: 28, path: 'M12 2l6 6-6 6-6-6z M12 14l6 6-6 6-6-6z' },
                { x: 300, y: 220, r: 16, path: 'M12 2v20M2 12h20' },
                { x: 700, y: 220, r: 16, path: 'M12 2a10 10 0 0110 10' },
              ].map((node, i) => (
                <g key={i}>
                  <circle cx={node.x} cy={node.y} r={node.r + 8} fill="rgba(255,95,69,0.04)" />
                  <circle cx={node.x} cy={node.y} r={node.r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <g transform={`translate(${node.x - 12}, ${node.y - 12})`}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none">
                      <path d={node.path} />
                    </svg>
                  </g>
                </g>
              ))}
            </svg>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Licensing Section ─── */
function LicensingSection() {
  const formats = [
    { name: 'SVG', desc: 'Scalable vectors' },
    { name: 'Figma', desc: 'Component library' },
    { name: 'PNG', desc: 'Rasterized assets' },
    { name: 'PDF', desc: 'Print-ready files' },
  ];

  const licenses = [
    'Commercial license included',
    'Editable vector paths',
    'Free lifetime updates',
    'Organized by collection',
  ];

  return (
    <section className="py-24 md:py-32 bg-warm-offwhite">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <RevealSection>
          <div className="max-w-2xl mb-16">
            <span className="section-label">Formats &amp; Licensing</span>
            <h2 className="mt-4 text-section font-bold text-graphite">
              Everything you need,<br />
              nothing you don&apos;t.
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <RevealSection>
            <div>
              <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">Available Formats</h3>
              <div className="grid grid-cols-2 gap-3">
                {formats.map(f => (
                  <div key={f.name} className="p-4 rounded-xl bg-white border border-border/40">
                    <span className="text-lg font-bold gradient-text font-mono">{f.name}</span>
                    <p className="text-xs text-foreground-muted mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          <RevealSection delay={0.1}>
            <div>
              <h3 className="text-sm font-bold text-graphite uppercase tracking-wider mb-6">License Details</h3>
              <div className="space-y-3">
                {licenses.map(license => (
                  <div key={license} className="flex items-center gap-3 py-2">
                    <Check className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="text-sm text-foreground-secondary">{license}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  return (
    <section className="py-24 md:py-40 relative overflow-hidden grain" style={{ background: 'linear-gradient(180deg, #FAF8F5 0%, #F0EBF5 50%, #FAF8F5 100%)' }}>
      {/* Large gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,69,0.1) 0%, rgba(242,184,75,0.05) 40%, transparent 70%)' }} />

      {/* Large SVG watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-[500px] h-[500px]">
          <path d="M100 10l77.9 45v90L100 190l-77.9-45V55z" fill="none" stroke="#1A1918" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 text-center">
        <RevealSection>
          <h2 className="text-editorial font-bold text-graphite leading-tight max-w-3xl mx-auto">
            Give your next identity a<br />
            <span className="gradient-text">stronger starting point.</span>
          </h2>
          <p className="mt-6 text-lg text-foreground-secondary max-w-lg mx-auto leading-relaxed">
            Explore a flexible collection of symbols, icons, and visual elements
            made to evolve with your ideas.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth"
              className="btn-magnetic inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold text-white gradient-accent hover:shadow-xl hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5">
              Explore the toolkit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#specimens"
              className="btn-magnetic inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-medium text-foreground border border-border-strong hover:bg-surface-warm transition-all duration-300">
              Preview all assets
            </a>
          </div>
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
        {/* Large brand name */}
        <div className="mb-16">
          <h2 className="text-[clamp(3rem,10vw,8rem)] font-extrabold text-white/5 leading-none tracking-tight">
            Brandcora
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['Toolkit', 'Collections', 'Pricing', 'Changelog'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {['Documentation', 'Use Cases', 'Brand Guide', 'License'].map(item => (
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
            <h4 className="text-xs font-mono text-white/30 uppercase tracking-wider mb-4">Stay updated</h4>
            <p className="text-sm text-white/40 mb-4">New assets and collections, delivered monthly.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20" />
              <button className="px-4 py-2 rounded-lg gradient-accent text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="w-6 h-6 opacity-60" />
            <span className="text-sm text-white/30">&copy; 2026 Brandcora. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {['Twitter', 'GitHub', 'Dribbble'].map(social => (
              <a key={social} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{social}</a>
            ))}
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
        <SpecimenStrip />
        <CredibilityStrip />
        <CollectionsSection />
        <FeaturedCollectionPanel />
        <EditorialSection />
        <CustomizationSection />
        <UseCasesSection />
        <DarkFeatureSection />
        <LicensingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
