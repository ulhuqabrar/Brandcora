'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Pencil, Globe, ArrowRight, CheckCircle, Download } from '@phosphor-icons/react';
import { getBrandIdentity, type BrandIdentity } from '@/lib/brand-identity';

interface BrandGradient {
  type: string;
  repeating: boolean;
  angle: number | null;
  shape: string | null;
  position: string | null;
  stops: Array<{
    colorHex: string;
    alpha: number;
    position: string;
    positionSource: string;
  }>;
  originalValue: string;
  normalizedValue: string;
  confidence: number;
  role: string;
  usageCount: number;
  cssVariableName: string | null;
}

interface BrandProfile {
  id: string;
  name: string;
  description: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  buttonRadius: number;
  borderRadius: number;
  spacingPreference: string | null;
  colors: Array<{ id: string; name: string; hexValue: string; role: string }>;
  fonts: Array<{ id: string; name: string; family: string; role: string; weight: number }>;
  logos: Array<{ id: string; fileUrl: string; logoType: string }>;
  gradients: BrandGradient[];
  rules: Array<{ id: string; category: string; name: string; value: string }>;
  visualStyle?: string;
  websiteUrl?: string;
}

function buildProfileFromExtracted(data: any): BrandProfile {
  const colors = (data.colors || []).map((c: any, i: number) => ({
    id: `ec-${i}`, name: c.role, hexValue: c.hex, role: c.role,
  }));
  const fonts = (data.fonts || []).map((f: any, i: number) => ({
    id: `ef-${i}`, name: f.family, family: f.family, role: f.role, weight: f.role === 'heading' ? 700 : 400,
  }));
  const logos = (data.logos || []).map((l: any, i: number) => ({
    id: `el-${i}`, fileUrl: l.url, logoType: l.type,
  }));
  const gradients: BrandGradient[] = (data.gradients || []).map((g: any, i: number) => ({
    type: g.type || 'linear',
    repeating: g.repeating || false,
    angle: g.angle ?? null,
    shape: g.shape ?? null,
    position: g.position ?? null,
    stops: g.stops || [],
    originalValue: g.originalValue || '',
    normalizedValue: g.normalizedValue || '',
    confidence: g.confidence || 0.9,
    role: g.role || 'unknown',
    usageCount: g.usageCount || 1,
    cssVariableName: g.cssVariableName ?? null,
  }));
  return {
    id: 'extracted-1',
    name: data.brandName || 'My Brand',
    description: data.visualStyle || null,
    headingFont: data.fonts?.[0]?.family || '',
    bodyFont: data.fonts?.[1]?.family || data.fonts?.[0]?.family || '',
    buttonRadius: parseInt(data.borderRadius) || 8,
    borderRadius: parseInt(data.borderRadius) || 8,
    spacingPreference: 'comfortable',
    colors, fonts, logos, gradients, rules: [],
    visualStyle: data.visualStyle,
    websiteUrl: data.websiteUrl,
  };
}

const DEMO_PROFILE: BrandProfile = {
  id: 'demo-1', name: 'My Brand', description: 'Our official brand identity',
  headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter',
  buttonRadius: 8, borderRadius: 12, spacingPreference: 'comfortable',
  colors: [
    { id: 'c1', name: 'Primary', hexValue: '#35378F', role: 'primary' },
    { id: 'c2', name: 'Accent', hexValue: '#22D3EE', role: 'accent' },
    { id: 'c3', name: 'Dark', hexValue: '#1E293B', role: 'dark' },
  ],
  fonts: [
    { id: 'f1', name: 'Jakarta', family: 'Plus Jakarta Sans', role: 'heading', weight: 700 },
    { id: 'f2', name: 'Inter', family: 'Inter', role: 'body', weight: 400 },
  ],
  logos: [],
  gradients: [
    {
      type: 'linear',
      repeating: false,
      angle: 135,
      shape: null,
      position: null,
      stops: [
        { colorHex: '#35378F', alpha: 1, position: '0%', positionSource: 'explicit' },
        { colorHex: '#22D3EE', alpha: 1, position: '100%', positionSource: 'explicit' },
      ],
      originalValue: 'linear-gradient(135deg, #35378F 0%, #22D3EE 100%)',
      normalizedValue: 'linear-gradient(135deg,\n  #35378F 0%,\n  #22D3EE 100%\n)',
      confidence: 0.95,
      role: 'primary',
      usageCount: 5,
      cssVariableName: '--brand-gradient',
    },
  ],
  rules: [],
};

