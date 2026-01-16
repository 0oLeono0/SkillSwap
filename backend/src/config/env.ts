import 'dotenv/config';
import { z } from 'zod';

const numberFromEnv = (fallback: number, schema: z.ZodNumber) =>
  z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : fallback))
    .pipe(schema);

const optionalString = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

const rateLimitWindowSchema = z.number().int().min(1000);
const rateLimitMaxSchema = z.number().int().min(1);

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 4000))
    .pipe(z.number().min(0).max(65535)),
  CLIENT_ORIGIN: z.string().optional(),
  REDIS_URL: optionalString,
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET is too short'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET is too short'),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .default('15m')
    .transform((value) => value || '15m'),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default('7d')
    .transform((value) => value || '7d'),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 10))
    .pipe(z.number().int().min(6).max(12)),
  RATE_LIMIT_LOGIN_WINDOW_MS: numberFromEnv(60_000, rateLimitWindowSchema),
  RATE_LIMIT_LOGIN_MAX: numberFromEnv(5, rateLimitMaxSchema),
  RATE_LIMIT_REGISTER_WINDOW_MS: numberFromEnv(10 * 60_000, rateLimitWindowSchema),
  RATE_LIMIT_REGISTER_MAX: numberFromEnv(3, rateLimitMaxSchema),
  RATE_LIMIT_REFRESH_WINDOW_MS: numberFromEnv(60_000, rateLimitWindowSchema),
  RATE_LIMIT_REFRESH_MAX: numberFromEnv(10, rateLimitMaxSchema),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Failed to validate environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

const {
  PORT,
  CLIENT_ORIGIN,
  REDIS_URL,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  RATE_LIMIT_LOGIN_WINDOW_MS,
  RATE_LIMIT_LOGIN_MAX,
  RATE_LIMIT_REGISTER_WINDOW_MS,
  RATE_LIMIT_REGISTER_MAX,
  RATE_LIMIT_REFRESH_WINDOW_MS,
  RATE_LIMIT_REFRESH_MAX,
} = parsed.data;

const normalizeOrigins = (value?: string): string[] => {
  if (!value) {
    return ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4000', 'http://localhost:4001'];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const config = {
  port: PORT,
  clientOrigins: normalizeOrigins(CLIENT_ORIGIN),
  redis: {
    url: REDIS_URL,
  },
  jwt: {
    accessSecret: JWT_ACCESS_SECRET,
    refreshSecret: JWT_REFRESH_SECRET,
    accessExpiresIn: JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
  },
  bcryptSaltRounds: BCRYPT_SALT_ROUNDS,
  rateLimit: {
    login: {
      windowMs: RATE_LIMIT_LOGIN_WINDOW_MS,
      max: RATE_LIMIT_LOGIN_MAX,
    },
    register: {
      windowMs: RATE_LIMIT_REGISTER_WINDOW_MS,
      max: RATE_LIMIT_REGISTER_MAX,
    },
    refresh: {
      windowMs: RATE_LIMIT_REFRESH_WINDOW_MS,
      max: RATE_LIMIT_REFRESH_MAX,
    },
  },
};
