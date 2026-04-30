import { z } from 'zod';

export const ratingScoreSchema = z.number().int().min(1).max(5);

export const createExchangeRatingPayloadSchema = z
  .object({
    score: ratingScoreSchema,
    comment: z.string().trim().min(1).max(500).optional().nullable()
  })
  .strict();
