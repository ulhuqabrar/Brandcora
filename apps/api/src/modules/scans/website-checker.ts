import { prisma } from '@saas/database';
import { calculateOverallScore, getWebsiteWeights, SCORING_VERSION } from './score-engine.js';
import { validateUrl, normalizeUrl } from './url-validator.js';
import type { IssueSeverity } from '@saas/shared';

export interface WebsiteCheckResult {
  overallScore: number;
  scores: Array<{ category: string; score: number; weight: number }>;
  issues: Array<{
    category: string;
    severity: IssueSeverity;
    title: string;
    description: string;
    recommendation: string;
    metadata?: unknown;
  }>;
  pages: Array<{
    url: string;
    pageTitle: string | null;
    status: string;
  }>;
}

export async function runWebsiteCheck(
  scanId: string,
  url: string,
  brandProfileId: string,
  maxPages: number = 1
): Promise<WebsiteCheckResult> {
  await prisma.scan.update({
    where: { id: scanId },
    data: { status: 'processing', startedAt: new Date() },
  });

  try {
    const validation = validateUrl(url);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const normalizedUrl = normalizeUrl(url);

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { id: brandProfileId },
      include: { colors: true, fonts: true, logos: true, gradients: true, rules: true },
    });

    if (!brandProfile) {
      throw new Error('Brand profile not found');
    }

    const pages: Array<{ url: string; pageTitle: string | null; status: string }> = [];

    const pageResult = await analyzePage(normalizedUrl);
    pages.push({
      url: normalizedUrl,
      pageTitle: pageResult.title,
      status: 'completed',
    });

    await prisma.scanPage.create({
      data: {
        scanId,
        url: normalizedUrl,
        pageTitle: pageResult.title,
        status: 'completed',
      },
    });

    const brandColors = brandProfile.colors.map(c => c.hexValue);
    const brandFonts = brandProfile.fonts.map(f => f.family);
    const brandGradients = (brandProfile.gradients || []).map(g => ({
      type: g.gradientType,
      angle: g.angle,
      stops: g.stops as Array<{ colorHex: string; alpha: number; position: string }>,
      normalizedValue: g.normalizedValue,
      role: g.role,
    }));

    const colorCheck = checkColorConsistency(pageResult.colors, brandColors);
    const typographyCheck = checkTypography(pageResult.fonts, brandFonts);
    const logoCheck = checkLogoUsage(pageResult.hasLogo, brandProfile.logos.length > 0);
    const componentCheck = checkComponents(pageResult.buttons, brandProfile);
    const layoutCheck = checkLayout(pageResult);
    const accessibilityCheck = checkAccessibility(pageResult);
    const responsivenessCheck = checkResponsiveness(pageResult);
    const gradientCheck = checkGradientConsistency(pageResult.gradients, brandGradients);

    const scores = [
      { category: 'colors', score: colorCheck.score, weight: getWebsiteWeights().colors },
      { category: 'typography', score: typographyCheck.score, weight: getWebsiteWeights().typography },
      { category: 'logo', score: logoCheck.score, weight: getWebsiteWeights().logo },
      { category: 'components', score: componentCheck.score, weight: getWebsiteWeights().components },
      { category: 'gradients', score: gradientCheck.score, weight: 0.10 },
      { category: 'layout', score: layoutCheck.score, weight: getWebsiteWeights().layout },
      { category: 'accessibility', score: accessibilityCheck.score, weight: getWebsiteWeights().accessibility },
      { category: 'responsiveness', score: responsivenessCheck.score, weight: getWebsiteWeights().responsiveness },
    ];

    const overallScore = calculateOverallScore(scores, {
      ...getWebsiteWeights(),
      gradients: 0.10,
    });

    const allIssues = [
      ...colorCheck.issues.map(i => ({ ...i, category: 'colors' })),
      ...typographyCheck.issues.map(i => ({ ...i, category: 'typography' })),
      ...logoCheck.issues.map(i => ({ ...i, category: 'logo' })),
      ...componentCheck.issues.map(i => ({ ...i, category: 'components' })),
      ...gradientCheck.issues.map(i => ({ ...i, category: 'gradients' })),
      ...layoutCheck.issues.map(i => ({ ...i, category: 'layout' })),
      ...accessibilityCheck.issues.map(i => ({ ...i, category: 'accessibility' })),
      ...responsivenessCheck.issues.map(i => ({ ...i, category: 'responsiveness' })),
    ];

    await prisma.scanScore.createMany({
      data: scores.map(s => ({ scanId, ...s })),
    });

    if (allIssues.length > 0) {
      await prisma.scanIssue.createMany({
        data: allIssues.map(i => ({
          scanId,
          category: i.category,
          severity: i.severity,
          title: i.title,
          description: i.description,
          recommendation: i.recommendation,
        })),
      });
    }

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        overallScore,
        scoringVersion: SCORING_VERSION,
        completedAt: new Date(),
      },
    });

    return { overallScore, scores, issues: allIssues, pages };
  } catch (error: any) {
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorCode: 'SCAN_FAILED',
        errorMessage: error.message,
      },
    });
    throw error;
  }
}

