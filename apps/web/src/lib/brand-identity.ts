export interface BrandIdentity {
  name: string;
  websiteUrl?: string;
  visualStyle?: string;
  colors: Array<{ hex: string; role: string }>;
  fonts: Array<{ family: string; role: string; weight: number }>;
  logos: Array<{ url: string; type: string }>;
  gradients: Array<{
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
  }>;
  headingFont: string;
  bodyFont: string;
  buttonRadius: number;
  borderRadius: number;
  spacingScale: string[];
  buttonStyles: {
    primaryBg: string;
    primaryText: string;
    secondaryBg: string;
    secondaryText: string;
    radius: string;
    padding: string;
  };
}

const DEFAULT_IDENTITY: BrandIdentity = {
  name: 'My Brand',
  colors: [
    { hex: '#35378F', role: 'primary' },
    { hex: '#22D3EE', role: 'accent' },
    { hex: '#1E293B', role: 'dark' },
  ],
  fonts: [
    { family: 'Plus Jakarta Sans', role: 'heading', weight: 700 },
    { family: 'Inter', role: 'body', weight: 400 },
  ],
  logos: [],
  gradients: [],
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Inter',
  buttonRadius: 8,
  borderRadius: 12,
  spacingScale: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'],
  buttonStyles: {
    primaryBg: '#35378F',
    primaryText: '#FFFFFF',
    secondaryBg: 'transparent',
    secondaryText: '#35378F',
    radius: '8px',
    padding: '12px 24px',
  },
};

