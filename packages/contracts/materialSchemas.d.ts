import { z } from 'zod';
import type { MATERIAL_TYPES } from './materials';
import type {
  CreateAnswerOptionPayload,
  CreateMaterialPayload,
  CreateTestQuestionPayload,
  MaterialType,
  UpdateAnswerOptionPayload,
  UpdateMaterialPayload,
  UpdateTestQuestionPayload
} from './materials';

export declare const materialTypes: typeof MATERIAL_TYPES;
export declare const materialTypeSchema: z.ZodType<MaterialType>;
export declare const createMaterialPayloadSchema: z.ZodType<CreateMaterialPayload>;
export declare const updateMaterialPayloadSchema: z.ZodType<UpdateMaterialPayload>;
export declare const createTestQuestionPayloadSchema: z.ZodType<CreateTestQuestionPayload>;
export declare const updateTestQuestionPayloadSchema: z.ZodType<UpdateTestQuestionPayload>;
export declare const createAnswerOptionPayloadSchema: z.ZodType<CreateAnswerOptionPayload>;
export declare const updateAnswerOptionPayloadSchema: z.ZodType<UpdateAnswerOptionPayload>;