interface PageAnalysis {
  title: string | null;
  colors: string[];
  fonts: string[];
  hasLogo: boolean;
  buttons: Array<{ text: string; bgColor: string; textColor: string; borderRadius: number }>;
  gradients: Array<{
    type: string;
    angle: number | null;
    stops: Array<{ colorHex: string; alpha: number; position: string }>;
    originalValue: string;
  }>;
  images: number;
  links: number;
  hasNav: boolean;
  hasFooter: boolean;
  textContent: string;
}

async function analyzePage(url: string): Promise<PageAnalysis> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'BrandGuard/1.0 (brand-consistency-checker)',
    },
    signal: AbortSignal.timeout(15000),
  });

  const html = await response.text();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const colors = extractColorsFromHtml(html);
  const fonts = extractFontsFromHtml(html);
  const buttons = extractButtonsFromHtml(html);
  const gradients = extractGradientsFromHtml(html);
  const hasLogo = /logo|brand/i.test(html);
  const images = (html.match(/<img/gi) || []).length;
  const links = (html.match(/<a\s/gi) || []).length;
  const hasNav = /<nav/i.test(html);
  const hasFooter = /<footer/i.test(html);
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    title,
    colors,
    fonts,
    hasLogo,
    buttons,
    gradients,
    images,
    links,
    hasNav,
    hasFooter,
    textContent,
  };
}

function extractColorsFromHtml(html: string): string[] {
  const colors: string[] = [];

  const hexMatches = html.match(/#[0-9A-Fa-f]{6}\b/g) || [];
  colors.push(...hexMatches.map(c => c.toLowerCase()));

  const rgbMatches = html.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g) || [];
  for (const match of rgbMatches) {
    const nums = match.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const hex = `#${parseInt(nums[0]).toString(16).padStart(2, '0')}${parseInt(nums[1]).toString(16).padStart(2, '0')}${parseInt(nums[2]).toString(16).padStart(2, '0')}`;
      colors.push(hex);
    }
  }

  return [...new Set(colors)].slice(0, 20);
}

