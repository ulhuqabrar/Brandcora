import { describe, it, expect } from 'vitest';
import {
  parseGradient,
  extractGradientsFromCss,
  extractGradientsFromCssVariables,
  extractSvgGradients,
  deduplicateGradients,
  gradientSimilarity,
  classifyGradientRole,
  calculateGradientConfidence,
  type ParsedGradient,
} from '../gradient-parser.js';

describe('Gradient Parser', () => {
  describe('parseGradient', () => {
    it('should parse a basic linear gradient', () => {
      const result = parseGradient('linear-gradient(135deg, #FF5F45 0%, #FF8A5B 48%, #F2B84B 100%)');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('linear');
      expect(result!.repeating).toBe(false);
      expect(result!.angle).toBe(135);
      expect(result!.stops).toHaveLength(3);
      expect(result!.stops[0].colorHex).toBe('#FF5F45');
      expect(result!.stops[0].position).toBe('0%');
      expect(result!.stops[1].colorHex).toBe('#FF8A5B');
      expect(result!.stops[1].position).toBe('48%');
      expect(result!.stops[2].colorHex).toBe('#F2B84B');
      expect(result!.stops[2].position).toBe('100%');
    });

    it('should parse a linear gradient with named direction', () => {
      const result = parseGradient('linear-gradient(to right, #000000, #FFFFFF)');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('linear');
      expect(result!.angle).toBe(90);
      expect(result!.stops).toHaveLength(2);
    });

    it('should parse a radial gradient', () => {
      const result = parseGradient('radial-gradient(circle, #FF0000 0%, #0000FF 100%)');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('radial');
      expect(result!.shape).toBe('circle');
      expect(result!.stops).toHaveLength(2);
    });

    it('should parse a conic gradient', () => {
      const result = parseGradient('conic-gradient(from 0deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('conic');
      expect(result!.angle).toBe(0);
      // Parser detects all colors including the repeated first color
      expect(result!.stops.length).toBeGreaterThanOrEqual(7);
    });

    it('should parse a repeating linear gradient', () => {
      const result = parseGradient('repeating-linear-gradient(45deg, #FF0000 0px, #FF0000 10px, #0000FF 10px, #0000FF 20px)');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('linear');
      expect(result!.repeating).toBe(true);
      expect(result!.angle).toBe(45);
      expect(result!.stops).toHaveLength(4);
    });

    it('should handle gradients with rgba colors', () => {
      const result = parseGradient('linear-gradient(135deg, rgba(255, 95, 69, 1) 0%, rgba(255, 138, 91, 0.92) 48%, rgba(242, 184, 75, 1) 100%)');

      expect(result).not.toBeNull();
      expect(result!.stops[0].alpha).toBe(1);
      expect(result!.stops[1].alpha).toBeCloseTo(0.92, 2);
      expect(result!.stops[2].alpha).toBe(1);
    });

    it('should handle gradients with hsl colors', () => {
      const result = parseGradient('linear-gradient(to bottom, hsl(0, 100%, 50%), hsl(120, 100%, 50%))');

      expect(result).not.toBeNull();
      expect(result!.stops).toHaveLength(2);
      expect(result!.stops[0].colorHex).toBe('#FF0000');
      expect(result!.stops[1].colorHex).toBe('#00FF00');
    });

    it('should handle gradients without explicit stop positions', () => {
      const result = parseGradient('linear-gradient(#FF0000, #00FF00, #0000FF)');

      expect(result).not.toBeNull();
      expect(result!.stops).toHaveLength(3);
      expect(result!.stops[0].positionSource).toBe('inferred');
      expect(result!.stops[1].positionSource).toBe('inferred');
      expect(result!.stops[2].positionSource).toBe('inferred');
    });

    it('should return null for non-gradient values', () => {
      expect(parseGradient('solid #FF0000')).toBeNull();
      expect(parseGradient('url(image.png)')).toBeNull();
      expect(parseGradient('red')).toBeNull();
    });

    it('should handle CSS variable references', () => {
      const css = `
        :root {
          --brand-gradient: linear-gradient(135deg, #FF5F45, #F2B84B);
        }
      `;
      const result = extractGradientsFromCssVariables(css);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('--brand-gradient');
      expect(result[0].gradient).not.toBeNull();
      expect(result[0].gradient!.stops).toHaveLength(2);
    });

    it('should resolve nested CSS variables', () => {
      const css = `
        :root {
          --start-color: #FF5F45;
          --end-color: #F2B84B;
          --brand-gradient: linear-gradient(135deg, var(--start-color), var(--end-color));
        }
      `;
      const result = extractGradientsFromCssVariables(css);

      expect(result).toHaveLength(1);
      expect(result[0].gradient).not.toBeNull();
      expect(result[0].gradient!.stops[0].colorHex).toBe('#FF5F45');
      expect(result[0].gradient!.stops[1].colorHex).toBe('#F2B84B');
    });
  });

  describe('extractGradientsFromCss', () => {
    it('should extract gradients from background properties', () => {
      const css = `
        .hero {
          background: linear-gradient(135deg, #FF5F45 0%, #F2B84B 100%);
        }
        .button {
          background-image: linear-gradient(to right, #000000, #333333);
        }
      `;
      const result = extractGradientsFromCss(css);

      expect(result).toHaveLength(2);
      expect(result[0].context).toBe('background');
      expect(result[1].context).toBe('background-image');
    });

    it('should handle multiple layered gradients', () => {
      const css = `
        .hero {
          background:
            linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
            linear-gradient(135deg, #FF5F45, #F2B84B);
        }
      `;
      const result = extractGradientsFromCss(css);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should extract gradients from mask-image', () => {
      const css = `
        .overlay {
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
      `;
      const result = extractGradientsFromCss(css);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('extractSvgGradients', () => {
    it('should extract linear gradients from SVG', () => {
      const html = `
        <svg>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FF0000" />
            <stop offset="100%" stop-color="#0000FF" />
          </linearGradient>
        </svg>
      `;
      const result = extractSvgGradients(html);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('grad1');
      expect(result[0].type).toBe('linear');
      expect(result[0].stops).toHaveLength(2);
      expect(result[0].x1).toBe('0%');
      expect(result[0].x2).toBe('100%');
    });

    it('should extract radial gradients from SVG', () => {
      const html = `
        <svg>
          <radialGradient id="radGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
        </svg>
      `;
      const result = extractSvgGradients(html);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('radGrad');
      expect(result[0].type).toBe('radial');
      expect(result[0].cx).toBe('50%');
      expect(result[0].cy).toBe('50%');
      expect(result[0].r).toBe('50%');
    });

    it('should handle SVG gradients with gradientUnits', () => {
      const html = `
        <svg>
          <linearGradient id="userGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stop-color="#FF0000" />
            <stop offset="100%" stop-color="#00FF00" />
          </linearGradient>
        </svg>
      `;
      const result = extractSvgGradients(html);

      expect(result).toHaveLength(1);
      expect(result[0].gradientUnits).toBe('userSpaceOnUse');
    });
  });

  describe('deduplicateGradients', () => {
    it('should remove exact duplicate gradients', () => {
      const gradients: ParsedGradient[] = [
        {
          type: 'linear',
          repeating: false,
          angle: 135,
          shape: null,
          position: null,
          stops: [
            { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
            { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
          ],
          originalValue: 'linear-gradient(135deg, #FF0000, #0000FF)',
          normalizedValue: 'linear-gradient(135deg, #FF0000, #0000FF)',
          confidence: 0.9,
        },
        {
          type: 'linear',
          repeating: false,
          angle: 135,
          shape: null,
          position: null,
          stops: [
            { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
            { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
          ],
          originalValue: 'linear-gradient(135deg, #FF0000, #0000FF)',
          normalizedValue: 'linear-gradient(135deg, #FF0000, #0000FF)',
          confidence: 0.9,
        },
      ];

      const result = deduplicateGradients(gradients);
      expect(result).toHaveLength(1);
    });

    it('should keep gradients with different stops', () => {
      const gradients: ParsedGradient[] = [
        {
          type: 'linear',
          repeating: false,
          angle: 135,
          shape: null,
          position: null,
          stops: [
            { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
            { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
          ],
          originalValue: 'linear-gradient(135deg, #FF0000, #0000FF)',
          normalizedValue: 'linear-gradient(135deg, #FF0000, #0000FF)',
          confidence: 0.9,
        },
        {
          type: 'linear',
          repeating: false,
          angle: 135,
          shape: null,
          position: null,
          stops: [
            { colorHex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#00FF00' },
            { colorHex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#FFFF00' },
          ],
          originalValue: 'linear-gradient(135deg, #00FF00, #FFFF00)',
          normalizedValue: 'linear-gradient(135deg, #00FF00, #FFFF00)',
          confidence: 0.9,
        },
      ];

      const result = deduplicateGradients(gradients);
      expect(result).toHaveLength(2);
    });

    it('should keep gradients with different angles', () => {
      const gradients: ParsedGradient[] = [
        {
          type: 'linear',
          repeating: false,
          angle: 0,
          shape: null,
          position: null,
          stops: [
            { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
            { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
          ],
          originalValue: 'linear-gradient(0deg, #FF0000, #0000FF)',
          normalizedValue: 'linear-gradient(0deg, #FF0000, #0000FF)',
          confidence: 0.9,
        },
        {
          type: 'linear',
          repeating: false,
          angle: 90,
          shape: null,
          position: null,
          stops: [
            { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
            { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
          ],
          originalValue: 'linear-gradient(90deg, #FF0000, #0000FF)',
          normalizedValue: 'linear-gradient(90deg, #FF0000, #0000FF)',
          confidence: 0.9,
        },
      ];

      const result = deduplicateGradients(gradients);
      expect(result).toHaveLength(2);
    });
  });

  describe('gradientSimilarity', () => {
    it('should return 1 for identical gradients', () => {
      const a: ParsedGradient = {
        type: 'linear',
        repeating: false,
        angle: 135,
        shape: null,
        position: null,
        stops: [
          { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
          { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
        ],
        originalValue: '',
        normalizedValue: '',
        confidence: 0.9,
      };

      expect(gradientSimilarity(a, a)).toBe(1);
    });

    it('should return 0 for different gradient types', () => {
      const a: ParsedGradient = {
        type: 'linear',
        repeating: false,
        angle: 135,
        shape: null,
        position: null,
        stops: [
          { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
          { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
        ],
        originalValue: '',
        normalizedValue: '',
        confidence: 0.9,
      };

      const b: ParsedGradient = {
        ...a,
        type: 'radial',
      };

      expect(gradientSimilarity(a, b)).toBe(0);
    });

    it('should return high score for similar gradients', () => {
      const a: ParsedGradient = {
        type: 'linear',
        repeating: false,
        angle: 135,
        shape: null,
        position: null,
        stops: [
          { colorHex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF0000' },
          { colorHex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#0000FF' },
        ],
        originalValue: '',
        normalizedValue: '',
        confidence: 0.9,
      };

      const b: ParsedGradient = {
        ...a,
        angle: 140, // Slightly different angle
        stops: [
          { colorHex: '#FF1111', rgb: { r: 255, g: 17, b: 17 }, alpha: 1, position: '0%', positionSource: 'explicit', originalColor: '#FF1111' },
          { colorHex: '#1111FF', rgb: { r: 17, g: 17, b: 255 }, alpha: 1, position: '100%', positionSource: 'explicit', originalColor: '#1111FF' },
        ],
      };

      const score = gradientSimilarity(a, b);
      expect(score).toBeGreaterThan(0.8);
    });
  });

  describe('classifyGradientRole', () => {
    it('should classify hero backgrounds', () => {
      const gradient = parseGradient('linear-gradient(135deg, #000, #333)')!;
      const role = classifyGradientRole(gradient, { isHero: true });
      expect(role).toBe('hero-background');
    });

    it('should classify button backgrounds', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #FF5555)')!;
      const role = classifyGradientRole(gradient, { isButton: true });
      expect(role).toBe('button-background');
    });

    it('should classify text gradients', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #0000FF)')!;
      const role = classifyGradientRole(gradient, { isText: true });
      expect(role).toBe('text-gradient');
    });

    it('should classify border gradients', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #0000FF)')!;
      const role = classifyGradientRole(gradient, { isBorder: true });
      expect(role).toBe('border');
    });

    it('should classify by CSS variable name', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #0000FF)')!;
      const role = classifyGradientRole(gradient, { cssVariableName: '--brand-primary-gradient' });
      expect(role).toBe('primary');
    });

    it('should classify by selector', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #0000FF)')!;
      const role = classifyGradientRole(gradient, { selector: '.hero-section' });
      expect(role).toBe('hero-background');
    });
  });

  describe('calculateGradientConfidence', () => {
    it('should give higher confidence for computed styles', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #0000FF)')!;
      const confidence = calculateGradientConfidence(gradient, {
        source: 'computed',
        hasVariableResolution: true,
        stopCount: 2,
      });

      expect(confidence).toBeGreaterThan(0.7);
    });

    it('should give lower confidence for stylesheet sources', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000, #0000FF)')!;
      const confidence = calculateGradientConfidence(gradient, {
        source: 'stylesheet',
        hasVariableResolution: false,
        stopCount: 2,
      });

      expect(confidence).toBeLessThan(0.9);
    });

    it('should penalize gradients with too few stops', () => {
      const gradient = parseGradient('linear-gradient(135deg, #FF0000)')!;
      const confidence = calculateGradientConfidence(gradient, {
        source: 'computed',
        hasVariableResolution: false,
        stopCount: 1,
      });

      expect(confidence).toBeLessThan(0.7);
    });
  });
});
