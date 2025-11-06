import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 4000))
    .pipe(z.number().min(0).max(65535)),
  CLIENT_ORIGIN: z.string().optional(),
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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Failed to validate environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

const {
  PORT,
  CLIENT_ORIGIN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
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
  jwt: {
    accessSecret: JWT_ACCESS_SECRET,
    refreshSecret: JWT_REFRESH_SECRET,
    accessExpiresIn: JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
  },
  bcryptSaltRounds: BCRYPT_SALT_ROUNDS,
};
