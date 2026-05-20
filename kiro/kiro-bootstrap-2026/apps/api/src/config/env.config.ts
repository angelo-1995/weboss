import { envSchema, type EnvConfig } from './env.schema';

/**
 * Validates environment variables using the Zod schema.
 * Compatible with NestJS ConfigModule's `validate` option.
 *
 * On failure: throws an error with a descriptive message listing all invalid vars.
 * On success: returns the validated and typed config object.
 */
export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  • ${issue.path.join('.')}: ${issue.message}`,
    );

    throw new Error(
      `\n❌ Environment validation failed:\n\n${errors.join('\n')}\n\n` +
        `Please check your .env file or environment variables.\n`,
    );
  }

  return result.data;
}