function extractFontsFromHtml(html: string): string[] {
  const fonts: string[] = [];

  const fontFamilyMatches = html.match(/font-family:\s*([^;]+)/gi) || [];
  for (const match of fontFamilyMatches) {
    const value = match.replace(/font-family:\s*/i, '').trim();
    const families = value.split(',').map(f => f.trim().replace(/['"]/g, ''));
    fonts.push(...families);
  }

  const linkFonts = html.match(/family=([^&"]+)/g) || [];
  for (const match of linkFonts) {
    const family = match.replace('family=', '').split(':')[0].replace(/\+/g, ' ');
    fonts.push(family);
  }

  return [...new Set(fonts)].slice(0, 10);
}

function extractButtonsFromHtml(html: string): Array<{ text: string; bgColor: string; textColor: string; borderRadius: number }> {
  const buttons: Array<{ text: string; bgColor: string; textColor: string; borderRadius: number }> = [];

  const buttonPattern = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  let match;
  while ((match = buttonPattern.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) {
      buttons.push({
        text: text.substring(0, 50),
        bgColor: '#000000',
        textColor: '#ffffff',
        borderRadius: 4,
      });
    }
  }

  return buttons.slice(0, 10);
}

function checkColorConsistency(
  extractedColors: string[],
  brandColors: string[]
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  if (brandColors.length === 0) {
    return { score: 100, issues: [] };
  }

  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];
  let offBrandCount = 0;

  for (const color of extractedColors.slice(0, 10)) {
    const isBrandColor = brandColors.some(bc => bc.toLowerCase() === color.toLowerCase());
    if (!isBrandColor && !isNeutralColor(color)) {
      offBrandCount++;
    }
  }

  if (offBrandCount > 3) {
    issues.push({
      severity: 'warning',
      title: 'Multiple off-brand colors detected',
      description: `Found ${offBrandCount} colors not in your brand palette.`,
      recommendation: 'Review page colors and update to match your brand guidelines.',
    });
  }

  const deduction = offBrandCount * 3;
  return { score: Math.max(0, 100 - deduction), issues };
}

function isNeutralColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 30 && max > 200;
}

function checkTypography(
  pageFonts: string[],
  brandFonts: string[]
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];

  if (brandFonts.length === 0) {
    return { score: 100, issues: [] };
  }

  const matchedFonts = pageFonts.filter(pf =>
    brandFonts.some(bf => pf.toLowerCase().includes(bf.toLowerCase()))
  );

  if (matchedFonts.length === 0 && pageFonts.length > 0) {
    issues.push({
      severity: 'major',
      title: 'No brand fonts detected',
      description: `Page uses fonts (${pageFonts.join(', ')}) but none match your brand fonts.`,
      recommendation: `Update to use your brand fonts: ${brandFonts.join(', ')}.`,
    });
    return { score: 40, issues };
  }

  if (pageFonts.length > 3) {
    issues.push({
      severity: 'warning',
      title: 'Excessive font variation',
      description: `Page uses ${pageFonts.length} different fonts.`,
      recommendation: 'Limit to 2-3 fonts for consistency.',
    });
    return { score: 70, issues };
  }

  return { score: 90, issues };
}

function checkLogoUsage(
  pageHasLogo: boolean,
  brandHasLogo: boolean
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];

  if (brandHasLogo && !pageHasLogo) {
    issues.push({
      severity: 'major',
      title: 'No logo detected on page',
      description: 'Your brand has a logo but it was not detected on this page.',
      recommendation: 'Add your brand logo to the header or footer.',
    });
    return { score: 40, issues };
  }

  return { score: 85, issues };
}

function checkComponents(
  buttons: Array<{ text: string; bgColor: string; textColor: string; borderRadius: number }>,
  brandProfile: any
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];

  if (buttons.length === 0) {
    return { score: 70, issues: [] };
  }

  return { score: 80, issues };
}

function checkLayout(page: PageAnalysis): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];

  if (!page.hasNav) {
    issues.push({
      severity: 'recommendation',
      title: 'No navigation detected',
      description: 'The page does not appear to have a navigation element.',
      recommendation: 'Add a clear navigation structure.',
    });
  }

  return { score: issues.length === 0 ? 90 : 75, issues };
}

function checkAccessibility(page: PageAnalysis): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];

  if (page.images > 0) {
    issues.push({
      severity: 'recommendation',
      title: 'Verify image alt text',
      description: `Page has ${page.images} images. Ensure they have descriptive alt text.`,
      recommendation: 'Add alt attributes to all images for accessibility.',
    });
  }

  return { score: 75, issues };
}