function saveToIdentity(profile: BrandProfile) {
  const identity: BrandIdentity = {
    name: profile.name,
    websiteUrl: profile.websiteUrl,
    visualStyle: profile.visualStyle,
    colors: profile.colors.map(c => ({ hex: c.hexValue, role: c.role })),
    fonts: profile.fonts.map(f => ({ family: f.family, role: f.role, weight: f.weight })),
    logos: profile.logos.map(l => ({ url: l.fileUrl, type: l.logoType })),
    gradients: profile.gradients.map(g => ({
      type: g.type,
      repeating: g.repeating,
      angle: g.angle,
      shape: g.shape,
      position: g.position,
      stops: g.stops,
      originalValue: g.originalValue,
      normalizedValue: g.normalizedValue,
      confidence: g.confidence,
      role: g.role,
      usageCount: g.usageCount,
      cssVariableName: g.cssVariableName,
    })),
    headingFont: profile.headingFont || '',
    bodyFont: profile.bodyFont || '',
    buttonRadius: profile.buttonRadius,
    borderRadius: profile.borderRadius,
    spacingScale: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'],
    buttonStyles: {
      primaryBg: profile.colors.find(c => c.role === 'primary')?.hexValue || '#35378F',
      primaryText: '#FFFFFF',
      secondaryBg: 'transparent',
      secondaryText: profile.colors.find(c => c.role === 'primary')?.hexValue || '#35378F',
      radius: `${profile.buttonRadius}px`,
      padding: '12px 24px',
    },
  };
  localStorage.setItem('brand-profile-data', JSON.stringify(identity));
}

