import { Router } from 'express';
import {
  parseGradient,
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
  type GradientExtraction,
} from './gradient-parser.js';

const router = Router();

interface ColorInfo {
  hex: string;
  role: string;
  confidence: 'high' | 'medium' | 'low';
  count: number;
}

interface FontInfo {
  family: string;
  role: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
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

interface ExtractedBrand {
  brandName: string;
  websiteUrl: string;
  logos: LogoInfo[];
  colors: ColorInfo[];
  fonts: FontInfo[];
  gradients: GradientInfo[];
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

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const adjust = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
}

function isLight(hex: string): boolean {
  return luminance(hex) > 0.5;
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

function extractButtonStyles(html: string): { primary: any; secondary: any } {
  const defaultPrimary = { bg: '#35378F', text: '#FFFFFF', radius: '8px', padding: '12px 24px', confidence: 'low' };
  const defaultSecondary = { bg: 'transparent', text: '#35378F', radius: '8px', padding: '12px 24px', confidence: 'low' };

  const btnPattern = /<button[^>]*class=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = btnPattern.exec(html)) !== null) {
    const classes = match[1];
    if (classes.includes('primary') || classes.includes('btn-primary') || classes.includes('cta')) {
      defaultPrimary.confidence = 'medium';
    }
  }
  return { primary: defaultPrimary, secondary: defaultSecondary };
}

function extractSpacing(html: string): string[] {
  const spacingPattern = /(?:margin|padding|gap)\s*:\s*(\d+(?:px|rem|em))/g;
  const values: string[] = [];
  let match;
  while ((match = spacingPattern.exec(html)) !== null) {
    values.push(match[1]);
  }
  const unique = [...new Set(values)].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    return numA - numB;
  });
  return unique.slice(0, 8);
}

function generateVisualStyle(colors: string[], fonts: string[], borderRadius: string): string {
  const parts: string[] = [];
  const hasDarkBg = colors.some(c => !isLight(c));
  const hasBrightAccent = colors.some(c => {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return (r > 100 || g > 100 || b > 200) && isLight(c);
  });
  if (hasDarkBg) parts.push('dark-themed');
  else parts.push('light-themed');
  if (hasBrightAccent) parts.push('vibrant accents');
  if (fonts.some(f => f.toLowerCase().includes('sans'))) parts.push('clean sans-serif typography');
  if (parseFloat(borderRadius) > 12) parts.push('soft rounded components');
  else if (parseFloat(borderRadius) > 6) parts.push('moderately rounded components');
  else parts.push('sharp or minimal border radius');
  parts.push('structured layout');
  return parts.join(', ') + '.';
}

