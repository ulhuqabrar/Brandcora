'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  House,
  MagnifyingGlass,
  GearSix,
  ShieldCheck,
  Palette,
  Lightning,
  Plus,
  TrendUp,
  Circle,
  Clock,
  ArrowRight,
  CirclesFour,
  TextAa,
  Ruler,
  CornersOut,
  Stack,
  Code,
  FileText,
  GitBranch,
  LightningSlash,
  WarningCircle,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';

const BRAND = {
  name: 'Acme Corp',
  url: 'acme.com',
  logo: null,
  primaryColor: '#FF5F45',
  scanStatus: 'complete' as const,
  identityCompleteness: 78,
  plan: 'pro',
  usage: {
    scans: { used: 12, limit: 50 },
    exports: { used: 3, limit: 10 },
  },
};

const RECENT_SCANS = [
  {
    id: 'scan-1',
    name: 'Homepage redesign v3',
    type: 'website',
    score: 92,
    status: 'pass',
    date: '2026-07-25',
    url: 'acme.com/homepage',
    needsAttention: false,
  },
  {
    id: 'scan-2',
    name: 'Q3 social campaign',
    type: 'social',
    score: 64,
    status: 'fail',
    date: '2026-07-24',
    platform: 'Instagram',
    needsAttention: true,
    issues: ['Wrong primary color', 'Missing logo lockup'],
  },
  {
    id: 'scan-3',
    name: 'Product page audit',
    type: 'website',
    score: 78,
    status: 'warn',
    date: '2026-07-22',
    url: 'acme.com/products',
    needsAttention: true,
    issues: ['Font size inconsistency'],
  },
  {
    id: 'scan-4',
    name: 'Email newsletter banner',
    type: 'social',
    score: 88,
    status: 'pass',
    date: '2026-07-20',
    platform: 'Email',
    needsAttention: false,
  },
];

const BRAND_COLORS = [
  { name: 'Primary', hex: '#FF5F45', role: 'CTA, links' },
  { name: 'Secondary', hex: '#FF8A5B', role: 'Accents' },
  { name: 'Accent', hex: '#F2B84B', role: 'Highlights' },
  { name: 'Dark', hex: '#0A0A0A', role: 'Text, bg' },
  { name: 'Light', hex: '#FAFAF9', role: 'Backgrounds' },
];

const BRAND_FONTS = [
  { name: 'Manrope', role: 'Headings', weight: '700' },
  { name: 'IBM Plex Mono', role: 'Code, data', weight: '400' },
  { name: 'Inter', role: 'Body', weight: '400' },
];

const LOGOS = [
  { id: 'logo-1', name: 'Primary mark', type: 'PNG', size: '2400×1200' },
  { id: 'logo-2', name: 'Wordmark dark', type: 'SVG', size: '—' },
  { id: 'logo-3', name: 'Icon only', type: 'SVG', size: '—' },
];

const RECENT_CHANGES = [
  {
    id: 'ch-1',
    title: 'Primary color updated',
    detail: '#E85D40 → #FF5F45',
    date: '2026-07-23',
    type: 'color',
  },
  {
    id: 'ch-2',
    title: 'Logo lockup repositioned',
    detail: 'Centered → left-aligned',
    date: '2026-07-20',
    type: 'logo',
  },
  {
    id: 'ch-3',
    title: 'Spacing scale adjusted',
    detail: '8px base → 4px base',
    date: '2026-07-18',
    type: 'spacing',
  },
  {
    id: 'ch-4',
    title: 'Font weight added',
    detail: 'Inter 600 (SemiBold) added',
    date: '2026-07-15',
    type: 'typography',
  },
];

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600';