function checkResponsiveness(page: PageAnalysis): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  return {
    score: 70,
    issues: [{
      severity: 'recommendation',
      title: 'Manual responsive testing recommended',
      description: 'Automated checks cannot fully verify mobile responsiveness.',
      recommendation: 'Test the page on multiple device sizes.',
    }],
  };
}

// ─── Gradient Extraction ─────────────────────────────────────────────────────

function extractGradientsFromHtml(html: string): Array<{
  type: string;
  angle: number | null;
  stops: Array<{ colorHex: string; alpha: number; position: string }>;
  originalValue: string;
}> {
  const gradients: Array<{
    type: string;
    angle: number | null;
    stops: Array<{ colorHex: string; alpha: number; position: string }>;
    originalValue: string;
  }> = [];

  // Extract CSS from style tags
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

  // Match gradient patterns
  const gradientPattern = /(repeating-)?(linear|radial|conic)-gradient\(([^)]+)\)/gi;
  let match;
  while ((match = gradientPattern.exec(allCss)) !== null) {
    const fullMatch = match[0];
    const type = match[2].toLowerCase();
    const args = match[3];

    // Parse angle for linear gradients
    let angle: number | null = null;
    if (type === 'linear') {
      const angleMatch = args.match(/([\d.]+)deg/);
      if (angleMatch) {
        angle = parseFloat(angleMatch[1]);
      } else if (args.trim().startsWith('to ')) {
        const dirMatch = args.match(/to\s+(top|bottom|left|right|top right|bottom right|top left|bottom left)/);
        if (dirMatch) {
          const dir = dirMatch[1];
          if (dir === 'top') angle = 0;
          else if (dir === 'top right') angle = 45;
          else if (dir === 'right') angle = 90;
          else if (dir === 'bottom right') angle = 135;
          else if (dir === 'bottom') angle = 180;
          else if (dir === 'bottom left') angle = 225;
          else if (dir === 'left') angle = 270;
          else if (dir === 'top left') angle = 315;
        }
      }
    }

    // Parse color stops
    const stops: Array<{ colorHex: string; alpha: number; position: string }> = [];
    const colorPattern = /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/gi;
    let colorMatch;
    while ((colorMatch = colorPattern.exec(args)) !== null) {
      const colorStr = colorMatch[1];
      let hex = '#000000';
      let alpha = 1;

      if (colorStr.startsWith('#')) {
        hex = colorStr.length === 4
          ? '#' + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2] + colorStr[3] + colorStr[3]
          : colorStr.slice(0, 7);
        hex = hex.toUpperCase();
      } else if (colorStr.startsWith('rgb')) {
        const nums = colorStr.match(/\d+/g);
        if (nums && nums.length >= 3) {
          hex = '#' + [nums[0], nums[1], nums[2]]
            .map(n => parseInt(n).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
          if (nums.length >= 4) {
            alpha = parseFloat(nums[3]) / 255;
          }
        }
      }

      // Try to find position after color
      const posPattern = new RegExp(colorStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+([\\d.]+)%');
      const posMatch = args.match(posPattern);
      const position = posMatch ? posMatch[1] + '%' : '';

      stops.push({ colorHex: hex, alpha, position });
    }

    if (stops.length >= 2) {
      gradients.push({
        type,
        angle,
        stops,
        originalValue: fullMatch,
      });
    }
  }

  return gradients;
}

// ─── Gradient Comparison ─────────────────────────────────────────────────────

