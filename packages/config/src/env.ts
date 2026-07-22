import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  WEB_APP_URL: z.string().url().default('http://localhost:5173'),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3001'),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_PRICE_ID_STARTER_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_STARTER_YEARLY: z.string().optional(),
  STRIPE_PRICE_ID_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_PRO_YEARLY: z.string().optional(),
  STRIPE_PRICE_ID_BUSINESS_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_BUSINESS_YEARLY: z.string().optional(),
  STRIPE_PRICE_ID_BRAND_GUARD_LITE_MONTHLY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _serverEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  _serverEnv = result.data;
  return _serverEnv;
}