export function getBrandIdentity(): BrandIdentity {
  const saved = localStorage.getItem('brand-profile-data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const colors = (data.colors || []).map((c: any) => ({ hex: c.hex || c.hexValue, role: c.role }));
      const fonts = (data.fonts || []).map((f: any) => ({ family: f.family, role: f.role, weight: f.weight || 400 }));
      const gradients = (data.gradients || []).map((g: any) => ({
        type: g.type || g.gradientType || 'linear',
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
      const primaryBg = colors.find((c: any) => c.role === 'primary')?.hex || '#35378F';
      const secondaryBg = colors.find((c: any) => c.role === 'secondary')?.hex || 'transparent';
      const secondaryText = colors.find((c: any) => c.role === 'secondary')?.hex || primaryBg;
      return {
        name: data.brandName || data.name || 'My Brand',
        websiteUrl: data.websiteUrl,
        visualStyle: data.visualStyle,
        colors,
        fonts,
        logos: (data.logos || []).map((l: any) => ({ url: l.url || l.fileUrl, type: l.type || l.logoType })),
        gradients,
        headingFont: data.headingFont || fonts[0]?.family || '',
        bodyFont: data.bodyFont || fonts[1]?.family || fonts[0]?.family || '',
        buttonRadius: data.buttonRadius || data.borderRadius || 8,
        borderRadius: data.borderRadius || 8,
        spacingScale: data.spacing?.scale || ['4px', '8px', '12px', '16px', '24px', '32px'],
        buttonStyles: {
          primaryBg,
          primaryText: '#FFFFFF',
          secondaryBg,
          secondaryText,
          radius: `${data.buttonRadius || 8}px`,
          padding: '12px 24px',
        },
      };
    } catch { /* ignore */ }
  }
  return DEFAULT_IDENTITY;
}

export function hexDistance(c1: string, c2: string): number {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function findClosestColor(detected: string, brandColors: Array<{ hex: string; role: string }>): { hex: string; role: string } | null {
  let best = null;
  let bestDist = Infinity;
  for (const c of brandColors) {
    const d = hexDistance(detected, c.hex);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best && bestDist < 100 ? best : null;
}

export function colorScore(detected: string, approved: string): number {
  const d = hexDistance(detected, approved);
  if (d === 0) return 100;
  if (d < 15) return 95;
  if (d < 30) return 85;
  if (d < 50) return 70;
  if (d < 80) return 50;
  if (d < 120) return 30;
  return 10;
}

export function fontScore(detected: string, approved: string): number {
  if (!detected || !approved) return 50;
  const d = detected.toLowerCase().trim();
  const a = approved.toLowerCase().trim();
  if (d === a) return 100;
  if (d.includes(a) || a.includes(d)) return 90;
  const dClean = d.replace(/['"]/g, '');
  const aClean = a.replace(/['"]/g, '');
  if (dClean === aClean) return 100;
  if (dClean.includes(aClean) || aClean.includes(dClean)) return 85;
  return 20;
}

export interface ScanIssue {
  id: string;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'recommendation' | 'passed';
  title: string;
  detected: string;
  brandRequirement: string;
  recommendation: string;
  affectedElement: string;
}

export function generateIssues(brand: BrandIdentity, detected: {
  colors?: Array<{ hex: string; location: string }>;
  fonts?: Array<{ family: string; weight?: number; element: string }>;
  borderRadius?: string;
  buttonBg?: string;
  buttonRadius?: string;
  spacing?: string[];
}): ScanIssue[] {
  const issues: ScanIssue[] = [];
  let issueId = 0;

  // Check colors
  if (detected.colors) {
    for (const dc of detected.colors) {
      const closest = findClosestColor(dc.hex, brand.colors);
      if (closest) {
        const score = colorScore(dc.hex, closest.hex);
        if (score >= 90) {
          issues.push({
            id: `issue-${++issueId}`,
            category: 'color',
            severity: 'passed',
            title: `${closest.role} color matches brand`,
            detected: dc.hex,
            brandRequirement: closest.hex,
            recommendation: 'No action needed.',
            affectedElement: dc.location,
          });
        } else if (score >= 70) {
          issues.push({
            id: `issue-${++issueId}`,
            category: 'color',
            severity: 'minor',
            title: `${closest.role} color slightly off-brand`,
            detected: dc.hex,
            brandRequirement: closest.hex,
            recommendation: `Replace ${dc.hex} with ${closest.hex} in ${dc.location}.`,
            affectedElement: dc.location,
          });
        } else {
          issues.push({
            id: `issue-${++issueId}`,
            category: 'color',
            severity: score < 40 ? 'critical' : 'major',
            title: `Incorrect ${closest.role} color`,
            detected: dc.hex,
            brandRequirement: closest.hex,
            recommendation: `Replace the ${dc.location} color from ${dc.hex} to the approved brand ${closest.role} color ${closest.hex}.`,
            affectedElement: dc.location,
          });
        }
      } else {
        issues.push({
          id: `issue-${++issueId}`,
          category: 'color',
          severity: 'major',
          title: 'Unrecognized color detected',
          detected: dc.hex,
          brandRequirement: 'Not defined in brand identity',
          recommendation: `The color ${dc.hex} in ${dc.location} does not match any approved brand color. Consider replacing it with a brand-approved color.`,
          affectedElement: dc.location,
        });
      }
    }
  }

  // Check fonts
  if (detected.fonts) {
    for (const df of detected.fonts) {
      const isHeading = df.element.toLowerCase().includes('h1') || df.element.toLowerCase().includes('h2') || df.element.toLowerCase().includes('heading');
      const approvedFont = isHeading ? brand.headingFont : brand.bodyFont;
      const score = fontScore(df.family, approvedFont);
      if (score >= 90) {
        issues.push({
          id: `issue-${++issueId}`,
          category: 'font',
          severity: 'passed',
          title: `${isHeading ? 'Heading' : 'Body'} font matches brand`,
          detected: df.family,
          brandRequirement: approvedFont,
          recommendation: 'No action needed.',
          affectedElement: df.element,
        });
      } else {
        issues.push({
          id: `issue-${++issueId}`,
          category: 'font',
          severity: score < 50 ? 'major' : 'minor',
          title: `Incorrect ${isHeading ? 'heading' : 'body'} font`,
          detected: df.family,
          brandRequirement: approvedFont,
          recommendation: `Change the font in ${df.element} from "${df.family}" to "${approvedFont}".`,
          affectedElement: df.element,
        });
      }
    }
  }

  // Check border radius
  if (detected.borderRadius) {
    const detectedR = parseInt(detected.borderRadius) || 0;
    const brandR = brand.borderRadius;
    const diff = Math.abs(detectedR - brandR);
    if (diff <= 2) {
      issues.push({
        id: `issue-${++issueId}`,
        category: 'component',
        severity: 'passed',
        title: 'Border radius matches brand',
        detected: `${detectedR}px`,
        brandRequirement: `${brandR}px`,
        recommendation: 'No action needed.',
        affectedElement: 'Components',
      });
    } else {
      issues.push({
        id: `issue-${++issueId}`,
        category: 'component',
        severity: diff > 8 ? 'major' : 'minor',
        title: 'Border radius differs from brand',
        detected: `${detectedR}px`,
        brandRequirement: `${brandR}px`,
        recommendation: `Change border radius from ${detectedR}px to ${brandR}px to match brand guidelines.`,
        affectedElement: 'Components',
      });
    }
  }

  // Check button style
  if (detected.buttonBg) {
    const closest = findClosestColor(detected.buttonBg, brand.colors);
    if (closest) {
      const score = colorScore(detected.buttonBg, closest.hex);
      if (score >= 90) {
        issues.push({
          id: `issue-${++issueId}`,
          category: 'button',
          severity: 'passed',
          title: 'Button color matches brand',
          detected: detected.buttonBg,
          brandRequirement: brand.buttonStyles.primaryBg,
          recommendation: 'No action needed.',
          affectedElement: 'Primary button',
        });
      } else {
        issues.push({
          id: `issue-${++issueId}`,
          category: 'button',
          severity: score < 50 ? 'critical' : 'major',
          title: 'Incorrect primary button color',
          detected: detected.buttonBg,
          brandRequirement: brand.buttonStyles.primaryBg,
          recommendation: `Replace the button background from ${detected.buttonBg} with ${brand.buttonStyles.primaryBg} and keep the ${brand.buttonStyles.primaryText} text color.`,
          affectedElement: 'Primary button',
        });
      }
    }
  }

  if (detected.buttonRadius) {
    const detectedR = parseInt(detected.buttonRadius) || 0;
    const brandR = parseInt(brand.buttonStyles.radius) || 8;
    const diff = Math.abs(detectedR - brandR);
    if (diff > 4) {
      issues.push({
        id: `issue-${++issueId}`,
        category: 'button',
        severity: 'minor',
        title: 'Button radius differs from brand',
        detected: `${detectedR}px`,
        brandRequirement: `${brandR}px`,
        recommendation: `Change button border radius from ${detectedR}px to ${brandR}px.`,
        affectedElement: 'Buttons',
      });
    }
  }

  return issues;
}

export function calculateScore(issues: ScanIssue[]): {
  overall: number;
  color: number;
  font: number;
  logo: number;
  component: number;
  layout: number;
  accessibility: number;
  responsive: number;
} {
  const total = issues.length || 1;
  const passed = issues.filter(i => i.severity === 'passed').length;
  const critical = issues.filter(i => i.severity === 'critical').length;
  const major = issues.filter(i => i.severity === 'major').length;
  const minor = issues.filter(i => i.severity === 'minor').length;

  const base = (passed / total) * 100;
  const penalty = (critical * 20) + (major * 10) + (minor * 3);
  const overall = Math.max(0, Math.min(100, Math.round(base - penalty)));

  const categoryScore = (cat: string) => {
    const catIssues = issues.filter(i => i.category === cat);
    if (catIssues.length === 0) return overall;
    const catPassed = catIssues.filter(i => i.severity === 'passed').length;
    return Math.round((catPassed / catIssues.length) * 100);
  };

  return {
    overall,
    color: categoryScore('color'),
    font: categoryScore('font'),
    logo: categoryScore('logo'),
    component: categoryScore('component'),
    layout: categoryScore('layout'),
    accessibility: categoryScore('accessibility'),
    responsive: categoryScore('responsive'),
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent brand match';
  if (score >= 75) return 'Good brand match';
  if (score >= 50) return 'Needs improvement';
  return 'Poor brand match';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}
