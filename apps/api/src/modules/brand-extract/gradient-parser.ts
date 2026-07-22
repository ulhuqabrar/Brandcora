/**
 * Gradient Parser for Brand Guard
 *
 * Parses CSS gradient values into structured data using css-tree.
 * Supports linear, radial, conic, and repeating gradient types.
 */

import * as csstree from 'css-tree';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GradientStop {
  colorHex: string;
  rgb: { r: number; g: number; b: number };
  alpha: number;
  position: string;
  positionSource: 'explicit' | 'inferred';
  originalColor: string;
}

export interface ParsedGradient {
  type: 'linear' | 'radial' | 'conic';
  repeating: boolean;
  angle: number | null;
  shape: string | null;
  position: string | null;
  stops: GradientStop[];
  originalValue: string;
  normalizedValue: string;
  confidence: number;
}

export interface GradientExtraction {
  gradient: ParsedGradient;
  cssVariable: string | null;
  sourceType: 'stylesheet' | 'inline' | 'computed' | 'svg';
  sourceSelector: string | null;
  sourceUrl: string | null;
  pseudoElement: string | null;
  usageCount: number;
  role: GradientRole;
  layers: ParsedGradient[];
}

export type GradientRole =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'hero-background'
  | 'cta-background'
  | 'button-background'
  | 'text-gradient'
  | 'card-background'
  | 'section-background'
  | 'decorative'
  | 'overlay'
  | 'border'
  | 'mask'
  | 'unknown';

// ─── Named Direction Mapping ─────────────────────────────────────────────────

const NAMED_DIRECTIONS: Record<string, number> = {
  'to top': 0,
  'to top right': 45,
  'to right': 90,
  'to bottom right': 135,
  'to bottom': 180,
  'to bottom left': 225,
  'to left': 270,
  'to top left': 315,
};

// ─── CSS Color Name Mapping ──────────────────────────────────────────────────

