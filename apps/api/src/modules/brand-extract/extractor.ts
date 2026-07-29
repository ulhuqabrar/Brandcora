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
  
  // Extract hex colors (3, 4, 6, 8 digit)
  const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
  let match;
  while ((match = hexPattern.exec(css)) !== null) {
    const hex = '#' + match[1];
    // Only skip pure black and white
    if (hex.toLowerCase() !== '#000000' && hex.toLowerCase() !== '#ffffff' && 
        hex.toLowerCase() !== '#fff' && hex.toLowerCase() !== '#000') {
      colors.push(hexFromColor(hex));
    }
  }
  
  // Extract rgb() colors
  const rgbPattern = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  while ((match = rgbPattern.exec(css)) !== null) {
    const hex = '#' + [match[1], match[2], match[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    colors.push(hex);
  }
  
  // Extract rgba() colors
  const rgbaPattern = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/g;
  while ((match = rgbaPattern.exec(css)) !== null) {
    const hex = '#' + [match[1], match[2], match[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    colors.push(hex);
  }
  
  // Extract HSL colors
  const hslPattern = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/g;
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
  
  // Extract HSLA colors
  const hslaPattern = /hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*[\d.]+\s*\)/g;
  while ((match = hslaPattern.exec(css)) !== null) {
    const h = parseInt(match[1]) / 360, s = parseInt(match[2]) / 100, l = parseInt(match[3]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    const hex = '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    colors.push(hex);
  }
  
  // Extract CSS custom properties with color values
  const cssVarPattern = /--[\w-]+:\s*(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\))/gi;
  while ((match = cssVarPattern.exec(css)) !== null) {
    const value = match[1];
    if (value.startsWith('#')) {
      colors.push(hexFromColor(value));
    }
  }
  
  return colors;
}

function extractFontsFromHtml(html: string): string[] {
  const fonts: string[] = [];
  
  // Google Fonts - css2 format
  const googleFontsCss2Match = html.match(/fonts\.googleapis\.com\/css2\?family=([^&"']+)/);
  if (googleFontsCss2Match) {
    const familyParam = decodeURIComponent(googleFontsCss2Match[1]);
    familyParam.split('|').forEach(f => {
      const name = f.split(':')[0].replace(/\+/g, ' ');
      if (name) fonts.push(name);
    });
  }
  
  // Google Fonts - css format
  const googleFontsCssMatch = html.match(/fonts\.googleapis\.com\/css\?family=([^&"']+)/);
  if (googleFontsCssMatch) {
    const familyParam = decodeURIComponent(googleFontsCssMatch[1]);
    familyParam.split('|').forEach(f => {
      const name = f.split(':')[0].replace(/\+/g, ' ');
      if (name) fonts.push(name);
    });
  }
  
  // Adobe Fonts / Typekit
  const typekitMatch = html.match(/use\.typekit\.net\/([^"']+)/);
  if (typekitMatch) {
    fonts.push('Typekit');
  }
  
  // font-family declarations in CSS
  const fontFamilyPattern = /font-family\s*:\s*['"]?([^'";}\n]+)['"]?/gi;
  let match;
  while ((match = fontFamilyPattern.exec(html)) !== null) {
    const value = match[1];
    const families = value.split(',');
    for (const family of families) {
      const trimmed = family.trim().replace(/['"]/g, '');
      // Skip system fonts and CSS variables
      if (trimmed && !trimmed.startsWith('var(') && !trimmed.startsWith('-') && 
          !['inherit', 'initial', 'unset', 'revert'].includes(trimmed.toLowerCase()) &&
          trimmed.length > 1 && trimmed.length < 50) {
        fonts.push(trimmed);
      }
    }
  }
  
  // @font-face declarations
  const fontFacePattern = /@font-face\s*{[^}]*font-family\s*:\s*['"]?([^'";}\n]+)['"]?/gi;
  while ((match = fontFacePattern.exec(html)) !== null) {
    const family = match[1].trim().replace(/['"]/g, '');
    if (family && family.length > 1) {
      fonts.push(family);
    }
  }
  
  // Link tags with font预加载
  const fontPreloadPattern = /<link[^>]*href=["']([^"']+\.(woff2?|ttf|otf|eot))["']/gi;
  while ((match = fontPreloadPattern.exec(html)) !== null) {
    const url = match[1];
    // Extract font name from filename
    const filename = url.split('/').pop()?.split('.')[0];
    if (filename) {
      const name = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      fonts.push(name);
    }
  }
  
  return [...new Set(fonts)].slice(0, 10);
}

function extractLogos(html: string, baseUrl: string): LogoInfo[] {
  const logos: LogoInfo[] = [];
  const seenUrls = new Set<string>();
  
  const addLogo = (url: string, type: string, confidence: 'high' | 'medium' | 'low', location: string) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      logos.push({ url, type, confidence, location });
    }
  };
  
  // Favicon / icon
  const iconPatterns = [
    /<link[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']+)["']/gi,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut\s+)?icon["']/gi,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/gi,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/gi,
  ];
  for (const pattern of iconPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = baseUrl + url;
      else if (!url.startsWith('http')) url = baseUrl + '/' + url;
      addLogo(url, 'favicon', 'high', 'head');
    }
  }
  
  // Open Graph image
  const ogPatterns = [
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/gi,
    /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/gi,
  ];
  for (const pattern of ogPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = baseUrl + url;
      else if (!url.startsWith('http')) url = baseUrl + '/' + url;
      addLogo(url, 'social-image', 'medium', 'meta');
    }
  }
  
  // Images with logo/brand in attributes
  const logoImgPatterns = [
    // alt, title, class, id containing logo/brand
    /<img[^>]*(?:alt|title|class|id)=["'][^"']*(?:logo|brand|header-logo|site-logo|main-logo)[^"']*["'][^>]*src=["']([^"']+)["']/gi,
    /<img[^>]*src=["']([^"']+)["'][^>]*(?:alt|title|class|id)=["'][^"']*(?:logo|brand|header-logo|site-logo|main-logo)[^"']*["']/gi,
    // src containing logo/brand
    /<img[^>]*src=["']([^"']*(?:logo|brand)[^"']*)["']/gi,
  ];
  for (const pattern of logoImgPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = baseUrl + url;
      else if (!url.startsWith('http')) url = baseUrl + '/' + url;
      addLogo(url, 'logo', 'high', 'img');
    }
  }
  
  // SVG logos (inline)
  const svgLogoPattern = /<svg[^>]*(?:class|id|aria-label|role)=["'][^"']*(?:logo|brand|icon)[^"']*["'][^>]*>/gi;
  if (svgLogoPattern.test(html)) {
    // Found SVG logo indicator
    addLogo('inline-svg-logo', 'svg', 'medium', 'inline');
  }
  
  // Header/nav images
  const headerPatterns = [
    /<header[^>]*>([\s\S]*?)<\/header>/gi,
    /<nav[^>]*>([\s\S]*?)<\/nav>/gi,
  ];
  for (const pattern of headerPatterns) {
    const headerMatch = pattern.exec(html);
    if (headerMatch) {
      const imgPattern = /<img[^>]*src=["']([^"']+)["']/gi;
      let match;
      while ((match = imgPattern.exec(headerMatch[1])) !== null) {
        let url = match[1];
        if (url.startsWith('//')) url = 'https:' + url;
        else if (url.startsWith('/')) url = baseUrl + url;
        else if (!url.startsWith('http')) url = baseUrl + '/' + url;
        addLogo(url, 'header-image', 'low', 'header');
      }
    }
  }
  
  // Any remaining images in the page that could be logos (small images in top section)
  const allImgPattern = /<img[^>]*src=["']([^"']+)["'][^>]*(?:width|height)=["'](?:1[0-9]{2}|[2-9][0-9]{2})["']/gi;
  let match;
  while ((match = allImgPattern.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('//')) url = 'https:' + url;
    else if (url.startsWith('/')) url = baseUrl + url;
    else if (!url.startsWith('http')) url = baseUrl + '/' + url;
    // Skip common non-logo images
    if (!url.match(/\.(gif|mp4|webm|ogg)/i)) {
      addLogo(url, 'possible-logo', 'low', 'body');
    }
  }
  
  return logos;
}

function extractSpacing(html: string): string[] {
  const spacingPattern = /(?:margin|padding|gap|row-gap|column-gap)\s*:\s*(\d+(?:px|rem|em|pt))/gi;
  const values: string[] = [];
  let match;
  while ((match = spacingPattern.exec(html)) !== null) {
    const val = match[1];
    // Filter out 0 values
    if (val !== '0px' && val !== '0rem' && val !== '0em') {
      values.push(val);
    }
  }
  
  // Also extract from shorthand properties
  const shorthandPattern = /(?:margin|padding)\s*:\s*([\d.]+(?:px|rem|em|pt)(?:\s+[\d.]+(?:px|rem|em|pt)){0,3})/gi;
  while ((match = shorthandPattern.exec(html)) !== null) {
    const parts = match[1].split(/\s+/);
    for (const part of parts) {
      if (part !== '0px' && part !== '0rem' && part !== '0em') {
        values.push(part);
      }
    }
  }
  
  // Deduplicate, sort, and take top 10
  const unique = [...new Set(values)];
  return unique.sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 10);
}

function extractBorderRadius(html: string): string[] {
  const radiusPattern = /border-radius\s*:\s*([\d.]+(?:px|rem|em|%)(?:\s+[\d.]+(?:px|rem|em|%)){0,3})/gi;
  const values: string[] = [];
  let match;
  while ((match = radiusPattern.exec(html)) !== null) {
    const parts = match[1].split(/\s+/);
    for (const part of parts) {
      if (part !== '0px' && part !== '0rem' && part !== '0em' && part !== '0%') {
        values.push(part);
      }
    }
  }
  
  // Extract from CSS variables
  const cssVarRadius = /--[\w-]*(?:radius|rounded)[^:]*:\s*([\d.]+(?:px|rem|em|%))/gi;
  while ((match = cssVarRadius.exec(html)) !== null) {
    values.push(match[1]);
  }
  
  const unique = [...new Set(values)];
  return unique.sort((a, b) => parseFloat(a) - parseFloat(b));
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
  const allBorderRadius = extractBorderRadius(allCss + ' ' + html);
  const borderRadius = allBorderRadius.length > 0 ? allBorderRadius[Math.floor(allBorderRadius.length / 2)] : '8px';

  // 6. Spacing
  const spacing = extractSpacing(allCss + ' ' + html);

  // 7. Shadows
  const shadowPattern = /box-shadow\s*:\s*([^;}\n]+)/g;
  const shadows: string[] = [];
  let sMatch;
  while ((sMatch = shadowPattern.exec(allCss)) !== null) {
    const value = sMatch[1].trim();
    if (value !== 'none' && value.length > 5) {
      shadows.push(value);
    }
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
