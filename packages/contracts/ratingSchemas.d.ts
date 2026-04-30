import { z } from 'zod';
import type { CreateExchangeRatingPayload } from './ratings';

export declare const ratingScoreSchema: z.ZodNumber;
export declare const createExchangeRatingPayloadSchema: z.ZodType<CreateExchangeRatingPayload>;
