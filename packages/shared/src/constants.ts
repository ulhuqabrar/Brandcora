export const PLAN_KEYS = ['free', 'brand-guard-lite', 'starter', 'pro', 'business'] as const;
export const BILLING_INTERVALS = ['monthly', 'yearly'] as const;
export const WORKSPACE_ROLES = ['owner', 'admin', 'member'] as const;
export const INVITATION_STATUSES = ['pending', 'accepted', 'expired', 'revoked'] as const;
export const SUBSCRIPTION_STATUSES = [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
  'paused',
] as const;

export const PRODUCT_NAME = 'Brand Guard';
export const PRODUCT_DESCRIPTION = 'Check whether your website and social designs follow the same brand system.';
export const BRAND_NAME = 'Brand Guard';

export const API_PREFIX = '/api/v1';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Brand Guard Constants ──────────────────────────────────────────────────

export const SCAN_TYPES = ['social', 'website'] as const;
export const SCAN_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
export const ISSUE_SEVERITIES = ['critical', 'major', 'warning', 'recommendation', 'passed'] as const;

export const SOCIAL_PLATFORMS = [
  { key: 'instagram-post', name: 'Instagram Post', width: 1080, height: 1080 },
  { key: 'instagram-story', name: 'Instagram Story', width: 1080, height: 1920 },
  { key: 'linkedin-post', name: 'LinkedIn Post', width: 1200, height: 627 },
  { key: 'linkedin-banner', name: 'LinkedIn Banner', width: 1584, height: 396 },
  { key: 'facebook-post', name: 'Facebook Post', width: 1200, height: 630 },
  { key: 'youtube-thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { key: 'advertisement', name: 'Advertisement', width: 1080, height: 1080 },
  { key: 'general', name: 'General', width: 1080, height: 1080 },
] as const;

export const COLOR_ROLES = ['primary', 'secondary', 'accent', 'additional'] as const;
export const FONT_ROLES = ['heading', 'body', 'button', 'label'] as const;
export const LOGO_TYPES = ['primary', 'alternative', 'light', 'dark'] as const;
export const GRADIENT_ROLES = [
  'primary',
  'secondary',
  'accent',
  'hero-background',
  'cta-background',
  'button-background',
  'text-gradient',
  'card-background',
  'section-background',
  'decorative',
  'overlay',
  'border',
  'mask',
  'unknown',
] as const;
export const GRADIENT_TYPES = ['linear', 'radial', 'conic'] as const;

export const BRAND_GUARD_LITE_LIMITS = {
  socialChecksPerMonth: 50,
  websiteScansPerMonth: 5,
  maxPagesPerScan: 5,
  reportHistoryDays: 30,
} as const;

export const FREE_PLAN_LIMITS = {
  socialChecksPerMonth: 3,
  websiteScansPerMonth: 1,
  maxPagesPerScan: 1,
  reportHistoryDays: 7,
} as const;

export const SCORING_VERSION = '1.0';

export const SOCIAL_WEIGHTS = {
  colors: 0.25,
  logo: 0.20,
  layout: 0.20,
  accessibility: 0.20,
  platformReadiness: 0.15,
} as const;

export const WEBSITE_WEIGHTS = {
  colors: 0.20,
  typography: 0.15,
  logo: 0.15,
  components: 0.15,
  layout: 0.15,
  accessibility: 0.10,
  responsiveness: 0.10,
} as const;

export const SEVERITY_DEDUCTIONS = {
  critical: 10,
  major: 5,
  warning: 2,
  recommendation: 0,
  passed: 0,
} as const;
