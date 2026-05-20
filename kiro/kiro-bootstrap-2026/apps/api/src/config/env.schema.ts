import { z } from 'zod';

/**
 * Weak secrets that must be rejected in production environments.
 */
const WEAK_SECRETS = [
  'secret',
  'changeme',
  'password',
  'change-me',
  'default',
  'dev-secret',
  'test-secret',
  'placeholder',
];

function isWeakSecret(value: string): boolean {
  const lower = value.toLowerCase();
  return WEAK_SECRETS.some(
    (weak) => lower === weak || lower.includes(weak),
  );
}

export const envSchema = z
  .object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    APP_PORT: z.coerce.number().int().positive().default(3001),

    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // Redis
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

    // Authentication secrets
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

    // Encryption
    ARGON2_PEPPER: z
      .string()
      .min(16, 'ARGON2_PEPPER must be at least 16 characters'),

    // SMTP (Email)
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().int().positive().default(1025),
    SMTP_SECURE: z.string().default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default('Community OS <noreply@communityos.app>'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (isWeakSecret(data.JWT_SECRET)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message:
            'JWT_SECRET contains a weak/default value. Use a strong random secret in production.',
        });
      }

      if (isWeakSecret(data.JWT_REFRESH_SECRET)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message:
            'JWT_REFRESH_SECRET contains a weak/default value. Use a strong random secret in production.',
        });
      }

      if (isWeakSecret(data.ARGON2_PEPPER)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ARGON2_PEPPER'],
          message:
            'ARGON2_PEPPER contains a weak/default value. Use a strong random secret in production.',
        });
      }
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;
