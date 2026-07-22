import { prisma } from '@saas/database';

export async function getBrandProfile(userId: string) {
  return prisma.brandProfile.findUnique({
    where: { userId },
    include: {
      colors: true,
      fonts: true,
      logos: true,
      gradients: true,
      rules: true,
    },
  });
}

export async function createBrandProfile(userId: string, data: {
  name: string;
  description?: string;
  headingFont?: string;
  bodyFont?: string;
  buttonRadius?: number;
  borderRadius?: number;
  spacingPreference?: string;
}) {
  return prisma.brandProfile.create({
    data: {
      userId,
      ...data,
    },
    include: {
      colors: true,
      fonts: true,
      logos: true,
      gradients: true,
      rules: true,
    },
  });
}

export async function updateBrandProfile(userId: string, data: {
  name?: string;
  description?: string;
  headingFont?: string;
  bodyFont?: string;
  buttonRadius?: number;
  borderRadius?: number;
  spacingPreference?: string;
}) {
  return prisma.brandProfile.update({
    where: { userId },
    data,
    include: {
      colors: true,
      fonts: true,
      logos: true,
      gradients: true,
      rules: true,
    },
  });
}

export async function addColor(userId: string, data: {
  name: string;
  hexValue: string;
  role?: string;
}) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  return prisma.brandColor.create({
    data: {
      brandProfileId: profile.id,
      ...data,
    },
  });
}

export async function removeColor(userId: string, colorId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  const color = await prisma.brandColor.findFirst({
    where: { id: colorId, brandProfileId: profile.id },
  });
  if (!color) throw new Error('Color not found');

  return prisma.brandColor.delete({ where: { id: colorId } });
}

export async function addFont(userId: string, data: {
  name: string;
  family: string;
  role?: string;
  weight?: number;
  url?: string;
}) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  return prisma.brandFont.create({
    data: {
      brandProfileId: profile.id,
      ...data,
    },
  });
}

export async function removeFont(userId: string, fontId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  const font = await prisma.brandFont.findFirst({
    where: { id: fontId, brandProfileId: profile.id },
  });
  if (!font) throw new Error('Font not found');

  return prisma.brandFont.delete({ where: { id: fontId } });
}

export async function addLogo(userId: string, data: {
  fileUrl: string;
  storageKey: string;
  logoType?: string;
  backgroundType?: string;
  width?: number;
  height?: number;
}) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  return prisma.brandLogo.create({
    data: {
      brandProfileId: profile.id,
      ...data,
    },
  });
}

export async function removeLogo(userId: string, logoId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  const logo = await prisma.brandLogo.findFirst({
    where: { id: logoId, brandProfileId: profile.id },
  });
  if (!logo) throw new Error('Logo not found');

  return prisma.brandLogo.delete({ where: { id: logoId } });
}

export async function addRule(userId: string, data: {
  category: string;
  name: string;
  value: string;
}) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  return prisma.brandRule.create({
    data: {
      brandProfileId: profile.id,
      ...data,
    },
  });
}

export async function removeRule(userId: string, ruleId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  const rule = await prisma.brandRule.findFirst({
    where: { id: ruleId, brandProfileId: profile.id },
  });
  if (!rule) throw new Error('Rule not found');

  return prisma.brandRule.delete({ where: { id: ruleId } });
}

// ─── Gradients ───────────────────────────────────────────────────────────────

export async function addGradient(userId: string, data: {
  name: string;
  role?: string;
  gradientType?: string;
  repeating?: boolean;
  originalValue: string;
  normalizedValue: string;
  angle?: number | null;
  shape?: string | null;
  position?: string | null;
  stops: any;
  usageCount?: number;
  pageCount?: number;
  sourceType?: string;
  cssVariableName?: string | null;
  confidence?: number;
  isApproved?: boolean;
}) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  return prisma.brandGradient.create({
    data: {
      brandProfileId: profile.id,
      ...data,
    },
  });
}

export async function updateGradient(userId: string, gradientId: string, data: {
  name?: string;
  role?: string;
  gradientType?: string;
  repeating?: boolean;
  originalValue?: string;
  normalizedValue?: string;
  angle?: number | null;
  shape?: string | null;
  position?: string | null;
  stops?: any;
  usageCount?: number;
  pageCount?: number;
  cssVariableName?: string | null;
  confidence?: number;
  isApproved?: boolean;
}) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  const gradient = await prisma.brandGradient.findFirst({
    where: { id: gradientId, brandProfileId: profile.id },
  });
  if (!gradient) throw new Error('Gradient not found');

  return prisma.brandGradient.update({
    where: { id: gradientId },
    data,
  });
}

export async function removeGradient(userId: string, gradientId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  const gradient = await prisma.brandGradient.findFirst({
    where: { id: gradientId, brandProfileId: profile.id },
  });
  if (!gradient) throw new Error('Gradient not found');

  return prisma.brandGradient.delete({ where: { id: gradientId } });
}

export async function addGradientsBulk(userId: string, gradients: Array<{
  name: string;
  role?: string;
  gradientType?: string;
  repeating?: boolean;
  originalValue: string;
  normalizedValue: string;
  angle?: number | null;
  shape?: string | null;
  position?: string | null;
  stops: any;
  usageCount?: number;
  pageCount?: number;
  sourceType?: string;
  cssVariableName?: string | null;
  confidence?: number;
  isApproved?: boolean;
}>) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Brand profile not found');

  return prisma.brandGradient.createMany({
    data: gradients.map(g => ({
      brandProfileId: profile.id,
      ...g,
    })),
  });
}