const STATUS_BADGE = (status: string) => {
  if (status === 'pass') return <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">Pass</Badge>;
  if (status === 'fail') return <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold">Fail</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-semibold">Warn</Badge>;
};

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* ── TOP UTILITY BAR ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" weight="bold" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/scans/new-social">
              <Plus className="mr-1 h-3.5 w-3.5" weight="bold" /> New scan
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/brand">Edit brand</Link>
          </Button>
        </div>
      </div>

      {/* ── GREETING + BRAND STATUS ────────────────────────────────── */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="text-muted-foreground mt-1">
              Active brand: <span className="font-semibold text-foreground">{BRAND.name}</span>
              <span className="text-xs text-muted-foreground ml-2">({BRAND.url})</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs px-2.5 py-1">
              {BRAND.plan === 'pro' ? 'Pro plan' : 'Free plan'}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Circle className="h-2 w-2 text-green-500" weight="fill" />
              <span>Brand active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BRAND PROFILE / SCAN STATUS / IDENTITY COMPLETENESS ─── */}
      <div className="grid gap-4 sm:grid-cols-3">

        {/* Brand Profile */}
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brand profile</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-semibold">{BRAND.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">URL</span>
              <span className="font-semibold">{BRAND.url}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Primary color</span>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border" style={{ backgroundColor: BRAND.primaryColor }} />
                <span className="font-mono text-xs font-semibold">{BRAND.primaryColor}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold capitalize">{BRAND.plan}</span>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="w-full mt-4 text-primary" asChild>
            <Link href="/brand">Edit profile →</Link>
          </Button>
        </div>

        {/* Scan Status */}
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MagnifyingGlass className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scan status</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Scans used</span>
                <span className="font-semibold">{BRAND.usage.scans.used} / {BRAND.usage.scans.limit}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(BRAND.usage.scans.used / BRAND.usage.scans.limit) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Exports used</span>
                <span className="font-semibold">{BRAND.usage.exports.used} / {BRAND.usage.exports.limit}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(BRAND.usage.exports.used / BRAND.usage.exports.limit) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle className="h-4 w-4 text-green-600" weight="bold" />
              <span className="text-sm text-green-600 font-medium">All scans up to date</span>
            </div>
          </div>
        </div>

        {/* Identity Completeness */}
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Lightning className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identity completeness</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(BRAND.identityCompleteness / 100) * 326.7} 326.7`}
                  className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-extrabold">{BRAND.identityCompleteness}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'Colors', done: true },
              { label: 'Typography', done: true },
              { label: 'Logos', done: true },
              { label: 'Spacing', done: true },
              { label: 'Components', done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                {item.done ? (
                  <CheckCircle className="h-4 w-4 text-green-600" weight="bold" />
                ) : (
                  <Warning className="h-4 w-4 text-yellow-500" weight="bold" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COLORS + GRADIENTS / TYPOGRAPHY ────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Colors & Gradients */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-4 w-4 text-primary" weight="bold" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors &amp; gradients</span>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/brand">View all →</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {BRAND_COLORS.map((c) => (
              <div key={c.hex} className="flex items-center gap-3 rounded-xl border p-2.5 hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg border shrink-0" style={{ backgroundColor: c.hex }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.role}</div>
                </div>
                <span className="text-xs font-mono font-semibold text-muted-foreground">{c.hex}</span>
              </div>
            ))}
          </div>
          {/* Gradient preview */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gradient</div>
            <div className="h-10 rounded-xl bg-gradient-to-r from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B]" />
          </div>
        </div>

        {/* Typography */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TextAa className="h-4 w-4 text-primary" weight="bold" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</span>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/brand">View all →</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {BRAND_FONTS.map((f) => (
              <div key={f.name} className="rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{f.name}</span>
                  <Badge variant="secondary" className="text-xs">{f.role}</Badge>
                </div>
                <div className="text-lg font-semibold" style={{ fontFamily: f.name }}>
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="text-xs text-muted-foreground mt-1">Weight: {f.weight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOGOS / SPACING / COMPONENTS ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Logos & Assets */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <CirclesFour className="h-4 w-4 text-primary" weight="bold" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logos &amp; assets</span>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/brand">View all →</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {LOGOS.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border p-2.5 hover:bg-muted/50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                  <CirclesFour className="h-5 w-5 text-muted-foreground" weight="bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.type} · {l.size}</div>
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="w-full mt-4 text-primary" asChild>
            <Link href="/brand">Upload assets →</Link>
          </Button>
        </div>

        {/* Spacing & Radius */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Ruler className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spacing &amp; radius</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold mb-2">Spacing scale</div>
              <div className="space-y-1.5">
                {[4, 8, 12, 16, 24, 32, 48].map((px) => (
                  <div key={px} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-8">{px}px</span>
                    <div className="h-3 bg-primary/20 rounded" style={{ width: `${px * 4}px` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="text-sm font-semibold mb-2">Border radius</div>
              <div className="flex gap-3">
                {[
                  { label: 'sm', radius: '4px' },
                  { label: 'md', radius: '8px' },
                  { label: 'lg', radius: '12px' },
                  { label: 'xl', radius: '16px' },
                ].map((r) => (
                  <div key={r.label} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20" style={{ borderRadius: r.radius }} />
                    <span className="text-[10px] font-mono text-muted-foreground">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Stack className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Components</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Buttons', count: 4 },
              { name: 'Inputs', count: 2 },
              { name: 'Cards', count: 3 },
              { name: 'Badges', count: 2 },
              { name: 'Modals', count: 1 },
            ].map((comp) => (
              <div key={comp.name} className="flex items-center justify-between rounded-xl border p-2.5 hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">{comp.name}</span>
                <Badge variant="secondary" className="text-xs">{comp.count}</Badge>
              </div>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="w-full mt-4 text-primary" asChild>
            <Link href="/brand">View component library →</Link>
          </Button>
        </div>
      </div>

      {/* ── RECENT REPORTS REQUIRING ATTENTION ─────────────────────── */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <WarningCircle className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent reports requiring attention</span>
          </div>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/scans">View all →</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {RECENT_SCANS.filter((s) => s.needsAttention).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" weight="bold" />
              <p className="text-sm text-muted-foreground">All reports are on-brand. No action needed.</p>
            </div>
          ) : (
            RECENT_SCANS.filter((s) => s.needsAttention).map((scan) => (
              <Link
                key={scan.id}
                href={`/scans/${scan.id}`}
                className="flex items-center gap-4 rounded-xl border p-3 hover:bg-muted/50 transition-colors group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                  scan.status === 'fail' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  {scan.status === 'fail' ? (
                    <WarningCircle className="h-5 w-5 text-red-600" weight="bold" />
                  ) : (
                    <Warning className="h-5 w-5 text-yellow-600" weight="bold" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{scan.name}</span>
                    <Badge variant={scan.type === 'social' ? 'default' : 'secondary'} className="text-[10px]">{scan.type}</Badge>
                  </div>
                  {scan.issues && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {scan.issues.map((issue, i) => (
                        <span key={i} className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{issue}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xl font-extrabold ${SCORE_COLOR(scan.score)}`}>{scan.score}</span>
                  {STATUS_BADGE(scan.status)}
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" weight="bold" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── RECENT IDENTITY CHANGES & VERSIONS ─────────────────────── */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-4 w-4 text-primary" weight="bold" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent identity changes &amp; versions</span>
          </div>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/brand">View history →</Link>
          </Button>
        </div>
        <div className="space-y-0">
          {RECENT_CHANGES.map((change, i) => (
            <div key={change.id} className="flex items-start gap-3 py-3 border-b last:border-0">
              <div className="relative flex flex-col items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {i < RECENT_CHANGES.length - 1 && (
                  <div className="w-px bg-border flex-1 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{change.title}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{change.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{change.detail}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" weight="bold" />
                <span>{change.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
