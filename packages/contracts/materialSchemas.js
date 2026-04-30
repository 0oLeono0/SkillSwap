import { z } from 'zod';
import { MATERIAL_TYPES } from './materials.js';

export const materialTypes = MATERIAL_TYPES;

const idSchema = z.string().trim().min(1);
const textSchema = z.string().trim().min(1);
const nullableOptional = (schema) => schema.optional().nullable();
const positionSchema = z.number().int().min(0);

export const materialTypeSchema = z.enum(MATERIAL_TYPES);

export const createMaterialPayloadSchema = z
  .object({
    userSkillId: idSchema,
    type: materialTypeSchema,
    title: textSchema,
    description: nullableOptional(z.string().trim().min(1).max(2000)),
    content: nullableOptional(z.string().trim().min(1)),
    position: positionSchema.optional()
  })
  .strict();

export const updateMaterialPayloadSchema = z
  .object({
    type: materialTypeSchema.optional(),
    title: textSchema.optional(),
    description: nullableOptional(z.string().trim().min(1).max(2000)),
    content: nullableOptional(z.string().trim().min(1)),
    position: positionSchema.optional()
  })
  .strict();

export const createTestQuestionPayloadSchema = z
  .object({
    materialId: idSchema,
    text: textSchema,
    position: positionSchema.optional()
  })
  .strict();

export const updateTestQuestionPayloadSchema = z
  .object({
    text: textSchema.optional(),
    position: positionSchema.optional()
  })
  .strict();

export const createAnswerOptionPayloadSchema = z
  .object({
    questionId: idSchema,
    text: textSchema,
    isCorrect: z.boolean().optional(),
    position: positionSchema.optional()
  })
  .strict();

export const updateAnswerOptionPayloadSchema = z
  .object({
    text: textSchema.optional(),
    isCorrect: z.boolean().optional(),
    position: positionSchema.optional()
  })
  .strict();