const CSS_COLOR_NAMES: Record<string, string> = {
  'aliceblue': '#F0F8FF', 'antiquewhite': '#FAEBD7', 'aqua': '#00FFFF',
  'aquamarine': '#7FFFD4', 'azure': '#F0FFFF', 'beige': '#F5F5DC',
  'bisque': '#FFE4C4', 'black': '#000000', 'blanchedalmond': '#FFEBCD',
  'blue': '#0000FF', 'blueviolet': '#8A2BE2', 'brown': '#A52A2A',
  'burlywood': '#DEB887', 'cadetblue': '#5F9EA0', 'chartreuse': '#7FFF00',
  'chocolate': '#D2691E', 'coral': '#FF7F50', 'cornflowerblue': '#6495ED',
  'cornsilk': '#FFF8DC', 'crimson': '#DC143C', 'cyan': '#00FFFF',
  'darkblue': '#00008B', 'darkcyan': '#008B8B', 'darkgoldenrod': '#B8860B',
  'darkgray': '#A9A9A9', 'darkgreen': '#006400', 'darkkhaki': '#BDB76B',
  'darkmagenta': '#8B008B', 'darkolivegreen': '#556B2F', 'darkorange': '#FF8C00',
  'darkorchid': '#9932CC', 'darkred': '#8B0000', 'darksalmon': '#E9967A',
  'darkseagreen': '#8FBC8F', 'darkslateblue': '#483D8B', 'darkslategray': '#2F4F4F',
  'darkturquoise': '#00CED1', 'darkviolet': '#9400D3', 'deeppink': '#FF1493',
  'deepskyblue': '#00BFFF', 'dimgray': '#696969', 'dodgerblue': '#1E90FF',
  'firebrick': '#B22222', 'floralwhite': '#FFFAF0', 'forestgreen': '#228B22',
  'fuchsia': '#FF00FF', 'gainsboro': '#DCDCDC', 'ghostwhite': '#F8F8FF',
  'gold': '#FFD700', 'goldenrod': '#DAA520', 'gray': '#808080',
  'green': '#008000', 'greenyellow': '#ADFF2F', 'honeydew': '#F0FFF0',
  'hotpink': '#FF69B4', 'indianred': '#CD5C5C', 'indigo': '#4B0082',
  'ivory': '#FFFFF0', 'khaki': '#F0E68C', 'lavender': '#E6E6FA',
  'lavenderblush': '#FFF0F5', 'lawngreen': '#7CFC00', 'lemonchiffon': '#FFFACD',
  'lightblue': '#ADD8E6', 'lightcoral': '#F08080', 'lightcyan': '#E0FFFF',
  'lightgoldenrodyellow': '#FAFAD2', 'lightgray': '#D3D3D3', 'lightgreen': '#90EE90',
  'lightpink': '#FFB6C1', 'lightsalmon': '#FFA07A', 'lightseagreen': '#20B2AA',
  'lightskyblue': '#87CEFA', 'lightslategray': '#778899', 'lightsteelblue': '#B0C4DE',
  'lightyellow': '#FFFFE0', 'lime': '#00FF00', 'limegreen': '#32CD32',
  'linen': '#FAF0E6', 'magenta': '#FF00FF', 'maroon': '#800000',
  'mediumaquamarine': '#66CDAA', 'mediumblue': '#0000CD', 'mediumorchid': '#BA55D3',
  'mediumpurple': '#9370DB', 'mediumseagreen': '#3CB371', 'mediumslateblue': '#7B68EE',
  'mediumspringgreen': '#00FA9A', 'mediumturquoise': '#48D1CC', 'mediumvioletred': '#C71585',
  'midnightblue': '#191970', 'mintcream': '#F5FFFA', 'mistyrose': '#FFE4E1',
  'moccasin': '#FFE4B5', 'navajowhite': '#FFDEAD', 'navy': '#000080',
  'oldlace': '#FDF5E6', 'olive': '#808000', 'olivedrab': '#6B8E23',
  'orange': '#FFA500', 'orangered': '#FF4500', 'orchid': '#DA70D6',
  'palegoldenrod': '#EEE8AA', 'palegreen': '#98FB98', 'paleturquoise': '#AFEEEE',
  'palevioletred': '#DB7093', 'papayawhip': '#FFEFD5', 'peachpuff': '#FFDAB9',
  'peru': '#CD853F', 'pink': '#FFC0CB', 'plum': '#DDA0DD',
  'powderblue': '#B0E0E6', 'purple': '#800080', 'rebeccapurple': '#663399',
  'red': '#FF0000', 'rosybrown': '#BC8F8F', 'royalblue': '#4169E1',
  'saddlebrown': '#8B4513', 'salmon': '#FA8072', 'sandybrown': '#F4A460',
  'seagreen': '#2E8B57', 'seashell': '#FFF5EE', 'sienna': '#A0522D',
  'silver': '#C0C0C0', 'skyblue': '#87CEEB', 'slateblue': '#6A5ACD',
  'slategray': '#708090', 'snow': '#FFFAFA', 'springgreen': '#00FF7F',
  'steelblue': '#4682B4', 'tan': '#D2B48C', 'teal': '#008080',
  'thistle': '#D8BFD8', 'tomato': '#FF6347', 'turquoise': '#40E0D0',
  'violet': '#EE82EE', 'wheat': '#F5DEB3', 'white': '#FFFFFF',
  'whitesmoke': '#F5F5F5', 'yellow': '#FFFF00', 'yellowgreen': '#9ACD32',
};

// ─── Color Parsing ───────────────────────────────────────────────────────────

