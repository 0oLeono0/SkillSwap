import { describe, expect, it } from '@jest/globals';
import {
  createExchangeRatingPayloadSchema,
  ratingScoreSchema
} from '@skillswap/contracts/ratingSchemas';

describe('ratingSchemas contracts', () => {
  it('validates rating score values', () => {
    expect(ratingScoreSchema.safeParse(1).success).toBe(true);
    expect(ratingScoreSchema.safeParse(5).success).toBe(true);
    expect(ratingScoreSchema.safeParse(0).success).toBe(false);
    expect(ratingScoreSchema.safeParse(6).success).toBe(false);
    expect(ratingScoreSchema.safeParse(4.5).success).toBe(false);
  });

  it('validates create rating payload', () => {
    expect(
      createExchangeRatingPayloadSchema.safeParse({
        score: 5,
        comment: 'Спасибо за полезный обмен'
      }).success
    ).toBe(true);

    expect(
      createExchangeRatingPayloadSchema.safeParse({
        score: 4,
        comment: null
      }).success
    ).toBe(true);
  });

  it('rejects invalid comments and unknown fields', () => {
    expect(
      createExchangeRatingPayloadSchema.safeParse({
        score: 5,
        comment: 'x'.repeat(501)
      }).success
    ).toBe(false);

    expect(
      createExchangeRatingPayloadSchema.safeParse({
        score: 5,
        ratedUserId: 'user-2'
      }).success
    ).toBe(false);
  });
});