export default function BrandProfilePage() {
  const [profile, setProfile] = useState<BrandProfile>(DEMO_PROFILE);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: DEMO_PROFILE.name, description: DEMO_PROFILE.description || '',
    headingFont: DEMO_PROFILE.headingFont || '', bodyFont: DEMO_PROFILE.bodyFont || '',
    buttonRadius: DEMO_PROFILE.buttonRadius, borderRadius: DEMO_PROFILE.borderRadius,
    spacingPreference: DEMO_PROFILE.spacingPreference || '',
  });

  useEffect(() => {
    const extracted = localStorage.getItem('brand-profile-data');
    if (extracted) {
      try {
        const data = JSON.parse(extracted);
        if (data.colors) {
          const built = buildProfileFromExtracted(data);
          setProfile(built);
          setFormData({
            name: built.name, description: built.description || '',
            headingFont: built.headingFont || '', bodyFont: built.bodyFont || '',
            buttonRadius: built.buttonRadius, borderRadius: built.borderRadius,
            spacingPreference: built.spacingPreference || '',
          });
        }
      } catch { /* ignore */ }
    }
  }, []);

  function handleSave() {
    const updated = { ...profile, ...formData };
    setProfile(updated);
    saveToIdentity(updated);
    setEditing(false);
  }

  function handleDownload() {
    const brandData = {
      brandProfile: {
        name: profile.name,
        description: profile.description,
        websiteUrl: profile.websiteUrl,
        visualStyle: profile.visualStyle,
      },
      colors: profile.colors.map(c => ({
        name: c.name,
        hex: c.hexValue,
        role: c.role,
      })),
      fonts: profile.fonts.map(f => ({
        family: f.family,
        role: f.role,
        weight: f.weight,
      })),
      logos: profile.logos.map(l => ({
        url: l.fileUrl,
        type: l.logoType,
      })),
      gradients: profile.gradients.map(g => ({
        type: g.type,
        repeating: g.repeating,
        angle: g.angle,
        shape: g.shape,
        position: g.position,
        stops: g.stops,
        originalValue: g.originalValue,
        normalizedValue: g.normalizedValue,
        confidence: g.confidence,
        role: g.role,
        usageCount: g.usageCount,
        cssVariableName: g.cssVariableName,
      })),
      settings: {
        headingFont: profile.headingFont,
        bodyFont: profile.bodyFont,
        buttonRadius: profile.buttonRadius,
        borderRadius: profile.borderRadius,
        spacingPreference: profile.spacingPreference,
      },
      exportedAt: new Date().toISOString(),
    };

    const jsonContent = JSON.stringify(brandData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-brand-profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Brand Profile</h1>
          <p className="text-muted-foreground mt-1">Your brand identity — the source of truth for all checks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} className="glass">
            <Download className="mr-1.5 h-4 w-4" weight="bold" />Download JSON
          </Button>
          <Button asChild className="gradient-accent text-white shadow-glass">
            <Link href="/brand/extract"><Globe className="mr-1.5 h-4 w-4" weight="bold" />Extract from website</Link>
          </Button>
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)} className="glass">
              <Pencil className="mr-1.5 h-4 w-4" weight="bold" />Edit profile
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">Edit Brand Profile</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-white" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-white" /></div>
              <div className="space-y-2"><Label>Heading font</Label><Input value={formData.headingFont} onChange={e => setFormData({ ...formData, headingFont: e.target.value })} className="bg-white" /></div>
              <div className="space-y-2"><Label>Body font</Label><Input value={formData.bodyFont} onChange={e => setFormData({ ...formData, bodyFont: e.target.value })} className="bg-white" /></div>
              <div className="space-y-2"><Label>Button radius (px)</Label><Input type="number" value={formData.buttonRadius} onChange={e => setFormData({ ...formData, buttonRadius: parseInt(e.target.value) || 0 })} className="bg-white" /></div>
              <div className="space-y-2"><Label>Border radius (px)</Label><Input type="number" value={formData.borderRadius} onChange={e => setFormData({ ...formData, borderRadius: parseInt(e.target.value) || 0 })} className="bg-white" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={!formData.name} className="gradient-accent text-white shadow-glass">Save profile</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {profile.websiteUrl && (
            <div className="glass-strong rounded-2xl p-4 shadow-glass flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" weight="fill" />
              <div className="flex-1">
                <p className="text-sm font-medium">Extracted from {profile.websiteUrl}</p>
                {profile.visualStyle && <p className="text-xs text-muted-foreground mt-0.5">{profile.visualStyle}</p>}
              </div>
              <Button size="sm" variant="ghost" asChild><Link href="/brand/extract">Re-extract<ArrowRight className="ml-1 h-3 w-3" weight="bold" /></Link></Button>
            </div>
          )}

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl shadow-glass overflow-hidden"
                style={{
                  background: profile.colors.length >= 2
                    ? `linear-gradient(135deg, ${profile.colors[0].hexValue} 0%, ${profile.colors[1].hexValue} 100%)`
                    : profile.colors.length === 1
                    ? profile.colors[0].hexValue
                    : undefined
                }}
              >
                {profile.websiteUrl ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${profile.websiteUrl}&sz=64`}
                    alt={profile.name}
                    className="h-full w-full object-contain bg-white p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-white font-bold text-lg">${profile.name.charAt(0)}</span>`;
                    }}
                  />
                ) : (
                  <Palette className="h-6 w-6 text-white" weight="bold" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                {profile.description && <p className="text-sm text-muted-foreground">{profile.description}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-medium text-muted-foreground">Heading font</p><p className="text-sm font-medium mt-1">{profile.headingFont || 'Not set'}</p></div>
              <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-medium text-muted-foreground">Body font</p><p className="text-sm font-medium mt-1">{profile.bodyFont || 'Not set'}</p></div>
              <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-medium text-muted-foreground">Button radius</p><p className="text-sm font-medium mt-1">{profile.buttonRadius}px</p></div>
              <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-medium text-muted-foreground">Border radius</p><p className="text-sm font-medium mt-1">{profile.borderRadius}px</p></div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Brand Colors</h3><span className="text-sm text-muted-foreground">{profile.colors.length} colors</span></div>
            <div className="flex flex-wrap gap-3">
              {profile.colors.map(c => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3 bg-white">
                  <div className="h-10 w-10 rounded-full border shadow-inner" style={{ backgroundColor: c.hexValue }} />
                  <div><p className="text-sm font-medium capitalize">{c.role}</p><p className="text-xs text-muted-foreground">{c.hexValue}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Brand Fonts</h3><span className="text-sm text-muted-foreground">{profile.fonts.length} fonts</span></div>
            <div className="space-y-2">
              {profile.fonts.map(f => (
                <div key={f.id} className="flex items-center justify-between rounded-xl border p-3 bg-white">
                  <div><p className="text-sm font-medium">{f.family}</p><p className="text-xs text-muted-foreground">{f.role}</p></div>
                  <Badge variant="outline">{f.weight}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Brand Logos</h3><span className="text-sm text-muted-foreground">{profile.logos.length} logos</span></div>
            {profile.logos.length === 0 ? <p className="text-sm text-muted-foreground">No logos yet.</p> : (
              <div className="flex flex-wrap gap-4">
                {profile.logos.map(l => (
                  <div key={l.id} className="text-center rounded-xl border p-4 bg-white">
                    <img src={l.fileUrl} alt={l.logoType} className="h-20 w-20 object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <p className="text-xs text-muted-foreground mt-2">{l.logoType}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-glass">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Brand Gradients</h3><span className="text-sm text-muted-foreground">{profile.gradients.length} gradients</span></div>
            {profile.gradients.length === 0 ? <p className="text-sm text-muted-foreground">No gradients detected.</p> : (
              <div className="space-y-4">
                {profile.gradients.map((g, i) => (
                  <div key={i} className="rounded-xl border p-4 bg-white">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-16 w-32 rounded-lg border shrink-0"
                        style={{
                          background: g.normalizedValue || `linear-gradient(${g.angle || 0}deg, ${g.stops.map(s => `${s.colorHex} ${s.position}`).join(', ')})`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium capitalize">{g.role}</p>
                          <Badge variant="outline" className="text-xs">{g.type}</Badge>
                          {g.repeating && <Badge variant="secondary" className="text-xs">repeating</Badge>}
                        </div>
                        {g.angle !== null && <p className="text-xs text-muted-foreground">Direction: {g.angle}deg</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {g.stops.map((s, j) => (
                            <div key={j} className="flex items-center gap-1">
                              <div className="h-3 w-3 rounded-sm border" style={{ backgroundColor: s.colorHex }} />
                              <span className="text-[10px] font-mono text-muted-foreground">{s.colorHex} {s.position}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground mt-2 break-all">{g.originalValue}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(g.confidence * 100)}%</span>
                          <span>Used: {g.usageCount}x</span>
                          {g.cssVariableName && <span>Var: {g.cssVariableName}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
