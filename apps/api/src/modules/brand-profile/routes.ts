import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';
import * as brandProfileService from './service.js';

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

export { router as brandProfileRoutes };