function parseColorToHex(color: string): { hex: string; alpha: number } {
  const trimmed = color.trim().toLowerCase();

  // Named colors
  if (CSS_COLOR_NAMES[trimmed]) {
    return { hex: CSS_COLOR_NAMES[trimmed], alpha: 1 };
  }

  // transparent
  if (trimmed === 'transparent') {
    return { hex: '#000000', alpha: 0 };
  }

  // Hex colors
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 8) {
      const alpha = parseInt(hex.slice(6, 8), 16) / 255;
      return { hex: '#' + hex.slice(0, 6).toUpperCase(), alpha };
    }
    return { hex: '#' + hex.toUpperCase(), alpha: 1 };
  }

  // RGB/RGBA
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const alpha = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, alpha };
  }

  // HSL/HSLA
  const hslMatch = trimmed.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    const alpha = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, alpha };
  }

  // Fallback
  return { hex: '#000000', alpha: 1 };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// ─── Direction Normalization ─────────────────────────────────────────────────

function normalizeAngle(value: string): number | null {
  const trimmed = value.trim().toLowerCase();

  // Named directions
  if (NAMED_DIRECTIONS[trimmed] !== undefined) {
    return NAMED_DIRECTIONS[trimmed];
  }

  // Degree values
  const degMatch = trimmed.match(/^([\d.]+)deg$/);
  if (degMatch) {
    return parseFloat(degMatch[1]) % 360;
  }

  // Radian values
  const radMatch = trimmed.match(/^([\d.]+)rad$/);
  if (radMatch) {
    return Math.round((parseFloat(radMatch[1]) * 180) / Math.PI) % 360;
  }

  // Turn values
  const turnMatch = trimmed.match(/^([\d.]+)turn$/);
  if (turnMatch) {
    return Math.round(parseFloat(turnMatch[1]) * 360) % 360;
  }

  return null;
}

// ─── Gradient Parsing ────────────────────────────────────────────────────────

function extractGradientArgs(value: string): string | null {
  // Match gradient function and extract arguments
  const gradientRegex = /^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/s;
  const match = value.trim().match(gradientRegex);
  if (!match) return null;
  return match[3];
}

function parseStopsFromArgs(args: string): GradientStop[] {
  const stops: GradientStop[] = [];

  // Simple comma-separated parsing (handles most cases)
  // We need to be careful about nested parentheses
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of args) {
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }

  // Filter out direction/shape arguments (first args that don't look like colors)
  const colorParts: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    // Skip direction arguments
    if (trimmed.startsWith('to ') || trimmed === 'circle' || trimmed === 'ellipse' ||
        trimmed === 'closest-side' || trimmed === 'closest-corner' ||
        trimmed === 'farthest-side' || trimmed === 'farthest-corner' ||
        trimmed === 'at ') {
      continue;
    }
    // Skip angle arguments
    if (/^[\d.]+(deg|rad|turn)$/.test(trimmed)) {
      continue;
    }
    colorParts.push(part);
  }

  // Parse color stops
  let inferredPosition = 0;
  for (let i = 0; i < colorParts.length; i++) {
    const part = colorParts[i].trim();

    // Try to extract color and position
    // Format: "color position" or "color"
    const spaceIdx = part.lastIndexOf(' ');
    let colorStr: string;
    let positionStr: string | null = null;
    let positionSource: 'explicit' | 'inferred' = 'inferred';

    if (spaceIdx > 0) {
      const potentialColor = part.slice(0, spaceIdx).trim();
      const potentialPos = part.slice(spaceIdx + 1).trim();
      // Check if the last part looks like a position
      if (/^[\d.]+(%|px|rem|em)?$/.test(potentialPos) || potentialPos === '0') {
        colorStr = potentialColor;
        positionStr = potentialPos;
        positionSource = 'explicit';
      } else {
        colorStr = part;
      }
    } else {
      colorStr = part;
    }

    const { hex, alpha } = parseColorToHex(colorStr);
    const rgb = hexToRgb(hex);

    // Calculate inferred position if not explicit
    if (positionSource === 'inferred') {
      if (colorParts.length === 1) {
        positionStr = '0%';
      } else {
        positionStr = `${Math.round((i / (colorParts.length - 1)) * 100)}%`;
      }
    }

    stops.push({
      colorHex: hex,
      rgb,
      alpha,
      position: positionStr || '0%',
      positionSource,
      originalColor: colorStr.trim(),
    });

    // Update inferred position for next stop
    if (positionSource === 'inferred') {
      const posNum = parseInt(positionStr || '0');
      inferredPosition = posNum + Math.round(100 / colorParts.length);
    }
  }

  return stops;
}