// POST /api/v1/brand-extract
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, error: 'URL is required' });
      return;
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      res.status(400).json({ success: false, error: 'Invalid URL format' });
      return;
    }

    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Fetch the website
    let html: string;
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });
      html = await response.text();
    } catch (err: any) {
      res.status(400).json({ success: false, error: `Failed to fetch website: ${err.message}` });
      return;
    }

    // Extract all CSS from style tags
    let allCss = '';
    const styleTagPattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;
    while ((styleMatch = styleTagPattern.exec(html)) !== null) {
      allCss += styleMatch[1] + '\n';
    }

    // Extract inline styles
    const inlineStylePattern = /style=["']([^"']+)["']/g;
    while ((styleMatch = inlineStylePattern.exec(html)) !== null) {
      allCss += styleMatch[1] + '\n';
    }

    // 1. Extract colors
    const rawColors = extractColorsFromCss(allCss + ' ' + html);
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
      .slice(0, 12)
      .map(([hex, count]) => ({ hex, count }));

    const colorRoles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'border', 'success', 'warning', 'error', 'muted', 'highlight'];
    const colors: ColorInfo[] = sortedColors.map((c, i) => {
      const role = i < colorRoles.length ? colorRoles[i] : 'extra';
      const confidence: 'high' | 'medium' | 'low' = i < 3 ? 'high' : i < 6 ? 'medium' : 'low';
      return { hex: c.hex, role, confidence, count: c.count };
    });

    // 2. Extract fonts
    const rawFonts = extractFontsFromHtml(html);
    const fonts: FontInfo[] = rawFonts.slice(0, 6).map((f, i) => ({
      family: f,
      role: i === 0 ? 'heading' : i === 1 ? 'body' : 'accent',
      confidence: i < 2 ? 'high' : 'medium',
      source: 'css',
    }));

    // 3. Extract logos
    const logos = extractLogos(html, baseUrl);

    // 4. Extract brand name
    let brandName = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) brandName = titleMatch[1].split(/[-|–—]/)[0].trim();
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    if (ogSiteMatch) brandName = ogSiteMatch[1];
    const metaTitleMatch = html.match(/<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["']/i);
    if (metaTitleMatch) brandName = metaTitleMatch[1];
    if (!brandName) brandName = parsedUrl.hostname.replace('www.', '');

    // 5. Extract border radius
    const radiusPattern = /border-radius\s*:\s*(\d+(?:px|rem|em|%))/g;
    const radii: string[] = [];
    let rMatch;
    while ((rMatch = radiusPattern.exec(allCss)) !== null) {
      radii.push(rMatch[1]);
    }
    const borderRadius = radii.length > 0 ? radii.sort()[Math.floor(radii.length / 2)] : '8px';

    // 6. Extract spacing
    const spacingValues = extractSpacing(allCss);

    // 7. Extract shadows
    const shadowPattern = /box-shadow\s*:\s*([^;]+)/g;
    const shadows: string[] = [];
    let sMatch;
    while ((sMatch = shadowPattern.exec(allCss)) !== null) {
      shadows.push(sMatch[1].trim());
    }

    // 8. Extract container widths
    const containerPattern = /max-width\s*:\s*(\d+(?:px|rem|em))/g;
    const containers: string[] = [];
    let cMatch;
    while ((cMatch = containerPattern.exec(allCss)) !== null) {
      containers.push(cMatch[1]);
    }

    // 9. Button styles
    const buttonStyles = extractButtonStyles(html);

    // 10. Determine icon and image styles
    const hasSvgIcons = html.includes('<svg');
    const iconStyle = hasSvgIcons ? 'SVG inline icons' : 'Icon font or image icons';

    const imgPattern = /<img[^>]*src=["'][^"']+["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
    let imgCount = 0;
    let hasPeople = false;
    let hasProduct = false;
    let imgMatch;
    while ((imgMatch = imgPattern.exec(html)) !== null) {
      imgCount++;
      const alt = (imgMatch[1] || '').toLowerCase();
      if (alt.includes('person') || alt.includes('team') || alt.includes('people') || alt.includes('avatar')) hasPeople = true;
      if (alt.includes('product') || alt.includes('screenshot') || alt.includes('app')) hasProduct = true;
    }
    let imageStyle = 'Minimal imagery';
    if (hasPeople) imageStyle = 'People-focused photography';
    else if (hasProduct) imageStyle = 'Product screenshots and UI demos';
    else if (imgCount > 5) imageStyle = 'Rich photography and illustrations';

    // 11. Extract gradients
    const extractedGradients: GradientInfo[] = [];

    // Extract from CSS variables
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

    // Extract from CSS properties
    const cssGradients = extractGradientsFromCss(allCss);
    for (const { value, gradient, context } of cssGradients) {
      if (gradient) {
        const role = classifyGradientRole(gradient, { selector: context });
        const confidence = calculateGradientConfidence(gradient, {
          source: 'stylesheet',
          hasVariableResolution: false,
          stopCount: gradient.stops.length,
        });

        // Check if this gradient is already captured from CSS variables
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

    // Extract SVG gradients
    const svgGradients = extractSvgGradients(html);
    for (const svgGrad of svgGradients) {
      // Convert SVG gradient to our format
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

    // Re-map deduplicated gradients back to GradientInfo format
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

    const brand: ExtractedBrand = {
      brandName,
      websiteUrl: normalizedUrl,
      logos,
      colors,
      fonts,
      gradients,
      buttonStyles,
      spacing: { scale: spacingValues.length > 0 ? spacingValues : ['4px', '8px', '12px', '16px', '24px', '32px'], confidence: spacingValues.length > 3 ? 'medium' : 'low' },
      borderRadius,
      shadows: shadows.slice(0, 4),
      containerWidths: [...new Set(containers)].slice(0, 3),
      visualStyle: generateVisualStyle(colors.map(c => c.hex), fonts.map(f => f.family), borderRadius),
      iconStyle,
      imageStyle,
    };

    res.json({ success: true, data: brand });
  } catch (error: any) {
    console.error('Brand extraction error:', error);
    res.status(500).json({ success: false, error: error.message || 'Extraction failed' });
  }
});

export { router as brandExtractRoutes };
