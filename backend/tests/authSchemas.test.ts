import { describe, expect, it } from '@jest/globals';
import {
  loginPayloadSchema,
  registerPayloadSchema,
  updateProfilePayloadSchema
} from '@skillswap/contracts/authSchemas';

const validSkill = {
  id: 'skill-id',
  title: 'React',
  categoryId: 1,
  subcategoryId: 2,
  description: 'Hooks and state',
  imageUrls: ['https://example.com/image.png']
};

describe('authSchemas contracts', () => {
  it('validates login payload', () => {
    expect(
      loginPayloadSchema.safeParse({
        email: 'user@example.com',
        password: '12345678'
      }).success
    ).toBe(true);

    expect(
      loginPayloadSchema.safeParse({
        email: 'invalid-email',
        password: '12345678'
      }).success
    ).toBe(false);
  });

  it('validates register payload with shared profile fields', () => {
    const result = registerPayloadSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      name: 'John Doe',
      avatarUrl: null,
      cityId: null,
      birthDate: null,
      gender: null,
      bio: null,
      teachableSkills: [validSkill],
      learningSkills: [validSkill]
    });

    expect(result.success).toBe(true);
  });

  it('validates partial profile update payload', () => {
    const result = updateProfilePayloadSchema.safeParse({
      name: 'Jane Doe',
      bio: 'Updated bio'
    });

    expect(result.success).toBe(true);
  });

  it('applies the same shared skill rules for register and update', () => {
    const invalidSkill = {
      ...validSkill,
      imageUrls: ['   ']
    };

    expect(
      registerPayloadSchema.safeParse({
        email: 'user@example.com',
        password: '12345678',
        name: 'John Doe',
        teachableSkills: [invalidSkill]
      }).success
    ).toBe(false);

    expect(
      updateProfilePayloadSchema.safeParse({
        teachableSkills: [invalidSkill]
      }).success
    ).toBe(false);
  });

  it('rejects unknown top-level fields in payloads', () => {
    expect(
      loginPayloadSchema.safeParse({
        email: 'user@example.com',
        password: '12345678',
        unexpected: true
      }).success
    ).toBe(false);

    expect(
      registerPayloadSchema.safeParse({
        email: 'user@example.com',
        password: '12345678',
        name: 'John Doe',
        extraField: 'not-allowed'
      }).success
    ).toBe(false);

    expect(
      updateProfilePayloadSchema.safeParse({
        name: 'Jane Doe',
        extraField: 'not-allowed'
      }).success
    ).toBe(false);
  });

  it('rejects unknown fields in nested skill objects', () => {
    expect(
      registerPayloadSchema.safeParse({
        email: 'user@example.com',
        password: '12345678',
        name: 'John Doe',
        teachableSkills: [{ ...validSkill, extraSkillField: 123 }]
      }).success
    ).toBe(false);
  });
});