function checkGradientConsistency(
  detectedGradients: Array<{
    type: string;
    angle: number | null;
    stops: Array<{ colorHex: string; alpha: number; position: string }>;
    originalValue: string;
  }>,
  brandGradients: Array<{
    type: string;
    angle: number | null;
    stops: Array<{ colorHex: string; alpha: number; position: string }>;
    normalizedValue: string;
    role: string;
  }>
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];

  if (brandGradients.length === 0) {
    return { score: 100, issues: [] };
  }

  if (detectedGradients.length === 0) {
    issues.push({
      severity: 'recommendation',
      title: 'No gradients detected on page',
      description: 'The brand defines gradients but none were found on this page.',
      recommendation: 'Consider using brand gradients for visual consistency.',
    });
    return { score: 80, issues };
  }

  let offBrandCount = 0;

  for (const detected of detectedGradients) {
    // Find closest matching brand gradient
    let bestMatch: typeof brandGradients[0] | null = null;
    let bestScore = 0;

    for (const brand of brandGradients) {
      const similarity = calculateGradientSimilarity(detected, brand);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = brand;
      }
    }

    if (bestMatch && bestScore < 0.7) {
      offBrandCount++;
      const severity: IssueSeverity = bestScore < 0.4 ? 'critical' : bestScore < 0.55 ? 'major' : 'warning';

      issues.push({
        severity,
        title: `Off-brand gradient detected`,
        description: `Detected gradient differs from the approved ${bestMatch.role || 'brand'} gradient (similarity: ${Math.round(bestScore * 100)}%).`,
        recommendation: `Replace with the approved gradient: ${bestMatch.normalizedValue}`,
      });
    } else if (!bestMatch) {
      offBrandCount++;
      issues.push({
        severity: 'warning',
        title: 'Unrecognized gradient detected',
        description: 'This gradient does not match any approved brand gradient.',
        recommendation: 'Review if this gradient should be added to the brand profile or replaced with an approved gradient.',
      });
    }
  }

  const deduction = offBrandCount * 8;
  const score = Math.max(0, 100 - deduction);

  return { score, issues };
}

function colorDistance(c1: string, c2: string): number {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function calculateGradientSimilarity(
  detected: {
    type: string;
    angle: number | null;
    stops: Array<{ colorHex: string; alpha: number; position: string }>;
  },
  brand: {
    type: string;
    angle: number | null;
    stops: Array<{ colorHex: string; alpha: number; position: string }>;
  }
): number {
  // Type match
  if (detected.type !== brand.type) return 0;

  // Stop count difference
  const maxStops = Math.max(detected.stops.length, brand.stops.length);
  if (maxStops === 0) return 0;

  // Color similarity (45%)
  let colorScore = 0;
  for (let i = 0; i < Math.min(detected.stops.length, brand.stops.length); i++) {
    const dist = colorDistance(detected.stops[i].colorHex, brand.stops[i].colorHex);
    colorScore += Math.max(0, 1 - dist / 441.67);
  }
  colorScore = colorScore / Math.min(detected.stops.length, brand.stops.length);

  // Position similarity (20%)
  let positionScore = 0;
  for (let i = 0; i < Math.min(detected.stops.length, brand.stops.length); i++) {
    const detPos = parseFloat(detected.stops[i].position) || 0;
    const brandPos = parseFloat(brand.stops[i].position) || 0;
    positionScore += Math.max(0, 1 - Math.abs(detPos - brandPos) / 100);
  }
  positionScore = positionScore / Math.min(detected.stops.length, brand.stops.length);

  // Angle similarity (15%)
  let angleScore = 1;
  if (detected.angle !== null && brand.angle !== null) {
    const angleDiff = Math.abs(detected.angle - brand.angle);
    const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
    angleScore = normalizedDiff <= 3 ? 1 : Math.max(0, 1 - normalizedDiff / 180);
  }

  // Stop count similarity (10%)
  const countScore = detected.stops.length === brand.stops.length
    ? 1
    : Math.max(0, 1 - Math.abs(detected.stops.length - brand.stops.length) / maxStops);

  // Opacity similarity (10%)
  let opacityScore = 1;
  for (let i = 0; i < Math.min(detected.stops.length, brand.stops.length); i++) {
    opacityScore *= 1 - Math.abs(detected.stops[i].alpha - brand.stops[i].alpha);
  }

  return (
    colorScore * 0.45 +
    positionScore * 0.20 +
    angleScore * 0.15 +
    countScore * 0.10 +
    opacityScore * 0.10
  );
}