function extractDirection(args: string): { angle: number | null; directionArg: string | null } {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of args) {
    if (char === '(') { depth++; current += char; }
    else if (char === ')') { depth--; current += char; }
    else if (char === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += char; }
  }
  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    // Handle "from Xdeg" for conic gradients
    const fromMatch = trimmed.match(/^from\s+([\d.]+(?:deg|rad|turn)?)$/);
    if (fromMatch) {
      const angle = normalizeAngle(fromMatch[1]);
      return { angle, directionArg: part.trim() };
    }
    if (trimmed.startsWith('to ') || /^[\d.]+(deg|rad|turn)$/.test(trimmed)) {
      const angle = normalizeAngle(trimmed);
      return { angle, directionArg: part.trim() };
    }
  }

  return { angle: null, directionArg: null };
}

function extractShape(args: string): { shape: string | null; position: string | null } {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of args) {
    if (char === '(') { depth++; current += char; }
    else if (char === ')') { depth--; current += char; }
    else if (char === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += char; }
  }
  if (current.trim()) parts.push(current.trim());

  let shape: string | null = null;
  let position: string | null = null;

  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    if (trimmed === 'circle' || trimmed === 'ellipse') {
      shape = trimmed;
    }
    if (trimmed.startsWith('at ') || /^(center|top|bottom|left|right)(\s+(center|top|bottom|left|right))?$/.test(trimmed)) {
      position = part.trim();
    }
  }

  return { shape, position };
}

