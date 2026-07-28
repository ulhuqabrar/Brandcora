import { prisma } from '@saas/database';
import {
  extractGradientsFromCss,
  extractGradientsFromCssVariables,
  extractSvgGradients,
  deduplicateGradients,
  classifyGradientRole,
  calculateGradientConfidence,
  parseColorToHexForGradient,
  hexToRgbForGradient,
  calculateSvgAngle,
  type ParsedGradient,
} from './gradient-parser.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorInfo {
  hex: string;
  name: string;
  role: string;
  confidence: 'high' | 'medium' | 'low';
}

interface FontInfo {
  family: string;
  name: string;
  role: string;
  confidence: 'high' | 'medium' | 'low';
}

interface LogoInfo {
  url: string;
  type: string;
  confidence: 'high' | 'medium' | 'low';
  location: string;
}

interface GradientInfo {
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

export interface ExtractionResult {
  brandName: string;
  colors: ColorInfo[];
  fonts: FontInfo[];
  logos: LogoInfo[];
  gradients: GradientInfo[];
  borderRadius: string;
  spacing: string[];
  shadows: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexFromColor(color: string): string {
  if (color.startsWith('#')) {
    if (color.length === 4) {
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    return color.slice(0, 7);
  }
  const match = color.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function colorDistance(c1: string, c2: string): number {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function extractColorsFromCss(css: string): string[] {
  const colors: string[] = [];
  const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
  let match;
  while ((match = hexPattern.exec(css)) !== null) {
    const hex = '#' + match[1];
    if (hex.length >= 4 && hex.length <= 7 && !hex.includes('ffffff') && !hex.includes('000000')) {
      colors.push(hexFromColor(hex));
    }
  }
  const rgbPattern = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g;
  while ((match = rgbPattern.exec(css)) !== null) {
    const hex = '#' + [match[1], match[2], match[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    colors.push(hex);
  }
  const hslPattern = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/g;
  while ((match = hslPattern.exec(css)) !== null) {
    const h = parseInt(match[1]) / 360, s = parseInt(match[2]) / 100, l = parseInt(match[3]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    const hex = '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    colors.push(hex);
  }
  return colors;
}

function extractFontsFromHtml(html: string): string[] {
  const fonts: string[] = [];
  const googleFontsMatch = html.match(/fonts\.googleapis\.com\/css2\?family=([^&"']+)/);
  if (googleFontsMatch) {
    const familyParam = decodeURIComponent(googleFontsMatch[1]);
    familyParam.split('|').forEach(f => {
      const name = f.split(':')[0].replace(/\+/g, ' ');
      if (name) fonts.push(name);
    });
  }
  const fontFamilyPattern = /font-family\s*:\s*['"]?([^'";}\n]+)['"]?/g;
  let match;
  while ((match = fontFamilyPattern.exec(html)) !== null) {
    const family = match[1].split(',')[0].trim().replace(/['"]/g, '');
    if (family && !family.startsWith('var(') && family.length > 1) {
      fonts.push(family);
    }
  }
  return [...new Set(fonts)];
}

function extractLogos(html: string, baseUrl: string): LogoInfo[] {
  const logos: LogoInfo[] = [];
  const logoPatterns = [
    { pattern: /<img[^>]*(?:alt|title|class|id|src)[^"]*["'][^"']*(?:logo|brand|header)[^"']*["'][^>]*src=["']([^"']+)["']/gi, location: 'img-tag', confidence: 'high' as const },
    { pattern: /<img[^>]*src=["']([^"']+)["'][^>]*(?:alt|title|class|id)[^"]*["'][^"']*(?:logo|brand|header)[^"']*["']/gi, location: 'img-tag', confidence: 'high' as const },
    { pattern: /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/gi, location: 'favicon', confidence: 'medium' as const },
    { pattern: /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/gi, location: 'favicon', confidence: 'medium' as const },
    { pattern: /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi, location: 'og-image', confidence: 'medium' as const },
  ];
  for (const { pattern, location, confidence } of logoPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = baseUrl + url;
      else if (!url.startsWith('http')) url = baseUrl + '/' + url;
      logos.push({ url, type: location, confidence, location });
    }
  }
  const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
  if (headerMatch) {
    const headerImgPattern = /<img[^>]*src=["']([^"']+)["']/gi;
    let match;
    while ((match = headerImgPattern.exec(headerMatch[1])) !== null) {
      let url = match[1];
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = baseUrl + url;
      else if (!url.startsWith('http')) url = baseUrl + '/' + url;
      if (!logos.find(l => l.url === url)) {
        logos.push({ url, type: 'header-image', confidence: 'low', location: 'header' });
      }
    }
  }
  return logos;
}

function extractSpacing(html: string): string[] {
  const spacingPattern = /(?:margin|padding|gap)\s*:\s*(\d+(?:px|rem|em))/g;
  const values: string[] = [];
  let match;
  while ((match = spacingPattern.exec(html)) !== null) {
    values.push(match[1]);
  }
  return [...new Set(values)].sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 8);
}

// ─── Main Extraction ──────────────────────────────────────────────────────────

export async function extractBrandFromHtml(
  html: string,
  baseUrl: string,
  parsedUrl: URL
): Promise<ExtractionResult> {
  // Extract CSS
  let allCss = '';
  const styleTagPattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleTagPattern.exec(html)) !== null) {
    allCss += styleMatch[1] + '\n';
  }
  const inlineStylePattern = /style=["']([^"']+)["']/g;
  while ((styleMatch = inlineStylePattern.exec(html)) !== null) {
    allCss += styleMatch[1] + '\n';
  }

  // 1. Colors
  const rawColors = extractColorsFromCss(allCss + ' ' + html);
  console.log(`[EXTRACTOR] Raw colors found: ${rawColors.length}, CSS length: ${allCss.length}, HTML length: ${html.length}`);
  const colorCounts: Record<string, number> = {};
  for (const c of rawColors) {
    const similar = Object.keys(colorCounts).find(existing => colorDistance(existing, c) < 30);
    if (similar) {
      colorCounts[similar]++;
    } else {
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    }
  }
  const sortedColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  const colorRoles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'border', 'success', 'warning', 'error', 'muted', 'highlight'];
  const colors: ColorInfo[] = sortedColors.map(([hex, count], i) => {
    const role = i < colorRoles.length ? colorRoles[i] : 'extra';
    const confidence: 'high' | 'medium' | 'low' = i < 3 ? 'high' : i < 6 ? 'medium' : 'low';
    const name = role.charAt(0).toUpperCase() + role.slice(1);
    return { hex, name, role, confidence };
  });

  // 2. Fonts
  const rawFonts = extractFontsFromHtml(html);
  const fonts: FontInfo[] = rawFonts.slice(0, 6).map((f, i) => ({
    family: f,
    name: f,
    role: i === 0 ? 'heading' : i === 1 ? 'body' : 'accent',
    confidence: i < 2 ? 'high' : 'medium',
  }));

  // 3. Logos
  const logos = extractLogos(html, baseUrl);

  // 4. Brand name
  let brandName = '';
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) brandName = titleMatch[1].split(/[-|–—]/)[0].trim();
  const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
  if (ogSiteMatch) brandName = ogSiteMatch[1];
  const metaTitleMatch = html.match(/<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["']/i);
  if (metaTitleMatch) brandName = metaTitleMatch[1];
  if (!brandName) brandName = parsedUrl.hostname.replace('www.', '');

  // 5. Border radius
  const radiusPattern = /border-radius\s*:\s*(\d+(?:px|rem|em|%))/g;
  const radii: string[] = [];
  let rMatch;
  while ((rMatch = radiusPattern.exec(allCss)) !== null) {
    radii.push(rMatch[1]);
  }
  const borderRadius = radii.length > 0 ? radii.sort()[Math.floor(radii.length / 2)] : '8px';

  // 6. Spacing
  const spacing = extractSpacing(allCss);

  // 7. Shadows
  const shadowPattern = /box-shadow\s*:\s*([^;]+)/g;
  const shadows: string[] = [];
  let sMatch;
  while ((sMatch = shadowPattern.exec(allCss)) !== null) {
    shadows.push(sMatch[1].trim());
  }

  // 8. Gradients
  const extractedGradients: GradientInfo[] = [];

  const cssVarGradients = extractGradientsFromCssVariables(allCss);
  for (const { name, value, gradient } of cssVarGradients) {
    if (gradient) {
      const role = classifyGradientRole(gradient, { cssVariableName: name });
      const confidence = calculateGradientConfidence(gradient, {
        source: 'stylesheet',
        hasVariableResolution: true,
        stopCount: gradient.stops.length,
      });
      extractedGradients.push({
        type: gradient.type,
        repeating: gradient.repeating,
        angle: gradient.angle,
        shape: gradient.shape,
        position: gradient.position,
        stops: gradient.stops.map(s => ({
          colorHex: s.colorHex,
          alpha: s.alpha,
          position: s.position,
          positionSource: s.positionSource,
        })),
        originalValue: gradient.originalValue,
        normalizedValue: gradient.normalizedValue,
        confidence,
        role,
        usageCount: 1,
        cssVariableName: name,
      });
    }
  }

  const cssGradients = extractGradientsFromCss(allCss);
  for (const { value, gradient, context } of cssGradients) {
    if (gradient) {
      const role = classifyGradientRole(gradient, { selector: context });
      const confidence = calculateGradientConfidence(gradient, {
        source: 'stylesheet',
        hasVariableResolution: false,
        stopCount: gradient.stops.length,
      });
      const isDuplicate = extractedGradients.some(eg =>
        eg.normalizedValue === gradient.normalizedValue
      );
      if (!isDuplicate) {
        extractedGradients.push({
          type: gradient.type,
          repeating: gradient.repeating,
          angle: gradient.angle,
          shape: gradient.shape,
          position: gradient.position,
          stops: gradient.stops.map(s => ({
            colorHex: s.colorHex,
            alpha: s.alpha,
            position: s.position,
            positionSource: s.positionSource,
          })),
          originalValue: gradient.originalValue,
          normalizedValue: gradient.normalizedValue,
          confidence,
          role,
          usageCount: 1,
          cssVariableName: null,
        });
      }
    }
  }

  const svgGradients = extractSvgGradients(html);
  for (const svgGrad of svgGradients) {
    const stops = svgGrad.stops.map(s => {
      const { hex, alpha } = parseColorToHexForGradient(s.stopColor);
      const stopAlpha = parseFloat(s.stopOpacity) || 1;
      return {
        colorHex: hex,
        alpha: stopAlpha * (alpha || 1),
        position: s.offset,
        positionSource: 'explicit' as const,
      };
    });
    if (stops.length >= 2) {
      const angle = svgGrad.type === 'linear' && svgGrad.x1 !== undefined
        ? calculateSvgAngle(svgGrad.x1, svgGrad.y1 || '0', svgGrad.x2 || '1', svgGrad.y2 || '0')
        : null;
      const normalizedValue = svgGrad.type === 'linear'
        ? `linear-gradient(${angle || 0}deg, ${stops.map(s => `${s.colorHex} ${s.position}`).join(', ')})`
        : `radial-gradient(circle, ${stops.map(s => `${s.colorHex} ${s.position}`).join(', ')})`;
      extractedGradients.push({
        type: svgGrad.type,
        repeating: false,
        angle,
        shape: svgGrad.type === 'radial' ? 'circle' : null,
        position: null,
        stops,
        originalValue: `url(#${svgGrad.id})`,
        normalizedValue,
        confidence: 0.85,
        role: 'unknown',
        usageCount: 1,
        cssVariableName: null,
      });
    }
  }

  // Deduplicate gradients
  const uniqueGradients = deduplicateGradients(
    extractedGradients.map(g => ({
      type: g.type as 'linear' | 'radial' | 'conic',
      repeating: g.repeating,
      angle: g.angle,
      shape: g.shape,
      position: g.position,
      stops: g.stops.map(s => ({
        colorHex: s.colorHex,
        rgb: hexToRgbForGradient(s.colorHex),
        alpha: s.alpha,
        position: s.position,
        positionSource: s.positionSource as 'explicit' | 'inferred',
        originalColor: s.colorHex,
      })),
      originalValue: g.originalValue,
      normalizedValue: g.normalizedValue,
      confidence: g.confidence,
    }))
  );

  const gradients: GradientInfo[] = uniqueGradients.map(ug => {
    const original = extractedGradients.find(g => g.normalizedValue === ug.normalizedValue);
    return {
      type: ug.type,
      repeating: ug.repeating,
      angle: ug.angle,
      shape: ug.shape,
      position: ug.position,
      stops: ug.stops.map(s => ({
        colorHex: s.colorHex,
        alpha: s.alpha,
        position: s.position,
        positionSource: s.positionSource,
      })),
      originalValue: ug.originalValue,
      normalizedValue: ug.normalizedValue,
      confidence: ug.confidence,
      role: original?.role || 'unknown',
      usageCount: original?.usageCount || 1,
      cssVariableName: original?.cssVariableName || null,
    };
  });

  return {
    brandName,
    colors,
    fonts,
    logos,
    gradients,
    borderRadius,
    spacing,
    shadows,
  };
}

// ─── Save to Brand Profile ────────────────────────────────────────────────────

export async function saveExtractionToBrandProfile(
  userId: string,
  brandProfileId: string,
  extraction: ExtractionResult
): Promise<void> {
  console.log(`[SAVE] Saving extraction to brand profile ${brandProfileId} for user ${userId}`);
  console.log(`[SAVE] Data: colors=${extraction.colors.length}, fonts=${extraction.fonts.length}, logos=${extraction.logos.length}, gradients=${extraction.gradients.length}`);

  // Update brand profile name if we got a better one
  if (extraction.brandName) {
    await (prisma as any).brandProfile.update({
      where: { id: brandProfileId },
      data: {
        name: extraction.brandName,
        borderRadius: parseInt(extraction.borderRadius) || 8,
        spacingPreference: extraction.spacing.length > 4 ? 'comfortable' : 'compact',
      },
    });
  }

  // Clear existing brand data and replace with extracted data in a transaction
  await prisma.$transaction(async (tx: any) => {
    // Clear existing
    await tx.brandColor.deleteMany({ where: { brandProfileId } });
    await tx.brandFont.deleteMany({ where: { brandProfileId } });
    await tx.brandLogo.deleteMany({ where: { brandProfileId } });
    await tx.brandGradient.deleteMany({ where: { brandProfileId } });

    // Save colors
    if (extraction.colors.length > 0) {
      await tx.brandColor.createMany({
        data: extraction.colors.map(c => ({
          brandProfileId,
          name: c.name,
          hexValue: c.hex,
          role: c.role,
        })),
      });
    }

    // Save fonts
    if (extraction.fonts.length > 0) {
      await tx.brandFont.createMany({
        data: extraction.fonts.map(f => ({
          brandProfileId,
          name: f.name,
          family: f.family,
          role: f.role,
          weight: 400,
        })),
      });
    }

    // Save logos
    if (extraction.logos.length > 0) {
      await tx.brandLogo.createMany({
        data: extraction.logos.map(l => ({
          brandProfileId,
          fileUrl: l.url,
          storageKey: l.url,
          logoType: l.type,
          backgroundType: 'any',
        })),
      });
    }

    // Save gradients
    if (extraction.gradients.length > 0) {
      await tx.brandGradient.createMany({
        data: extraction.gradients.map(g => ({
          brandProfileId,
          name: `${g.role || 'gradient'}-${g.type}`,
          role: g.role,
          gradientType: g.type,
          repeating: g.repeating,
          originalValue: g.originalValue,
          normalizedValue: g.normalizedValue,
          angle: g.angle,
          shape: g.shape,
          position: g.position,
          stops: g.stops,
          usageCount: g.usageCount,
          pageCount: 1,
          sourceType: 'extracted',
          cssVariableName: g.cssVariableName,
          confidence: g.confidence,
          isApproved: false,
        })),
      });
    }

    // Save spacing and radius as rules
    await tx.brandRule.deleteMany({ where: { brandProfileId } });
    if (extraction.spacing.length > 0) {
      await tx.brandRule.create({
        data: {
          brandProfileId,
          category: 'spacing',
          name: 'Spacing Scale',
          value: JSON.stringify(extraction.spacing),
        },
      });
    }
    if (extraction.shadows.length > 0) {
      await tx.brandRule.create({
        data: {
          brandProfileId,
          category: 'shadows',
          name: 'Shadow Scale',
          value: JSON.stringify(extraction.shadows.slice(0, 4)),
        },
      });
    }
  });

  console.log(`[SAVE] Transaction completed successfully for brand profile ${brandProfileId}`);
}
