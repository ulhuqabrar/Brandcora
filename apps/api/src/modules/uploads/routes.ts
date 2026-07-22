import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../middleware/require-auth.js';
import type { AuthenticatedRequest } from '../../middleware/require-auth.js';
import { prisma } from '@saas/database';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

router.post('/logo', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { logoType = 'primary', backgroundType = 'any' } = req.body;

    const profile = await prisma.brandProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Brand profile not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const storageKey = req.file.filename;

    const logo = await prisma.brandLogo.create({
      data: {
        brandProfileId: profile.id,
        fileUrl,
        storageKey,
        logoType,
        backgroundType,
        width: req.file.size,
        height: undefined,
      },
    });

    res.status(201).json({ success: true, data: logo });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/social-design', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const storageKey = req.file.filename;

    res.status(201).json({
      success: true,
      data: {
        fileUrl,
        storageKey,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as uploadRoutes };