export function parseGradient(value: string): ParsedGradient | null {
  const trimmed = value.trim().toLowerCase();

  // Check if it's a gradient
  const isRepeating = trimmed.startsWith('repeating-');
  const gradientMatch = trimmed.match(/^(repeating-)?(linear|radial|conic)-gradient\(/);
  if (!gradientMatch) return null;

  const type = gradientMatch[2] as 'linear' | 'radial' | 'conic';
  const repeating = isRepeating;

  // Extract the full arguments
  const argsStart = value.indexOf('(');
  let depth = 1;
  let argsEnd = argsStart + 1;
  while (argsEnd < value.length && depth > 0) {
    if (value[argsEnd] === '(') depth++;
    if (value[argsEnd] === ')') depth--;
    argsEnd++;
  }
  const args = value.slice(argsStart + 1, argsEnd - 1);

  // Parse direction/angle
  const { angle, directionArg } = extractDirection(args);

  // Parse shape (for radial/conic)
  const { shape, position } = extractShape(args);

  // Parse stops
  const stops = parseStopsFromArgs(args);

  if (stops.length === 0) return null;

  // Build normalized value
  const normalizedValue = buildNormalizedGradient(type, repeating, angle, shape, position, stops);

  return {
    type,
    repeating,
    angle,
    shape: type === 'radial' ? (shape || 'ellipse') : null,
    position: type !== 'linear' ? (position || 'center') : null,
    stops,
    originalValue: value.trim(),
    normalizedValue,
    confidence: 0.9,
  };
}

function buildNormalizedGradient(
  type: string,
  repeating: boolean,
  angle: number | null,
  shape: string | null,
  position: string | null,
  stops: GradientStop[]
): string {
  const prefix = repeating ? 'repeating-' : '';

  if (type === 'linear') {
    const angleStr = angle !== null ? `${angle}deg, ` : '';
    const stopsStr = stops.map(s => {
      const pos = s.positionSource === 'explicit' ? ` ${s.position}` : '';
      const alphaStr = s.alpha < 1 ? '' : '';
      return `  ${s.colorHex}${alphaStr}${pos}`;
    }).join(',\n');
    return `${prefix}linear-gradient(${angleStr}\n${stopsStr}\n)`;
  }

  if (type === 'radial') {
    const shapeStr = shape || 'ellipse';
    const posStr = position ? ` at ${position}` : '';
    const stopsStr = stops.map(s => {
      const pos = s.positionSource === 'explicit' ? ` ${s.position}` : '';
      return `  ${s.colorHex}${pos}`;
    }).join(',\n');
    return `${prefix}radial-gradient(${shapeStr}${posStr},\n${stopsStr}\n)`;
  }

  // conic
  const angleStr = angle !== null ? `from ${angle}deg` : '';
  const posStr = position ? ` at ${position}` : '';
  const stopsStr = stops.map(s => {
    const pos = s.positionSource === 'explicit' ? ` ${s.position}` : '';
    return `  ${s.colorHex}${pos}`;
  }).join(',\n');
  return `${prefix}conic-gradient(${angleStr}${posStr},\n${stopsStr}\n)`;
}

// ─── CSS Variable Resolution ─────────────────────────────────────────────────

export function resolveCssVariables(
  css: string,
  maxDepth: number = 5
): Map<string, string> {
  const variables = new Map<string, string>();

  // Extract all CSS custom properties
  const varPattern = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varPattern.exec(css)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    variables.set(`--${name}`, value);
  }

  // Resolve nested variables
  for (let depth = 0; depth < maxDepth; depth++) {
    let changed = false;
    for (const [name, value] of variables) {
      const resolved = value.replace(/var\(([^)]+)\)/g, (fullMatch, varRef) => {
        const [varName, fallback] = varRef.split(',').map((s: string) => s.trim());
        return variables.get(varName) || fallback || fullMatch;
      });
      if (resolved !== value) {
        variables.set(name, resolved);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return variables;
}

export function extractGradientsFromCssVariables(
  css: string
): Array<{ name: string; value: string; gradient: ParsedGradient | null }> {
  const variables = resolveCssVariables(css);
  const results: Array<{ name: string; value: string; gradient: ParsedGradient | null }> = [];

  for (const [name, value] of variables) {
    if (value.includes('-gradient(')) {
      const gradient = parseGradient(value);
      results.push({ name, value, gradient });
    }
  }

  return results;
}

// ─── Gradient Extraction from CSS ────────────────────────────────────────────

export function extractGradientsFromCss(
  css: string
): Array<{ value: string; gradient: ParsedGradient | null; context: string }> {
  const results: Array<{ value: string; gradient: ParsedGradient | null; context: string }> = [];

  // Match gradient values in properties
  const gradientProps = [
    'background',
    'background-image',
    'border-image',
    'mask-image',
    '-webkit-mask-image',
  ];

  for (const prop of gradientProps) {
    const pattern = new RegExp(`${prop}\\s*:\\s*([^;]+)`, 'gi');
    let match;
    while ((match = pattern.exec(css)) !== null) {
      const value = match[1].trim();
      // Check for gradient functions
      if (value.includes('-gradient(')) {
        // Handle multiple gradients (layered)
        const gradientValues = splitGradientLayers(value);
        for (const gv of gradientValues) {
          const gradient = parseGradient(gv);
          if (gradient) {
            results.push({ value: gv, gradient, context: prop });
          }
        }
      }
    }
  }

  return results;
}

function splitGradientLayers(value: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let current = '';
  let inGradient = false;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === '(') {
      depth++;
      if (value.slice(Math.max(0, i - 20), i + 1).match(/-gradient\($/)) {
        inGradient = true;
      }
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
      if (depth === 0 && inGradient) {
        inGradient = false;
      }
    } else if (char === ',' && depth === 0) {
      layers.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    layers.push(current.trim());
  }

  // Filter to only gradient layers
  return layers.filter(l => l.includes('-gradient('));
}

// ─── SVG Gradient Extraction ─────────────────────────────────────────────────

export interface SvgGradient {
  id: string;
  type: 'linear' | 'radial';
  stops: Array<{ offset: string; stopColor: string; stopOpacity: string }>;
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  cx?: string;
  cy?: string;
  r?: string;
  gradientUnits?: string;
  gradientTransform?: string;
}

export function extractSvgGradients(html: string): SvgGradient[] {
  const gradients: SvgGradient[] = [];

  // Match linearGradient elements
  const linearPattern = /<linearGradient[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/linearGradient>/gi;
  let match;
  while ((match = linearPattern.exec(html)) !== null) {
    const id = match[1];
    const content = match[2];
    const attrs = match[0];

    const stops = extractSvgStops(content);
    const x1 = attrs.match(/x1=["']([^"']+)["']/)?.[1];
    const y1 = attrs.match(/y1=["']([^"']+)["']/)?.[1];
    const x2 = attrs.match(/x2=["']([^"']+)["']/)?.[1];
    const y2 = attrs.match(/y2=["']([^"']+)["']/)?.[1];
    const gradientUnits = attrs.match(/gradientUnits=["']([^"']+)["']/)?.[1];
    const gradientTransform = attrs.match(/gradientTransform=["']([^"']+)["']/)?.[1];

    gradients.push({
      id,
      type: 'linear',
      stops,
      x1, y1, x2, y2,
      gradientUnits,
      gradientTransform,
    });
  }

  // Match radialGradient elements
  const radialPattern = /<radialGradient[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/radialGradient>/gi;
  while ((match = radialPattern.exec(html)) !== null) {
    const id = match[1];
    const content = match[2];
    const attrs = match[0];

    const stops = extractSvgStops(content);
    const cx = attrs.match(/cx=["']([^"']+)["']/)?.[1];
    const cy = attrs.match(/cy=["']([^"']+)["']/)?.[1];
    const r = attrs.match(/r=["']([^"']+)["']/)?.[1];
    const gradientUnits = attrs.match(/gradientUnits=["']([^"']+)["']/)?.[1];
    const gradientTransform = attrs.match(/gradientTransform=["']([^"']+)["']/)?.[1];

    gradients.push({
      id,
      type: 'radial',
      stops,
      cx, cy, r,
      gradientUnits,
      gradientTransform,
    });
  }

  return gradients;
}

function extractSvgStops(content: string): Array<{ offset: string; stopColor: string; stopOpacity: string }> {
  const stops: Array<{ offset: string; stopColor: string; stopOpacity: string }> = [];
  const stopPattern = /<stop[^>]*offset=["']([^"']+)["'][^>]*stop-color=["']([^"']+)["'][^>]*(?:stop-opacity=["']([^"']+)["'])?/gi;
  let match;
  while ((match = stopPattern.exec(content)) !== null) {
    stops.push({
      offset: match[1],
      stopColor: match[2],
      stopOpacity: match[3] || '1',
    });
  }
  // Also match with reversed attribute order
  const stopPattern2 = /<stop[^>]*stop-color=["']([^"']+)["'][^>]*offset=["']([^"']+)["'][^>]*(?:stop-opacity=["']([^"']+)["'])?/gi;
  while ((match = stopPattern2.exec(content)) !== null) {
    if (!stops.find(s => s.offset === match![2])) {
      stops.push({
        offset: match[2],
        stopColor: match[1],
        stopOpacity: match[3] || '1',
      });
    }
  }
  return stops;
}

// ─── Gradient Deduplication ──────────────────────────────────────────────────

function normalizeStopColor(hex: string): string {
  return hex.toUpperCase();
}

function gradientKey(g: ParsedGradient): string {
  const stopsKey = g.stops
    .map(s => `${normalizeStopColor(s.colorHex)}:${s.position}:${s.alpha}`)
    .join('|');
  return `${g.type}:${g.repeating}:${g.angle}:${g.shape}:${g.position}:${stopsKey}`;
}

export function deduplicateGradients(gradients: ParsedGradient[]): ParsedGradient[] {
  const seen = new Map<string, ParsedGradient>();

  for (const g of gradients) {
    const key = gradientKey(g);
    if (!seen.has(key)) {
      seen.set(key, g);
    }
  }

  return Array.from(seen.values());
}

// ─── Gradient Similarity Scoring ─────────────────────────────────────────────

function colorDistance(c1: string, c2: string): number {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function parsePosition(pos: string): number {
  const match = pos.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : 0;
}

export function gradientSimilarity(a: ParsedGradient, b: ParsedGradient): number {
  // Type mismatch
  if (a.type !== b.type) return 0;
  if (a.repeating !== b.repeating) return 0.5;

  // Stop colors (45%)
  const maxStops = Math.max(a.stops.length, b.stops.length);
  let colorScore = 1;
  if (maxStops > 0) {
    let totalColorDist = 0;
    for (let i = 0; i < maxStops; i++) {
      const stopA = a.stops[i];
      const stopB = b.stops[i];
      if (stopA && stopB) {
        totalColorDist += colorDistance(stopA.colorHex, stopB.colorHex) / 441.67; // Normalize to 0-1
      } else {
        totalColorDist += 1;
      }
    }
    colorScore = 1 - (totalColorDist / maxStops);
  }

  // Stop positions (20%)
  let positionScore = 1;
  if (maxStops > 0) {
    let totalPosDiff = 0;
    for (let i = 0; i < maxStops; i++) {
      const posA = a.stops[i] ? parsePosition(a.stops[i].position) : 0;
      const posB = b.stops[i] ? parsePosition(b.stops[i].position) : 0;
      totalPosDiff += Math.abs(posA - posB) / 100;
    }
    positionScore = 1 - (totalPosDiff / maxStops);
  }

  // Direction (15%)
  let directionScore = 1;
  if (a.angle !== null && b.angle !== null) {
    const angleDiff = Math.abs(a.angle - b.angle);
    const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
    directionScore = normalizedDiff <= 3 ? 1 : Math.max(0, 1 - (normalizedDiff / 180));
  } else if (a.angle !== b.angle) {
    directionScore = 0.8;
  }

  // Stop count and order (10%)
  const countScore = a.stops.length === b.stops.length ? 1 :
    Math.max(0, 1 - Math.abs(a.stops.length - b.stops.length) / Math.max(a.stops.length, b.stops.length));

  // Opacity (10%)
  let opacityScore = 1;
  for (let i = 0; i < maxStops; i++) {
    const alphaA = a.stops[i]?.alpha ?? 1;
    const alphaB = b.stops[i]?.alpha ?? 1;
    opacityScore *= 1 - Math.abs(alphaA - alphaB);
  }

  return (
    colorScore * 0.45 +
    positionScore * 0.20 +
    directionScore * 0.15 +
    countScore * 0.10 +
    opacityScore * 0.10
  );
}

// ─── Role Classification ─────────────────────────────────────────────────────

export function classifyGradientRole(
  gradient: ParsedGradient,
  context: {
    selector?: string;
    element?: string;
    frequency?: number;
    isHero?: boolean;
    isButton?: boolean;
    isText?: boolean;
    isBorder?: boolean;
    cssVariableName?: string;
    surfaceArea?: number;
  }
): GradientRole {
  const { selector, element, frequency, isHero, isButton, isText, isBorder, cssVariableName } = context;

  // Text gradients
  if (isText) return 'text-gradient';

  // Border gradients
  if (isBorder || selector?.includes('border')) return 'border';

  // Button backgrounds
  if (isButton || selector?.match(/button|btn|cta/i)) return 'button-background';

  // Hero backgrounds
  if (isHero || selector?.match(/hero|banner|jumbotron/i)) return 'hero-background';

  // CTA backgrounds
  if (selector?.match(/cta|action|signup|register/i)) return 'cta-background';

  // Card backgrounds
  if (selector?.match(/card|tile|panel/i)) return 'card-background';

  // Section backgrounds
  if (selector?.match(/section|region|area/i)) return 'section-background';

  // Overlay
  if (selector?.match(/overlay|modal|popup/i)) return 'overlay';

  // Decorative
  if (selector?.match(/decor|accent|highlight/i)) return 'decorative';

  // Check CSS variable name for hints
  if (cssVariableName) {
    const name = cssVariableName.toLowerCase();
    if (name.includes('primary')) return 'primary';
    if (name.includes('secondary')) return 'secondary';
    if (name.includes('accent')) return 'accent';
    if (name.includes('hero')) return 'hero-background';
    if (name.includes('cta')) return 'cta-background';
    if (name.includes('button')) return 'button-background';
    if (name.includes('border')) return 'border';
    if (name.includes('overlay')) return 'overlay';
  }

  // Frequency-based classification
  if (frequency && frequency > 5) return 'primary';
  if (frequency && frequency > 2) return 'secondary';

  return 'unknown';
}

// ─── Gradient Confidence ─────────────────────────────────────────────────────

export function calculateGradientConfidence(
  gradient: ParsedGradient,
  context: {
    source: 'stylesheet' | 'inline' | 'computed' | 'svg';
    hasVariableResolution: boolean;
    stopCount: number;
  }
): number {
  let confidence = 0.5; // Base confidence

  // Source type bonus
  if (context.source === 'stylesheet') confidence += 0.2;
  else if (context.source === 'inline') confidence += 0.15;
  else if (context.source === 'computed') confidence += 0.25;
  else if (context.source === 'svg') confidence += 0.15;

  // Variable resolution bonus
  if (context.hasVariableResolution) confidence += 0.1;

  // Stop count penalty for too few stops
  if (context.stopCount < 2) confidence -= 0.2;
  else if (context.stopCount >= 2) confidence += 0.1;

  // Explicit position bonus
  const explicitPositions = gradient.stops.filter(s => s.positionSource === 'explicit').length;
  confidence += (explicitPositions / Math.max(gradient.stops.length, 1)) * 0.1;

  return Math.min(1, Math.max(0, confidence));
}

// ─── SVG Gradient Helpers ────────────────────────────────────────────────────

function parseColorToHexForGradient(color: string): { hex: string; alpha: number } {
  const trimmed = color.trim().toLowerCase();

  // Named colors
  if (CSS_COLOR_NAMES[trimmed]) {
    return { hex: CSS_COLOR_NAMES[trimmed], alpha: 1 };
  }

  // transparent
  if (trimmed === 'transparent') {
    return { hex: '#000000', alpha: 0 };
  }

  // Hex colors
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 8) {
      const alpha = parseInt(hex.slice(6, 8), 16) / 255;
      return { hex: '#' + hex.slice(0, 6).toUpperCase(), alpha };
    }
    return { hex: '#' + hex.toUpperCase(), alpha: 1 };
  }

  // RGB/RGBA
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const alpha = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, alpha };
  }

  return { hex: '#000000', alpha: 1 };
}

function hexToRgbForGradient(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function calculateSvgAngle(x1: string, y1: string, x2: string, y2: string): number {
  const startX = parseFloat(x1) || 0;
  const startY = parseFloat(y1) || 0;
  const endX = parseFloat(x2) || 1;
  const endY = parseFloat(y2) || 0;

  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  return (angle + 90 + 360) % 360; // Convert to CSS gradient angle
}

export { parseColorToHexForGradient, hexToRgbForGradient, calculateSvgAngle };
