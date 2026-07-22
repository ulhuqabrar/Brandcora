import {
  SOCIAL_WEIGHTS,
  WEBSITE_WEIGHTS,
  SEVERITY_DEDUCTIONS,
  SCORING_VERSION,
} from '@saas/shared';
import type { IssueSeverity } from '@saas/shared';

export interface ScoreCategory {
  category: string;
  score: number;
  weight: number;
}

export interface ScoreResult {
  overallScore: number;
  scoringVersion: string;
  categories: ScoreCategory[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;

  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function findClosestBrandColor(
  targetHex: string,
  brandColors: string[]
): { hex: string; distance: number } | null {
  if (brandColors.length === 0) return null;

  let closest = brandColors[0];
  let minDistance = colorDistance(targetHex, brandColors[0]);

  for (let i = 1; i < brandColors.length; i++) {
    const distance = colorDistance(targetHex, brandColors[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closest = brandColors[i];
    }
  }

  return { hex: closest, distance: minDistance };
}

export function checkColorConsistency(
  extractedColors: string[],
  brandColors: string[],
  tolerance: number = 80
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  if (brandColors.length === 0) {
    return { score: 100, issues: [] };
  }

  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];
  let offBrandCount = 0;

  for (const color of extractedColors) {
    const match = findClosestBrandColor(color, brandColors);
    if (match && match.distance > tolerance) {
      offBrandCount++;
      issues.push({
        severity: match.distance > 150 ? 'critical' : 'warning',
        title: `Off-brand color detected: ${color}`,
        description: `This color (${color}) is ${Math.round(match.distance)} units away from the nearest brand color (${match.hex}).`,
        recommendation: `Consider using ${match.hex} instead.`,
      });
    }
  }

  const deduction = offBrandCount * 5;
  const score = Math.max(0, 100 - deduction);

  return { score, issues };
}

export function checkDimensionCompliance(
  width: number,
  height: number,
  expectedWidth: number,
  expectedHeight: number
): { score: number; issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> } {
  const issues: Array<{ severity: IssueSeverity; title: string; description: string; recommendation: string }> = [];
  const tolerance = 0.1;

  const widthRatio = Math.abs(width - expectedWidth) / expectedWidth;
  const heightRatio = Math.abs(height - expectedHeight) / expectedHeight;

  if (widthRatio > tolerance) {
    issues.push({
      severity: 'major',
      title: 'Incorrect width',
      description: `Image width is ${width}px, expected ${expectedWidth}px.`,
      recommendation: `Resize to ${expectedWidth}x${expectedHeight} pixels.`,
    });
  }

  if (heightRatio > tolerance) {
    issues.push({
      severity: 'major',
      title: 'Incorrect height',
      description: `Image height is ${height}px, expected ${expectedHeight}px.`,
      recommendation: `Resize to ${expectedWidth}x${expectedHeight} pixels.`,
    });
  }

  const score = issues.length === 0 ? 100 : issues.some(i => i.severity === 'critical') ? 40 : 60;

  return { score, issues };
}

export function calculateOverallScore(
  categories: ScoreCategory[],
  weights: Record<string, number>
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const cat of categories) {
    const weight = weights[cat.category] || 0;
    weightedSum += cat.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

export function getSocialWeights() {
  return SOCIAL_WEIGHTS;
}

export function getWebsiteWeights() {
  return WEBSITE_WEIGHTS;
}

export { SCORING_VERSION };
