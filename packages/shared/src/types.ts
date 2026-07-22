export type UserRole = 'owner' | 'admin' | 'member';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type BillingInterval = 'monthly' | 'yearly';

export type PlanKey = 'free' | 'brand-guard-lite' | 'starter' | 'pro' | 'business';

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  description: string;
  monthlyPriceId?: string;
  annualPriceId?: string;
  features: string[];
  limits: Record<string, number | boolean>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserProfile {
  id: string;
  authUserId: string;
  displayName: string | null;
  avatar: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  workspaceId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  planKey: PlanKey;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Brand Guard Types ──────────────────────────────────────────────────────

export type ScanType = 'social' | 'website';
export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type IssueSeverity = 'critical' | 'major' | 'warning' | 'recommendation' | 'passed';
export type LogoType = 'primary' | 'alternative' | 'light' | 'dark';
export type ColorRole = 'primary' | 'secondary' | 'accent' | 'additional';
export type FontRole = 'heading' | 'body' | 'button' | 'label';
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

export type SocialPlatform =
  | 'instagram-post'
  | 'instagram-story'
  | 'linkedin-post'
  | 'linkedin-banner'
  | 'facebook-post'
  | 'youtube-thumbnail'
  | 'advertisement'
  | 'general';

export interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  buttonRadius: number;
  borderRadius: number;
  spacingPreference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandColor {
  id: string;
  brandProfileId: string;
  name: string;
  hexValue: string;
  role: ColorRole;
  createdAt: Date;
}

export interface BrandFont {
  id: string;
  brandProfileId: string;
  name: string;
  family: string;
  role: FontRole;
  weight: number;
  url: string | null;
  createdAt: Date;
}

export interface BrandLogo {
  id: string;
  brandProfileId: string;
  fileUrl: string;
  storageKey: string;
  logoType: LogoType;
  backgroundType: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

export interface GradientStop {
  colorHex: string;
  rgb: { r: number; g: number; b: number };
  alpha: number;
  position: string;
  positionSource: 'explicit' | 'inferred';
  originalColor: string;
}

export interface BrandGradient {
  id: string;
  brandProfileId: string;
  name: string;
  role: GradientRole;
  gradientType: 'linear' | 'radial' | 'conic';
  repeating: boolean;
  originalValue: string;
  normalizedValue: string;
  angle: number | null;
  shape: string | null;
  position: string | null;
  stops: GradientStop[];
  usageCount: number;
  pageCount: number;
  sourceType: string;
  cssVariableName: string | null;
  confidence: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandRule {
  id: string;
  brandProfileId: string;
  category: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scan {
  id: string;
  userId: string;
  brandProfileId: string;
  scanType: ScanType;
  status: ScanStatus;
  sourceUrl: string | null;
  sourceFileUrl: string | null;
  platform: string | null;
  overallScore: number | null;
  scoringVersion: string;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
}

export interface ScanScore {
  id: string;
  scanId: string;
  category: string;
  score: number;
  weight: number;
  createdAt: Date;
}

export interface ScanIssue {
  id: string;
  scanId: string;
  category: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  recommendation: string | null;
  metadataJson: unknown;
  createdAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  scanId: string | null;
  usageType: string;
  quantity: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  idempotencyKey: string;
  createdAt: Date;
}
