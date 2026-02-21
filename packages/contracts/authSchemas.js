import { z } from 'zod';

export const apiUserSkillSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    title: z.string().trim().min(2),
    categoryId: z.number().int().positive().nullable(),
    subcategoryId: z.number().int().positive().nullable(),
    description: z.string().trim().min(1),
    imageUrls: z.array(z.string().trim().min(1)).optional()
  })
  .strict();

const nullableOptional = (schema) => schema.optional().nullable();

const profileFieldsShape = {
  avatarUrl: nullableOptional(z.string().url()),
  cityId: nullableOptional(z.number().int().positive()),
  birthDate: nullableOptional(z.string().min(1)),
  gender: nullableOptional(z.string().max(255)),
  bio: nullableOptional(z.string().max(2000)),
  teachableSkills: z.array(apiUserSkillSchema).optional(),
  learningSkills: z.array(apiUserSkillSchema).optional()
};

export const loginPayloadSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8)
  })
  .strict();

export const registerPayloadSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().trim().min(2),
    ...profileFieldsShape
  })
  .strict();

export const updateProfilePayloadSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().trim().min(2).optional(),
    ...profileFieldsShape
  })
  .strict();
