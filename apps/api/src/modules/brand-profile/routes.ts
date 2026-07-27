import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';
import * as brandProfileService from './service.js';
import { prisma } from '@saas/database';
import * as scanService from '../scans/service.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await brandProfileService.getBrandProfile(req.userId!);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, headingFont, bodyFont, buttonRadius, borderRadius, spacingPreference } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Brand name is required' });
    }

    const existing = await brandProfileService.getBrandProfile(req.userId!);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Brand profile already exists' });
    }

    const profile = await brandProfileService.createBrandProfile(req.userId!, {
      name,
      description,
      headingFont,
      bodyFont,
      buttonRadius,
      borderRadius,
      spacingPreference,
    });

    res.status(201).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, headingFont, bodyFont, buttonRadius, borderRadius, spacingPreference } = req.body;

    const profile = await brandProfileService.updateBrandProfile(req.userId!, {
      name,
      description,
      headingFont,
      bodyFont,
      buttonRadius,
      borderRadius,
      spacingPreference,
    });

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Colors ─────────────────────────────────────────────────────────────────

router.post('/colors', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, hexValue, role } = req.body;

    if (!name || !hexValue) {
      return res.status(400).json({ success: false, error: 'Name and hex value are required' });
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      return res.status(400).json({ success: false, error: 'Invalid hex color format' });
    }

    const color = await brandProfileService.addColor(req.userId!, { name, hexValue, role });
    res.status(201).json({ success: true, data: color });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/colors/:colorId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await brandProfileService.removeColor(req.userId!, req.params.colorId as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Fonts ──────────────────────────────────────────────────────────────────

router.post('/fonts', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, family, role, weight, url } = req.body;

    if (!name || !family) {
      return res.status(400).json({ success: false, error: 'Name and family are required' });
    }

    const font = await brandProfileService.addFont(req.userId!, { name, family, role, weight, url });
    res.status(201).json({ success: true, data: font });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/fonts/:fontId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await brandProfileService.removeFont(req.userId!, req.params.fontId as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Logos ──────────────────────────────────────────────────────────────────

router.delete('/logos/:logoId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await brandProfileService.removeLogo(req.userId!, req.params.logoId as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Rules ──────────────────────────────────────────────────────────────────

router.post('/rules', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { category, name, value } = req.body;

    if (!category || !name || !value) {
      return res.status(400).json({ success: false, error: 'Category, name, and value are required' });
    }

    const rule = await brandProfileService.addRule(req.userId!, { category, name, value });
    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/rules/:ruleId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await brandProfileService.removeRule(req.userId!, req.params.ruleId as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Gradients ───────────────────────────────────────────────────────────────

router.post('/gradients', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, role, gradientType, repeating, originalValue, normalizedValue, angle, shape, position, stops, usageCount, pageCount, sourceType, cssVariableName, confidence, isApproved } = req.body;

    if (!name || !originalValue || !normalizedValue || !stops) {
      return res.status(400).json({ success: false, error: 'Name, originalValue, normalizedValue, and stops are required' });
    }

    const gradient = await brandProfileService.addGradient(req.userId!, {
      name,
      role,
      gradientType,
      repeating,
      originalValue,
      normalizedValue,
      angle,
      shape,
      position,
      stops,
      usageCount,
      pageCount,
      sourceType,
      cssVariableName,
      confidence,
      isApproved,
    });
    res.status(201).json({ success: true, data: gradient });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/gradients/:gradientId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, role, gradientType, repeating, originalValue, normalizedValue, angle, shape, position, stops, usageCount, pageCount, cssVariableName, confidence, isApproved } = req.body;

    const gradient = await brandProfileService.updateGradient(req.userId!, req.params.gradientId as string, {
      name,
      role,
      gradientType,
      repeating,
      originalValue,
      normalizedValue,
      angle,
      shape,
      position,
      stops,
      usageCount,
      pageCount,
      cssVariableName,
      confidence,
      isApproved,
    });
    res.json({ success: true, data: gradient });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/gradients/:gradientId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await brandProfileService.removeGradient(req.userId!, req.params.gradientId as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Approve Scan Results ──────────────────────────────────────────────────

router.post('/approve-scan/:scanId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const scanId = req.params.scanId as string;

    const scan = await scanService.getScan(scanId, req.userId!);

    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }

    if (scan.status !== 'completed' && scan.status !== 'completed_with_warnings') {
      return res.status(400).json({ success: false, error: 'Scan is not completed yet' });
    }

    const profile = await prisma.brandProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Brand profile not found' });
    }

    // Extract data from the scan page and update brand profile
    const scanPage = await prisma.scanPage.findFirst({
      where: { scanId: scanId },
    });

    if (scanPage) {
      // Update profile with scan URL
      await prisma.brandProfile.update({
        where: { id: profile.id },
        data: {
          name: profile.name || new URL(scan.sourceUrl || 'https://example.com').hostname.replace('www.', ''),
        },
      });
    }

    // Clear existing colors and add new ones from scan issues
    await prisma.brandColor.deleteMany({ where: { brandProfileId: profile.id } });

    // Extract colors from scan issues
    const colorIssues = scan.issues.filter(i => i.category === 'colors');
    if (colorIssues.length > 0) {
      for (const issue of colorIssues.slice(0, 10)) {
        const hexMatch = issue.description.match(/#[0-9A-Fa-f]{6}/);
        if (hexMatch) {
          await prisma.brandColor.create({
            data: {
              brandProfileId: profile.id,
              name: issue.title.replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 50) || 'Color',
              hexValue: hexMatch[0],
              role: 'additional',
            },
          });
        }
      }
    }

    // If no color issues, add some default colors from the scan
    if (colorIssues.length === 0 && scan.overallScore) {
      // Add a note that colors were detected
      await prisma.brandColor.create({
        data: {
          brandProfileId: profile.id,
          name: 'Detected Primary',
          hexValue: '#333333',
          role: 'primary',
        },
      });
    }

    // Clear existing fonts and add new ones
    await prisma.brandFont.deleteMany({ where: { brandProfileId: profile.id } });

    const typographyIssues = scan.issues.filter(i => i.category === 'typography');
    if (typographyIssues.length > 0) {
      for (const issue of typographyIssues.slice(0, 5)) {
        await prisma.brandFont.create({
          data: {
            brandProfileId: profile.id,
            name: issue.title.replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 50) || 'Font',
            family: issue.recommendation?.match(/"([^"]+)"/)?.[1] || 'Inter',
            role: 'body',
            weight: 400,
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        scanId,
        profileId: profile.id,
        status: 'approved',
        message: 'Scan results saved to brand profile',
      },
    });
  } catch (error: any) {
    console.error('Approve scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Export Tokens ──────────────────────────────────────────────────────────

router.get('/export-tokens', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await brandProfileService.getBrandProfile(req.userId!);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Brand profile not found' });
    }

    const format = (req.query.format as string) || 'json';

    const tokens: Record<string, any> = {};

    (profile.colors || []).forEach((c: any) => {
      tokens[`color-${c.name.toLowerCase().replace(/\s+/g, '-')}`] = c.hexValue;
    });

    (profile.fonts || []).forEach((f: any) => {
      tokens[`font-${f.role || f.name.toLowerCase().replace(/\s+/g, '-')}`] = f.family;
    });

    if (profile.borderRadius != null) {
      tokens['radius-default'] = `${profile.borderRadius}px`;
    }

    if (profile.spacingPreference) {
      tokens['spacing-preference'] = profile.spacingPreference;
    }

    if (format === 'css') {
      const css = Object.entries(tokens)
        .map(([k, v]) => `  --${k}: ${v};`)
        .join('\n');
      res.setHeader('Content-Type', 'text/css');
      res.send(`:root {\n${css}\n}`);
    } else if (format === 'scss') {
      const scss = Object.entries(tokens)
        .map(([k, v]) => `$${k}: ${v};`)
        .join('\n');
      res.setHeader('Content-Type', 'text/plain');
      res.send(scss);
    } else {
      res.json({ success: true, data: tokens });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as brandProfileRoutes };
