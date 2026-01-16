import type { Request, RequestHandler } from 'express';
import { createClient } from 'redis';
import { config } from '../config/env.js';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  prefix?: string;
  store?: RateLimitStore;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = {
  increment: (key: string, windowMs: number) => Promise<RateLimitEntry>;
};

const defaultMessage = 'Too many requests, please try again later.';
const redisErrorCooldownMs = 30_000;
const redisDisableMs = 10_000;

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let redisConnectPromise: Promise<RedisClient | null> | null = null;
let redisDisabledUntil = 0;
let lastRedisErrorAt = 0;

const normalizeKey = (value?: string | null) => {
  if (!value) {
    return 'unknown';
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : 'unknown';
};

const getClientIp = (req: Request): string => {
  return normalizeKey(req.ip || req.socket?.remoteAddress || undefined);
};

const getEmailFromBody = (req: Request): string => {
  const body = req.body as { email?: unknown } | undefined;
  if (body && typeof body.email === 'string') {
    return body.email.trim().toLowerCase();
  }
  return '';
};

const logRedisError = (message: string, error: unknown) => {
  const now = Date.now();
  if (now - lastRedisErrorAt < redisErrorCooldownMs) {
    return;
  }
  lastRedisErrorAt = now;
  console.error(`[rateLimit] ${message}`, error);
};

const createMemoryStore = (): RateLimitStore => {
  const hits = new Map<string, RateLimitEntry>();
  let lastCleanup = 0;

  return {
    async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
      const now = Date.now();

      if (now - lastCleanup >= windowMs) {
        for (const [entryKey, entry] of hits) {
          if (entry.resetAt <= now) {
            hits.delete(entryKey);
          }
        }
        lastCleanup = now;
      }

      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        const nextEntry = { count: 1, resetAt: now + windowMs };
        hits.set(key, nextEntry);
        return nextEntry;
      }

      const nextEntry = { count: entry.count + 1, resetAt: entry.resetAt };
      hits.set(key, nextEntry);
      return nextEntry;
    },
  };
};

const getRedisClient = async (): Promise<RedisClient | null> => {
  if (!config.redis?.url) {
    return null;
  }

  const now = Date.now();
  if (redisDisabledUntil && now < redisDisabledUntil) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    const client = createClient({ url: config.redis.url });
    client.on('error', (error) => {
      logRedisError('Redis client error', error);
    });

    redisConnectPromise = client
      .connect()
      .then(() => {
        redisClient = client;
        return client;
      })
      .catch((error) => {
        logRedisError('Redis connection failed', error);
        redisDisabledUntil = Date.now() + redisDisableMs;
        redisConnectPromise = null;
        return null;
      });
  }

  return redisConnectPromise;
};

const createRedisStore = (fallback: RateLimitStore): RateLimitStore => {
  return {
    async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
      const client = await getRedisClient();
      if (!client) {
        return fallback.increment(key, windowMs);
      }

      try {
        const count = await client.incr(key);
        if (count === 1) {
          await client.pExpire(key, windowMs);
          return { count, resetAt: Date.now() + windowMs };
        }

        let ttl = await client.pTTL(key);
        if (ttl < 0) {
          await client.pExpire(key, windowMs);
          ttl = windowMs;
        }

        return { count, resetAt: Date.now() + ttl };
      } catch (error) {
        logRedisError('Redis store failed, falling back to memory', error);
        return fallback.increment(key, windowMs);
      }
    },
  };
};

export const createRateLimitStore = (): RateLimitStore => {
  const memoryStore = createMemoryStore();
  if (!config.redis?.url) {
    return memoryStore;
  }
  return createRedisStore(memoryStore);
};

export const createRateLimiter = (options: RateLimitOptions): RequestHandler => {
  const store = options.store ?? createMemoryStore();
  const prefix = options.prefix?.trim() ?? '';

  return async (req, res, next) => {
    try {
      const rawKey = options.keyGenerator ? options.keyGenerator(req) : getClientIp(req);
      const key = normalizeKey(rawKey);
      const storeKey = prefix ? `${prefix}:${key}` : key;
      const entry = await store.increment(storeKey, options.windowMs);

      if (entry.count > options.max) {
        const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000));
        res.set('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({ message: options.message ?? defaultMessage });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const authRateLimitKey = (req: Request): string => {
  const ip = getClientIp(req);
  const email = getEmailFromBody(req);
  return email ? `${ip}:${email}` : ip;
};

export const ipRateLimitKey = (req: Request): string => getClientIp(req);
